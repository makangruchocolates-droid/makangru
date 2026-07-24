import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const body = await req.json()
  const { product_ids, ...season } = body
  const { data, error } = await db.from('seasons').update({ ...season, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (product_ids !== undefined) {
    await db.from('season_products').delete().eq('season_id', id)
    if (product_ids.length) await db.from('season_products').insert(product_ids.map((pid: string) => ({ season_id: id, product_id: pid })))
  }
  return NextResponse.json({ data })
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  await db.from('season_products').delete().eq('season_id', id)
  const { error } = await db.from('seasons').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
