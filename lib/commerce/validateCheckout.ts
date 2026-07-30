import { createAdminClient } from '@/lib/supabase/server'
import { FALLBACK_SHIPPING_ZONES, fallbackProductByCartIdentity } from '@/lib/commerce/catalog'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type CanonicalItem = { id:string; product_id:string | null; slug:string; name:string; image:string | null; price:number; quantity:number }

export function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

/**
 * Valida y recalcula TODO server-side a partir de lo que manda el navegador:
 * precios reales de la base de datos (nunca confía en el precio del cliente),
 * stock disponible, zona de envío real, y cupón vigente con límite de uso.
 *
 * Se usa desde create-preference (Mercado Pago) y create-transfer-order
 * (transferencia bancaria) para que ambos caminos de pago compartan
 * exactamente la misma validación — si se corrige algo acá, se corrige
 * para los dos métodos de pago a la vez.
 */
export async function buildValidatedCheckout(body: any) {
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
    throw new Error('Datos de compra inválidos')
  }

  const db = createAdminClient()
  const slugs = rawItems.map((item: any) => text(item.slug, 200)).filter(Boolean)
  const { data: databaseProducts } = slugs.length
    ? await db.from('products').select('id,slug,name,price,stock,images,is_active').in('slug', slugs).eq('is_active', true)
    : { data: [] as any[] }

  const items: CanonicalItem[] = rawItems.map((raw: any): CanonicalItem => {
    const quantity = Number(raw.quantity)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) throw new Error('Cantidad inválida')
    const databaseProduct = databaseProducts?.find((product: any) => product.slug === raw.slug)
    if (databaseProduct) {
      if (quantity > Number(databaseProduct.stock || 0)) throw new Error(`Stock insuficiente para ${databaseProduct.name}`)
      return { id:databaseProduct.slug, product_id:databaseProduct.id, slug:databaseProduct.slug, name:databaseProduct.name, image:Array.isArray(databaseProduct.images) ? databaseProduct.images[0] || null : null, price:Number(databaseProduct.price), quantity }
    }
    const fallback = fallbackProductByCartIdentity(raw)
    if (!fallback || quantity > fallback.stock) throw new Error('Producto inválido o sin stock')
    return { id:fallback.slug, product_id:null, slug:fallback.slug, name:fallback.name, image:null, price:fallback.price, quantity }
  })

  const subtotal = items.reduce((sum: number, item: CanonicalItem) => sum + item.price * item.quantity, 0)
  if (!Number.isSafeInteger(subtotal) || subtotal <= 0) throw new Error('Total inválido')

  const shippingZoneId = text(body.shipping_zone_id, 100)
  let shippingZone: any = null
  if (UUID.test(shippingZoneId)) {
    const { data } = await db.from('shipping_zones').select('id,name,price,free_above,is_active').eq('id', shippingZoneId).eq('is_active', true).maybeSingle()
    shippingZone = data
  }
  shippingZone ||= FALLBACK_SHIPPING_ZONES.find(zone => zone.id === shippingZoneId)
  if (!shippingZone) throw new Error('Zona de envío inválida')
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
      throw new Error('Cupón no válido')
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
  if (!Number.isSafeInteger(total) || total < 100) throw new Error('Total de compra inválido')

  const deliveryDate = text(body.delivery_date, 10)
  if (deliveryDate && (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryDate) || new Date(`${deliveryDate}T23:59:59`) < new Date())) {
    throw new Error('Fecha de entrega inválida')
  }

  return { db, customer, items, subtotal, shippingZone, shippingAmount, discountAmount, couponId, couponCode, total, deliveryDate }
}

type CustomerInput = { email:string; first_name:string; last_name:string; phone:string; address_line1:string; city:string; state:string }

/** Busca o crea el cliente en la tabla customers, devuelve su id. */
export async function upsertCustomer(db: ReturnType<typeof createAdminClient>, customer: CustomerInput) {
  const { data: existing } = await db.from('customers').select('id').eq('email', customer.email).maybeSingle()
  if (existing) return existing.id as string
  const { data: created } = await db.from('customers').insert({ email:customer.email, first_name:customer.first_name, last_name:customer.last_name, phone:customer.phone, address_line1:customer.address_line1, city:customer.city, state:customer.state, country:'Chile' }).select('id').single()
  return created?.id || null
}

export function generateOrderNumber() {
  return `MAKA-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}
