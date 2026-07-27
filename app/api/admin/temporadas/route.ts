import { requireAdminApi } from '@/lib/auth/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const { data, error } = await db.from('seasons').select('*, season_products(product_id, products(name,images,price))').order('starts_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const body = await req.json()
  const { product_ids, ...season } = body
  const { data, error } = await db.from('seasons').insert(season).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (product_ids?.length) await db.from('season_products').insert(product_ids.map((pid: string) => ({ season_id: data.id, product_id: pid })))
  return NextResponse.json({ data }, { status: 201 })
}
