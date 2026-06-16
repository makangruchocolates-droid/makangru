'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width: '100%', background: '#0A0614', border: '1px solid rgba(200,134,10,0.28)', color: '#F5E6C8', padding: '10px 13px', fontFamily: 'Georgia,serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }
const L: React.CSSProperties = { display: 'block', fontSize: 10, letterSpacing: 2, color: '#C8860A', textTransform: 'uppercase', marginBottom: 7, fontFamily: 'Georgia,serif' }
const G: React.CSSProperties = { marginBottom: 18 }
const CARD: React.CSSProperties = { background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: 24, marginBottom: 20 }
const TITLE: React.CSSProperties = { fontFamily: 'Cinzel,Georgia,serif', fontSize: '1rem', color: '#E8B84B', marginBottom: 20, paddingBottom: 10, borderBottom: '1px solid rgba(200,134,10,0.15)' }

const DEFAULTS = {
  // Info general
  site_name: 'MAKANGRU',
  site_tagline: 'Atelier de la Alquimia Chocolística',
  site_description: '',
  logo_url: '',
  favicon_url: '',
  // Contacto
  contact_email: '',
  contact_phone: '',
  contact_address: '',
  contact_city: 'Santiago, Chile',
  // Redes sociales
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  youtube_url: '',
  pinterest_url: '',
  // Integraciones
  whatsapp_number: '',
  whatsapp_message: 'Hola MAKANGRU ✦ me gustaría hacer un pedido',
  mp_public_key: '',
  mp_access_token: '',
  // Banners
  banner_enabled: false,
  banner_text: '',
  banner_color: '#C8860A',
  // Horarios
  business_hours: '',
  // SEO
  meta_title: '',
  meta_description: '',
  og_image_url: '',
}

type Settings = typeof DEFAULTS

