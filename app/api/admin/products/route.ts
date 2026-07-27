import { requireAdminApi } from '@/lib/auth/admin'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const { data, error } = await db.from('products').select('*, category:categories(name)').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

export async function POST(req: Request) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const body = await req.json()
  const { data, error } = await db.from('products').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
