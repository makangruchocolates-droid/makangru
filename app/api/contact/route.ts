import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function POST(req: NextRequest) {
  const body = await req.json()
  if (!body.name || !body.email || !body.message) return NextResponse.json({ error: 'Campos requeridos' }, { status: 400 })
  const db = createAdminClient()
  const { error } = await db.from('contact_messages').insert(body)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