export default function AjustesPage() {
  const [form, setForm] = useState<Settings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [tab, setTab] = useState<'general'|'contacto'|'redes'|'integraciones'|'seo'>('general')

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.data) setForm(prev => ({ ...prev, ...d.data }))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const set = (k: keyof Settings, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toast = (text: string, ok = true) => { setMsg({ text, ok }); setTimeout(() => setMsg(null), 3000) }

  const save = async () => {
    setSaving(true)
    const r = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (r.ok) toast('✦ Ajustes guardados correctamente')
    else { const d = await r.json(); toast(`Error: ${d.error}`, false) }
    setSaving(false)
  }

  const tabs = [
    { id: 'general', label: '⚙ General' },
    { id: 'contacto', label: '✉ Contacto' },
    { id: 'redes', label: '◈ Redes Sociales' },
    { id: 'integraciones', label: '🔌 Integraciones' },
    { id: 'seo', label: '◎ SEO' },
  ] as const

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#A89070', fontFamily: 'Georgia,serif' }}>Cargando ajustes...</div>

  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: 4, color: '#C8860A', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Georgia,serif' }}>✦ Configuración</p>
      <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '2rem', color: '#FDF6E8', marginBottom: 24 }}>Ajustes del Sitio</h1>

      {msg && (
        <div style={{ background: msg.ok ? 'rgba(74,155,142,0.1)' : 'rgba(212,114,106,0.1)', border: `1px solid ${msg.ok ? 'rgba(74,155,142,0.4)' : 'rgba(212,114,106,0.4)'}`, color: msg.ok ? '#4A9B8E' : '#D4726A', padding: '10px 14px', marginBottom: 18, fontFamily: 'Georgia,serif', fontSize: 13 }}>{msg.text}</div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, borderBottom: '1px solid rgba(200,134,10,0.18)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: tab === t.id ? 'rgba(200,134,10,0.15)' : 'transparent', border: 'none', borderBottom: tab === t.id ? '2px solid #C8860A' : '2px solid transparent', color: tab === t.id ? '#E8B84B' : '#A89070', padding: '10px 18px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13, marginBottom: -1 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* GENERAL */}
      {tab === 'general' && (
        <div>
          <div style={CARD}>
            <div style={TITLE}>Identidad del Sitio</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={G}><label style={L}>Nombre del sitio</label><input style={I} value={form.site_name} onChange={e => set('site_name', e.target.value)} /></div>
              <div style={G}><label style={L}>Tagline</label><input style={I} value={form.site_tagline} onChange={e => set('site_tagline', e.target.value)} /></div>
              <div style={{ ...G, gridColumn: '1/-1' }}><label style={L}>Descripción</label><textarea style={{ ...I, height: 72, resize: 'vertical' }} value={form.site_description} onChange={e => set('site_description', e.target.value)} /></div>
              <div style={G}><label style={L}>URL Logo</label><input style={I} value={form.logo_url} onChange={e => set('logo_url', e.target.value)} placeholder="https://..." /></div>
              <div style={G}><label style={L}>Favicon URL</label><input style={I} value={form.favicon_url} onChange={e => set('favicon_url', e.target.value)} placeholder="https://..." /></div>
            </div>
          </div>

          <div style={CARD}>
            <div style={TITLE}>Banner de Anuncio</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <label style={{ ...L, margin: 0 }}>Mostrar banner</label>
              <button onClick={() => set('banner_enabled', !form.banner_enabled)}
                style={{ background: form.banner_enabled ? 'rgba(74,155,142,0.2)' : 'rgba(10,6,20,0.5)', border: form.banner_enabled ? '1px solid #4A9B8E' : '1px solid rgba(200,134,10,0.25)', color: form.banner_enabled ? '#4A9B8E' : '#A89070', padding: '5px 16px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 12 }}>
                {form.banner_enabled ? '✓ Activo' : '○ Inactivo'}
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 14 }}>
              <div style={G}><label style={L}>Texto del banner</label><input style={I} value={form.banner_text} onChange={e => set('banner_text', e.target.value)} placeholder="🍫 Envío gratis sobre $80.000 ✦" /></div>
              <div style={G}><label style={L}>Color</label><input type="color" value={form.banner_color} onChange={e => set('banner_color', e.target.value)} style={{ width: 60, height: 42, border: '1px solid rgba(200,134,10,0.28)', background: '#0A0614', cursor: 'pointer', padding: 2 }} /></div>
            </div>
            {form.banner_enabled && form.banner_text && (
              <div style={{ background: form.banner_color, color: '#fff', padding: '8px 16px', textAlign: 'center', fontFamily: 'Georgia,serif', fontSize: 13 }}>
                {form.banner_text}
              </div>
            )}
          </div>

          <div style={CARD}>
            <div style={TITLE}>Horarios de Atención</div>
            <div style={G}><label style={L}>Horarios (aparece en contacto/pie)</label><textarea style={{ ...I, height: 80, resize: 'vertical' }} value={form.business_hours} onChange={e => set('business_hours', e.target.value)} placeholder="Lun–Vie 10:00–18:00&#10;Sáb 10:00–14:00" /></div>
          </div>
        </div>
      )}

      {/* CONTACTO */}
      {tab === 'contacto' && (
        <div style={CARD}>
          <div style={TITLE}>Información de Contacto</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={G}><label style={L}>Email de contacto</label><input style={I} type="email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} placeholder="hola@makangru.cl" /></div>
            <div style={G}><label style={L}>Teléfono</label><input style={I} value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} placeholder="+56 9 1234 5678" /></div>
            <div style={{ ...G, gridColumn: '1/-1' }}><label style={L}>Dirección del Atelier</label><input style={I} value={form.contact_address} onChange={e => set('contact_address', e.target.value)} placeholder="Calle, número, comuna" /></div>
            <div style={G}><label style={L}>Ciudad</label><input style={I} value={form.contact_city} onChange={e => set('contact_city', e.target.value)} /></div>
          </div>
        </div>
      )}

      {/* REDES */}
      {tab === 'redes' && (
        <div style={CARD}>
          <div style={TITLE}>Redes Sociales</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {([
              ['instagram_url', 'Instagram URL'],
              ['facebook_url', 'Facebook URL'],
              ['tiktok_url', 'TikTok URL'],
              ['youtube_url', 'YouTube URL'],
              ['pinterest_url', 'Pinterest URL'],
            ] as const).map(([k, label]) => (
              <div key={k} style={G}>
                <label style={L}>{label}</label>
                <input style={I} value={form[k]} onChange={e => set(k, e.target.value)} placeholder="https://..." />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INTEGRACIONES */}
      {tab === 'integraciones' && (
        <div>
          <div style={CARD}>
            <div style={TITLE}>WhatsApp Business</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={G}><label style={L}>Número WhatsApp (con código país)</label><input style={I} value={form.whatsapp_number} onChange={e => set('whatsapp_number', e.target.value)} placeholder="56912345678" /></div>
              <div style={G}><label style={L}>Mensaje predeterminado</label><input style={I} value={form.whatsapp_message} onChange={e => set('whatsapp_message', e.target.value)} /></div>
            </div>
            {form.whatsapp_number && (
              <a href={`https://wa.me/${form.whatsapp_number}?text=${encodeURIComponent(form.whatsapp_message)}`} target="_blank" rel="noreferrer"
                style={{ display: 'inline-block', background: 'rgba(74,155,142,0.15)', border: '1px solid rgba(74,155,142,0.4)', color: '#4A9B8E', padding: '8px 16px', textDecoration: 'none', fontFamily: 'Georgia,serif', fontSize: 12 }}>
                Probar enlace WhatsApp →
              </a>
            )}
          </div>

          <div style={CARD}>
            <div style={TITLE}>MercadoPago</div>
            <div style={{ background: 'rgba(139,124,248,0.08)', border: '1px solid rgba(139,124,248,0.2)', padding: '10px 14px', marginBottom: 18, fontFamily: 'Georgia,serif', fontSize: 12, color: '#8B7CF8' }}>
              ⚠ Las credenciales de MercadoPago deben configurarse en variables de entorno de Vercel para producción. Estos campos son solo de referencia / staging.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div style={G}><label style={L}>Public Key</label><input style={I} value={form.mp_public_key} onChange={e => set('mp_public_key', e.target.value)} placeholder="APP_USR-..." /></div>
              <div style={G}><label style={L}>Access Token</label><input style={{ ...I, fontFamily: 'monospace' }} value={form.mp_access_token} onChange={e => set('mp_access_token', e.target.value)} placeholder="APP_USR-..." type="password" /></div>
            </div>
          </div>
        </div>
      )}

      {/* SEO */}
      {tab === 'seo' && (
        <div style={CARD}>
          <div style={TITLE}>SEO & Metadatos</div>
          <div style={G}><label style={L}>Meta título (aparece en pestaña del navegador)</label><input style={I} value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="MAKANGRU · Chocolatería Artesanal" /></div>
          <div style={G}><label style={L}>Meta descripción</label><textarea style={{ ...I, height: 80, resize: 'vertical' }} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} placeholder="Describe la tienda en máx. 160 caracteres..." /></div>
          <div style={G}><label style={L}>Imagen para compartir en redes (OG Image)</label><input style={I} value={form.og_image_url} onChange={e => set('og_image_url', e.target.value)} placeholder="https://... (1200×630px recomendado)" /></div>
          {form.og_image_url && <img src={form.og_image_url} alt="OG preview" style={{ maxWidth: 320, border: '1px solid rgba(200,134,10,0.2)', marginTop: 8 }} />}
        </div>
      )}

      {/* Guardar */}
      <div style={{ position: 'sticky', bottom: 0, background: 'rgba(2,0,10,0.95)', padding: '14px 0', borderTop: '1px solid rgba(200,134,10,0.15)', display: 'flex', gap: 12 }}>
        <button onClick={save} disabled={saving}
          style={{ background: 'linear-gradient(135deg,#C8860A,#E8B84B)', color: '#02000A', padding: '12px 28px', cursor: 'pointer', fontFamily: 'Georgia,serif', fontSize: 13, letterSpacing: 2, fontWeight: 700, border: 'none', opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Guardando...' : '✦ Guardar Ajustes'}
        </button>
        <span style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#666', alignSelf: 'center' }}>Los cambios se aplican al guardar</span>
      </div>
    </div>
  )
}
