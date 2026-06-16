import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// We store settings as a single row in a site_settings table (key/value JSON)
// Fallback: use delivery_settings table id=1 and store extra as jsonb
// Simplest: store as a single record in a dedicated table

export async function GET() {
  const db = createAdminClient()
  // Try site_settings table first, fall back gracefully
  const { data, error } = await db.from('site_settings').select('*').limit(1).maybeSingle()
  if (error && error.code !== 'PGRST116') {
    // Table might not exist yet — return empty defaults
    return NextResponse.json({ data: null })
  }
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest) {
  const db = createAdminClient()
  const body = await req.json()

  // Upsert settings row (id=1)
  const { data, error } = await db
    .from('site_settings')
    .upsert({ id: 1, ...body, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
