import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, requestIp } from '@/lib/security/rateLimit'
import { buildValidatedCheckout, upsertCustomer, generateOrderNumber } from '@/lib/commerce/validateCheckout'
import { createPreference } from '@/lib/mercadopago/client'

export async function POST(req: NextRequest) {
  const limited = rateLimit(`checkout:${requestIp(req)}`, 8, 10 * 60_000)
  if (!limited.allowed) {
    return NextResponse.json({ error: 'Demasiados intentos. Intenta más tarde.' }, { status: 429, headers: { 'Retry-After': String(limited.retryAfter) } })
  }

  try {
    const body = await req.json()
    const { db, customer, items, subtotal, shippingZone, shippingAmount, discountAmount, couponId, couponCode, total, deliveryDate } = await buildValidatedCheckout(body)
    const customerId = await upsertCustomer(db, customer)
    const orderNumber = generateOrderNumber()

    const { data: order, error: orderError } = await db.from('orders').insert({
      order_number: orderNumber, customer_id: customerId, status: 'pending', payment_status: 'pending',
      payment_method: 'mercadopago',
      subtotal, discount_amount: discountAmount, shipping_amount: shippingAmount, total,
      coupon_id: couponId, coupon_code: couponCode,
      shipping_zone_id: /^[0-9a-f-]{36}$/i.test(String(shippingZone.id)) ? shippingZone.id : null,
      shipping_zone_name: shippingZone.name, delivery_date: deliveryDate || null,
      customer_email: customer.email, customer_phone: customer.phone,
      customer_name: `${customer.first_name} ${customer.last_name}`,
      shipping_address: { line1: customer.address_line1, city: customer.city, state: customer.state, country: 'Chile' },
      notes: customer.notes || null,
    }).select().single()
    if (orderError || !order) return NextResponse.json({ error: 'No se pudo crear la orden' }, { status: 500 })

    const { error: itemError } = await db.from('order_items').insert(items.map(item => ({
      order_id: order.id, product_id: item.product_id, product_name: item.name, product_image: item.image,
      unit_price: item.price, quantity: item.quantity, subtotal: item.price * item.quantity,
    })))
    if (itemError) {
      await db.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'No se pudo crear el detalle de la orden' }, { status: 500 })
    }

    try {
      const preference = await createPreference({ customer, orderId: order.id, total })
      return NextResponse.json({ order_id: order.id, order_number: orderNumber, total, init_point: preference.init_point, sandbox_init_point: preference.sandbox_init_point })
    } catch {
      await db.from('order_items').delete().eq('order_id', order.id)
      await db.from('orders').delete().eq('id', order.id)
      return NextResponse.json({ error: 'Mercado Pago no está disponible. Intenta con transferencia o vuelve más tarde.' }, { status: 503 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Solicitud inválida' }, { status: 400 })
  }
}
