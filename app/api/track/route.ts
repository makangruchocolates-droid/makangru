import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { rateLimit, requestIp } from '@/lib/security/rateLimit'

const ALLOWED_EVENTS = new Set(['pageview','click_pedir_whatsapp','abrir_catalogo','consultar_producto_whatsapp'])

// Endpoint público (sin auth) — lo llama el navegador del cliente cada vez
// que ocurre un evento de marketing (clic WhatsApp, abrir catálogo, etc.)
// Se usa "fire and forget" desde lib/analytics.ts, así que siempre responde
// rápido y nunca bloquea la experiencia del usuario si falla.
export async function POST(req: NextRequest) {
  try {
    const limited = rateLimit(`analytics:${requestIp(req)}`, 120, 10 * 60_000)
    if (!limited.allowed) return NextResponse.json({ ok:false }, { status:429, headers:{'Retry-After':String(limited.retryAfter)} })
    const body = await req.json()
    const { event_name, event_params, page_path } = body
    if (!ALLOWED_EVENTS.has(event_name)) return NextResponse.json({ error: 'Evento inválido' }, { status: 400 })
    const serializedParams = JSON.stringify(event_params || {})
    if (serializedParams.length > 2000) return NextResponse.json({ error:'Parámetros demasiado grandes' }, { status:400 })

    const db = createAdminClient()
    await db.from('analytics_events').insert({
      event_name,
      event_params: JSON.parse(serializedParams),
      page_path: typeof page_path === 'string' ? page_path.slice(0, 500) : null,
    })

    return NextResponse.json({ ok: true })
  } catch {
    // Nunca devolvemos error 500 ruidoso por esto — no es crítico
    return NextResponse.json({ ok: false })
  }
}
