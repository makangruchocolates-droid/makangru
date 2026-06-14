import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 })
  const supabase = await createClient()
  const { data: c } = await supabase.from('coupons').select('*').eq('code', code.toUpperCase()).eq('is_active', true).single()
  if (!c) return NextResponse.json({ error: 'Cupón no válido' }, { status: 404 })
  if (c.expires_at && new Date(c.expires_at) < new Date()) return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 })
  if (c.usage_limit && c.usage_count >= c.usage_limit) return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 })
  if (subtotal < c.min_order_amount) return NextResponse.json({ error: `Monto mínimo: ${c.min_order_amount}` }, { status: 400 })
  let discount = 0
  if (c.type === 'percentage') { discount = Math.round(subtotal * c.value / 100); if (c.max_discount) discount = Math.min(discount, c.max_discount) }
  else if (c.type === 'fixed') discount = Math.min(c.value, subtotal)
  return NextResponse.json({ valid: true, code: c.code, type: c.type, value: c.value, discount, description: c.description })
}
