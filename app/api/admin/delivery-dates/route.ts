import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db.from('delivery_settings').select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
export async function PUT(req: NextRequest) {
  const db = createAdminClient(); const body = await req.json()
  const { data: ex } = await db.from('delivery_settings').select('id').single()
  const result = ex
    ? await db.from('delivery_settings').update({ ...body, updated_at: new Date().toISOString() }).eq('id', ex.id).select().single()
    : await db.from('delivery_settings').insert(body).select().single()
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 400 })
  return NextResponse.json({ data: result.data })
}
