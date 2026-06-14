import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = createAdminClient(); const body = await req.json()
  const update: any = { ...body }
  if (body.status === 'shipped' && !body.shipped_at) update.shipped_at = new Date().toISOString()
  if (body.status === 'delivered' && !body.delivered_at) update.delivered_at = new Date().toISOString()
  const { data, error } = await db.from('orders').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
