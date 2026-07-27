import { requireAdminApi } from '@/lib/auth/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// We store settings as a single row in a site_settings table (key/value JSON)
// Fallback: use delivery_settings table id=1 and store extra as jsonb
// Simplest: store as a single record in a dedicated table

export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  // Try site_settings table first, fall back gracefully
  const { data, error } = await db.from('site_settings').select('id,site_name,site_tagline,site_description,logo_url,favicon_url,contact_email,contact_phone,contact_address,contact_city,instagram_url,facebook_url,tiktok_url,youtube_url,pinterest_url,whatsapp_number,whatsapp_message,mp_public_key,banner_enabled,banner_text,banner_color,business_hours,meta_title,meta_description,og_image_url').limit(1).maybeSingle()
  if (error && error.code !== 'PGRST116') {
    // Table might not exist yet — return empty defaults
    return NextResponse.json({ data: null })
  }
  return NextResponse.json({ data })
}

export async function PUT(req: NextRequest) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const body = await req.json()
  delete body.mp_access_token

  // Upsert settings row (id=1)
  const { data, error } = await db
    .from('site_settings')
    .upsert({ id: 1, ...body, updated_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
