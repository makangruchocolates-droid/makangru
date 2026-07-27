import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/security/rateLimit'
export async function POST(req: NextRequest) {
  const limited = rateLimit(`contact:${requestIp(req)}`, 5, 15 * 60_000)
  if (!limited.allowed) return NextResponse.json({ error:'Demasiados mensajes. Intenta más tarde.' }, { status:429, headers:{'Retry-After':String(limited.retryAfter)} })
  const body = await req.json()
  const clean = {
    name: typeof body.name === 'string' ? body.name.trim().slice(0, 200) : '',
    email: typeof body.email === 'string' ? body.email.trim().toLowerCase().slice(0, 255) : '',
    phone: typeof body.phone === 'string' ? body.phone.trim().slice(0, 30) : '',
    subject: typeof body.subject === 'string' ? body.subject.trim().slice(0, 200) : '',
    message: typeof body.message === 'string' ? body.message.trim().slice(0, 3000) : '',
  }
  if (!clean.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email) || clean.message.length < 5) return NextResponse.json({ error: 'Campos inválidos' }, { status: 400 })
  const db = createAdminClient()
  const { error } = await db.from('contact_messages').insert(clean)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
