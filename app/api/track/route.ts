import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Endpoint público (sin auth) — lo llama el navegador del cliente cada vez
// que ocurre un evento de marketing (clic WhatsApp, abrir catálogo, etc.)
// Se usa "fire and forget" desde lib/analytics.ts, así que siempre responde
// rápido y nunca bloquea la experiencia del usuario si falla.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { event_name, event_params, page_path } = body
    if (!event_name) return NextResponse.json({ error: 'event_name requerido' }, { status: 400 })

    const db = createAdminClient()
    await db.from('analytics_events').insert({
      event_name,
      event_params: event_params || {},
      page_path: page_path || null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Nunca devolvemos error 500 ruidoso por esto — no es crítico
    return NextResponse.json({ ok: false })
  }
}
