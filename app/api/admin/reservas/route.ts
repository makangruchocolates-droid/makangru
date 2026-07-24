import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db.from('store_reservations').select('*').order('reservation_date', { ascending: true }).order('reservation_time', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
export async function POST(req: NextRequest) {
  const db = createAdminClient()
  const body = await req.json()
  const { data, error } = await db.from('store_reservations').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
