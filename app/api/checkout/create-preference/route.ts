import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago/client'
import { FALLBACK_SHIPPING_ZONES, fallbackProductByCartIdentity } from '@/lib/commerce/catalog'
import { rateLimit, requestIp } from '@/lib/security/rateLimit'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
type CanonicalItem = { id:string; product_id:string | null; slug:string; name:string; image:string | null; price:number; quantity:number }

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(`checkout:${requestIp(req)}`, 8, 10 * 60_000)
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  try {
    const body = await req.json()
    const rawItems = Array.isArray(body.items) ? body.items : []
    const customer = {
      first_name: text(body.customer?.first_name, 100),
      last_name: text(body.customer?.last_name, 100),
      email: text(body.customer?.email, 255).toLowerCase(),
      phone: text(body.customer?.phone, 30),
      address_line1: text(body.customer?.address_line1, 200),
      city: text(body.customer?.city, 100),
      state: text(body.customer?.state, 100),
      notes: text(body.customer?.notes, 500),
    }
    if (!rawItems.length || rawItems.length > 30 || !EMAIL.test(customer.email) || !customer.first_name || !customer.last_name || !customer.phone || !customer.address_line1 || !customer.city) {
      return NextResponse.json({ error: 'Datos de compra inválidos' }, { status: 400 })
    }

    const db = createAdminClient()
    const slugs = rawItems.map((item: any) => text(item.slug, 200)).filter(Boolean)
    const { data: databaseProducts } = slugs.length
      ? await db.from('products').select('id,slug,name,price,stock,images,is_active').in('slug', slugs).eq('is_active', true)
      : { data: [] as any[] }

    const items: CanonicalItem[] = rawItems.map((raw: any): CanonicalItem => {
      const quantity = Number(raw.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Cantidad inválida')
      const databaseProduct = databaseProducts?.find(product => product.slug === raw.slug)
      if (databaseProduct) {
        if (quantity > Number(databaseProduct.stock || 0)) throw new Error(`Stock insuficiente para ${databaseProduct.name}`)
        return { id:databaseProduct.slug, product_id:databaseProduct.id, slug:databaseProduct.slug, name:databaseProduct.name, image:Array.isArray(databaseProduct.images) ? databaseProduct.images[0] || null : null, price:Number(databaseProduct.price), quantity }
      }
      const fallback = fallbackProductByCartIdentity(raw)
      if (!fallback || quantity > fallback.stock) throw new Error('Producto inválido o sin stock')
      return { id:fallback.slug, product_id:null, slug:fallback.slug, name:fallback.name, image:null, price:fallback.price, quantity }
    })

    const subtotal = items.reduce((sum: number, item: CanonicalItem) => sum + item.price * item.quantity, 0)
    if (!Number.isSafeInteger(subtotal) || subtotal <= 0) return NextResponse.json({ error: 'Total inválido' }, { status: 400 })

    const shippingZoneId = text(body.shipping_zone_id, 100)
    let shippingZone: any = null
    if (UUID.test(shippingZoneId)) {
      const { data } = await db.from('shipping_zones').select('id,name,price,free_above,is_active').eq('id', shippingZoneId).eq('is_active', true).maybeSingle()
      shippingZone = data
    }
    shippingZone ||= FALLBACK_SHIPPING_ZONES.find(zone => zone.id === shippingZoneId)
    if (!shippingZone) return NextResponse.json({ error: 'Zona de envío inválida' }, { status: 400 })
    const shippingAmount = shippingZone.free_above && subtotal >= Number(shippingZone.free_above) ? 0 : Number(shippingZone.price)

    let discountAmount = 0
    let couponId: string | null = null
    let couponCode: string | null = null
    const requestedCoupon = text(body.coupon_code, 50).toUpperCase()
    if (requestedCoupon) {
      const { data: coupon } = await db.from('coupons').select('*').eq('code', requestedCoupon).eq('is_active', true).maybeSingle()
      const validDates = coupon && (!coupon.starts_at || new Date(coupon.starts_at) <= new Date()) && (!coupon.expires_at || new Date(coupon.expires_at) >= new Date())
      const hasUsage = coupon && (!coupon.usage_limit || coupon.usage_count < coupon.usage_limit)
      if (!coupon || !validDates || !hasUsage || subtotal < Number(coupon.min_order_amount || 0)) {
        return NextResponse.json({ error: 'Cupón no válido' }, { status: 400 })
      }
      couponId = coupon.id
      couponCode = coupon.code
      if (coupon.type === 'percentage') {
        discountAmount = Math.round(subtotal * Number(coupon.value) / 100)
        if (coupon.max_discount) discountAmount = Math.min(discountAmount, Number(coupon.max_discount))
      } else if (coupon.type === 'fixed') {
        discountAmount = Math.min(Number(coupon.value), subtotal)
      } else if (coupon.type === 'free_shipping') {
        discountAmount = shippingAmount
      }
    }

    const total = subtotal - discountAmount + shippingAmount
    if (!Number.isSafeInteger(total) || total < 100) return NextResponse.json({ error: 'Total de compra inválido' }, { status: 400 })

    const deliveryDate = text(body.delivery_date, 10)
    if (deliveryDate && (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || new Date(`${deliveryDate}T23:59:59`) < new Date())) {
      return NextResponse.json({ error: 'Fecha de entrega inválida' }, { status: 400 })
    }

    let customerId: string | null = null
    const { data: existing } = await db.from('customers').select('id').eq('email', customer.email).maybeSingle()
    if (existing) customerId = existing.id
    else {
      const { data: created } = await db.from('customers').insert({ email:customer.email, first_name:customer.first_name, last_name:customer.last_name, phone:customer.phone, address_line1:customer.address_line1, city:customer.city, state:customer.state, country:'Chile' }).select('id').single()
      customerId = created?.id || null
    }

    const orderNumber = `MAKA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
    const { data: order, error: orderError } = await db.from('orders').insert({
      order_number:orderNumber, customer_id:customerId, status:'pending', payment_status:'pending',
      subtotal, discount_amount:discountAmount, shipping_amount:shippingAmount, total,
      coupon_id:couponId, coupon_code:couponCode,
      shipping_zone_id:UUID.test(String(shippingZone.id)) ? shippingZone.id : null,
      shipping_zone_name:shippingZone.name, delivery_date:deliveryDate || null,
      customer_email:customer.email, customer_phone:customer.phone,
      customer_name:`${customer.first_name} ${customer.last_name}`,
      shipping_address:{ line1:customer.address_line1, city:customer.city, state:customer.state, country:'Chile' },
      notes:customer.notes || null,
    }).select().single()
    if (orderError || !order) return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })

    const { error: itemError } = await db.from('order_items').insert(items.map((item: CanonicalItem) => ({
      order_id:order.id, product_id:item.product_id, product_name:item.name, product_image:item.image,
      unit_price:item.price, quantity:item.quantity, subtotal:item.price * item.quantity,
    })))
    if (itemError) {
      await db.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'No se pudo crear el detalle de la orden' }, { status: 500 })
    }

    const preference = await createPreference({ customer, orderId:order.id, total })
    await db.from('orders').update({ mp_preference_id:preference.id }).eq('id', order.id)
    return NextResponse.json({ init_point:preference.init_point, sandbox_init_point:preference.sandbox_init_point, order_id:order.id, order_number:orderNumber })
  } catch (error: any) {
    return NextResponse.json({ error:error?.message || 'Solicitud inválida' }, { status:400 })
  }
}
