import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getPayment } from '@/lib/mercadopago/client'
export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json()
    if (type !== 'payment') return NextResponse.json({ received: true })
    const payment = await getPayment(String(data?.id))
    const orderId = payment.external_reference
    if (!orderId) return NextResponse.json({ error: 'Sin order_id' }, { status: 400 })
    const db = createAdminClient()
    const { data: order } = await db.from('orders').select('total,coupon_id,customer_id,payment_status').eq('id', orderId).single()
    if (!order) return NextResponse.json({ error: 'Orden inexistente' }, { status: 404 })
    if (payment.currency_id !== 'CLP' || Number(payment.transaction_amount) !== Number(order.total)) {
      return NextResponse.json({ error: 'Monto o moneda no coinciden' }, { status: 400 })
    }
    const map: Record<string, any> = { approved: { status: 'confirmed', payment_status: 'paid', paid_at: new Date().toISOString() }, rejected: { status: 'cancelled', payment_status: 'failed' }, cancelled: { status: 'cancelled', payment_status: 'failed' }, pending: { payment_status: 'pending' } }
    await db.from('orders').update({ ...(map[payment.status || 'pending'] || {}), payment_reference: String(data?.id), payment_method: payment.payment_type_id }).eq('id', orderId)
    if (payment.status === 'approved' && order.payment_status !== 'paid') {
      if (order?.coupon_id) await db.rpc('increment_coupon_usage', { coupon_id: order.coupon_id })
      if (order?.customer_id) await db.rpc('update_customer_stats', { p_customer_id: order.customer_id })
    }
    return NextResponse.json({ success: true })
  } catch(e: any) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
