import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const db = createAdminClient()
  const { data } = await db.from('blocked_delivery_dates').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date')
  return NextResponse.json({ data: data || [] })
}
export async function POST(req: NextRequest) {
  const db = createAdminClient(); const body = await req.json()
  const { data, error } = await db.from('blocked_delivery_dates').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
