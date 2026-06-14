import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const db = createAdminClient()
  const { data } = await db.from('coupons').select('*').order('created_at', { ascending: false })
  return NextResponse.json({ data: data || [] })
}
export async function POST(req: NextRequest) {
  const db = createAdminClient(); const body = await req.json()
  const { data, error } = await db.from('coupons').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
