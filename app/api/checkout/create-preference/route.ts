import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createPreference } from '@/lib/mercadopago/client'
export async function POST(req: NextRequest) {
  try {
    const { items, customer, coupon_code, shipping_zone_id, shipping_zone_name, shipping_amount = 0, delivery_date } = await req.json()
    if (!items?.length || !customer?.email) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    const db = createAdminClient()
    const subtotal = items.reduce((s: number, i: any) => s + i.price * i.quantity, 0)
    let discountAmount = 0; let couponId = null
    if (coupon_code) {
      const { data: coupon } = await db.from('coupons').select('*').eq('code', coupon_code.toUpperCase()).eq('is_active', true).single()
      if (coupon && subtotal >= coupon.min_order_amount) {
        couponId = coupon.id
        if (coupon.type === 'percentage') { discountAmount = Math.round(subtotal * coupon.value / 100); if (coupon.max_discount) discountAmount = Math.min(discountAmount, coupon.max_discount) }
        else if (coupon.type === 'fixed') discountAmount = Math.min(coupon.value, subtotal)
      }
    }
    const total = subtotal - discountAmount + Number(shipping_amount)
    let customerId = null
    const { data: existing } = await db.from('customers').select('id').eq('email', customer.email).single()
    if (existing) customerId = existing.id
    else {
      const { data: nc } = await db.from('customers').insert({ email: customer.email, first_name: customer.first_name, last_name: customer.last_name, phone: customer.phone, address_line1: customer.address_line1, city: customer.city, state: customer.state, country: 'Chile' }).select('id').single()
      if (nc) customerId = nc.id
    }
    const orderNumber = `MAKA-${new Date().getFullYear()}-${String(Math.floor(Math.random()*9000)+1000)}`
    const { data: order, error: oe } = await db.from('orders').insert({
      order_number: orderNumber, customer_id: customerId, status: 'pending', payment_status: 'pending',
      subtotal, discount_amount: discountAmount, shipping_amount: Number(shipping_amount), total,
      coupon_id: couponId, coupon_code: coupon_code?.toUpperCase() || null,
      shipping_zone_id: shipping_zone_id || null, shipping_zone_name: shipping_zone_name || null,
      delivery_date: delivery_date || null,
      customer_email: customer.email, customer_phone: customer.phone,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      shipping_address: { line1: customer.address_line1, city: customer.city, state: customer.state, country: 'Chile' },
      notes: customer.notes || null,
    }).select().single()
    if (oe || !order) return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 })
    await db.from('order_items').insert(items.map((i: any) => ({ order_id: order.id, product_id: i.product_id || i.id, product_name: i.name, product_image: i.image || null, unit_price: i.price, quantity: i.quantity, subtotal: i.price * i.quantity })))
    const pref = await createPreference({ items, customer, orderId: order.id, discount: discountAmount })
    await db.from('orders').update({ mp_preference_id: pref.id }).eq('id', order.id)
    return NextResponse.json({ init_point: pref.init_point, sandbox_init_point: pref.sandbox_init_point, order_id: order.id, order_number: orderNumber })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
