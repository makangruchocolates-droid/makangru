'use client'
import { useState, useEffect } from 'react'

export default function MensajesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any|null>(null)
  const [filter, setFilter] = useState<'all'|'unread'|'read'>('all')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/messages')
    const d = await r.json()
    setMessages(d.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const markRead = async (id: string, is_read: boolean) => {
    await fetch(`/api/admin/messages/${id}`, {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ is_read })
    })
    load()
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este mensaje?')) return
    await fetch(`/api/admin/messages/${id}`, { method:'DELETE' })
    setSelected(null)
    load()
  }

  const openMsg = (m: any) => {
    setSelected(m)
    if (!m.is_read) markRead(m.id, true)
  }

  const filtered = messages.filter(m =>
    filter === 'all' ? true : filter === 'unread' ? !m.is_read : m.is_read
  )
  const unread = messages.filter(m => !m.is_read).length

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Comunicaciones</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>
            Mensajes {unread > 0 && <span style={{ background:'#D4726A', color:'#fff', fontSize:14, borderRadius:10, padding:'2px 9px', marginLeft:8, verticalAlign:'middle', fontFamily:'Georgia,serif' }}>{unread}</span>}
          </h1>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {(['all','unread','read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter===f ? 'rgba(200,134,10,0.2)' : 'transparent', border:'1px solid rgba(200,134,10,0.3)', color: filter===f ? '#E8B84B' : '#A89070', padding:'7px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>
              {f === 'all' ? 'Todos' : f === 'unread' ? 'No leídos' : 'Leídos'}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:20 }}>
        {/* Lista */}
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
          {loading ? (
            <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay mensajes</div>
          ) : filtered.map((m: any) => (
            <div key={m.id} onClick={() => openMsg(m)}
              style={{ padding:'14px 18px', borderBottom:'1px solid rgba(200,134,10,0.1)', cursor:'pointer', background: selected?.id === m.id ? 'rgba(200,134,10,0.1)' : m.is_read ? 'transparent' : 'rgba(139,124,248,0.06)', transition:'background 0.15s' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:13, color: m.is_read ? '#A89070' : '#F5E6C8', fontWeight: m.is_read ? 'normal' : 'bold' }}>
                  {!m.is_read && <span style={{ color:'#8B7CF8', marginRight:6 }}>●</span>}
                  {m.name}
                </div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#A89070' }}>
                  {new Date(m.created_at).toLocaleDateString('es-CL')}
                </div>
              </div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#C8860A', marginBottom:3 }}>{m.subject || '(sin asunto)'}</div>
              <div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#A89070' }}>{m.message.substring(0,80)}…</div>
            </div>
          ))}
        </div>

        {/* Detalle */}
        {selected && (
          <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:24 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.1rem', color:'#FDF6E8', marginBottom:4 }}>{selected.subject || '(sin asunto)'}</h3>
                <div style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{new Date(selected.created_at).toLocaleString('es-CL')}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', color:'#A89070', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>

            <div style={{ background:'rgba(200,134,10,0.06)', border:'1px solid rgba(200,134,10,0.15)', padding:14, marginBottom:18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Nombre',selected.name],['Email',selected.email],['Teléfono',selected.phone||'—']].map(([k,v]) => (
                  <div key={k}>
                    <div style={{ fontSize:9, letterSpacing:2, color:'#C8860A', fontFamily:'Georgia,serif', textTransform:'uppercase', marginBottom:3 }}>{k}</div>
                    <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontFamily:'Georgia,serif', fontSize:14, color:'#F5E6C8', lineHeight:1.75, marginBottom:22, whiteSpace:'pre-wrap' }}>{selected.message}</div>

            <div style={{ display:'flex', gap:10 }}>
              <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject||'Tu mensaje a MAKANGRU')}`}
                style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'9px 18px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12, fontWeight:700 }}>
                ✉ Responder por mail
              </a>
              {selected.phone && (
                <a href={`https://wa.me/${selected.phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${selected.name}, gracias por contactar MAKANGRU ✦`)}`}
                  target="_blank" rel="noreferrer"
                  style={{ background:'rgba(74,155,142,0.15)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'9px 18px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>
                  WhatsApp
                </a>
              )}
              <button onClick={() => markRead(selected.id, !selected.is_read)}
                style={{ background:'transparent', border:'1px solid rgba(200,134,10,0.3)', color:'#A89070', padding:'9px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:11 }}>
                {selected.is_read ? 'Marcar no leído' : 'Marcar leído'}
              </button>
              <button onClick={() => del(selected.id)}
                style={{ marginLeft:'auto', background:'none', border:'1px solid rgba(212,114,106,0.35)', color:'#D4726A', padding:'9px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:11 }}>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
