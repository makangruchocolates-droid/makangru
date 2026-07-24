'use client'
import { useState, useEffect, useMemo } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 12px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', boxSizing:'border-box' }
const fmt = (n:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(n)

const TAG_COLORS: Record<string,string> = { VIP:'#E8B84B', Frecuente:'#4A9B8E', Nuevo:'#8B7CF8', Inactivo:'#D4726A' }
const CUSTOM_TAG_PALETTE = ['#C8860A','#4A9B8E','#8B7CF8','#D4726A','#5CB85C','#4A9BC4']

const VIP_THRESHOLD = 200000
const FREQUENT_ORDERS = 6
const NEW_DAYS = 30
const INACTIVE_DAYS = 60

function computeAutoTags(c: any): string[] {
  const tags: string[] = []
  const daysSinceCreated = (Date.now() - new Date(c.created_at).getTime()) / 86400000
  const daysSinceLastOrder = c.last_order_at ? (Date.now() - new Date(c.last_order_at).getTime()) / 86400000 : Infinity
  if (Number(c.total_spent) >= VIP_THRESHOLD) tags.push('VIP')
  if (Number(c.total_orders) >= FREQUENT_ORDERS) tags.push('Frecuente')
  if (daysSinceCreated <= NEW_DAYS) tags.push('Nuevo')
  if (daysSinceLastOrder >= INACTIVE_DAYS && c.total_orders > 0) tags.push('Inactivo')
  return tags
}

const SEGMENTS = [
  { id:'all', label:'Todos' },
  { id:'VIP', label:'VIP' },
  { id:'Frecuente', label:'Frecuentes' },
  { id:'Nuevo', label:'Nuevos' },
  { id:'Inactivo', label:'Inactivos' },
]

export default function ClientesCRM() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any|null>(null)
  const [search, setSearch] = useState('')
  const [seg, setSeg] = useState('all')
  const [noteDraft, setNoteDraft] = useState('')
  const [newTag, setNewTag] = useState('')
  const [msg, setMsg] = useState<string|null>(null)

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/customers')
    const d = await r.json()
    setCustomers(d.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const toast = (m: string) => { setMsg(m); setTimeout(()=>setMsg(null),2500) }

  const enriched = useMemo(() => customers.map(c => ({
    ...c,
    autoTags: computeAutoTags(c),
    customTags: c.custom_tags || [],
  })), [customers])

  const filtered = enriched.filter(c => {
    const allTags = [...c.autoTags, ...c.customTags]
    const matchesSeg = seg === 'all' || c.autoTags.includes(seg)
    const name = `${c.first_name||''} ${c.last_name||''}`.toLowerCase()
    const matchesSearch = !search || name.includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
    return matchesSeg && matchesSearch
  })

  const kpis = [
    { label:'Total clientes', value: enriched.length, color:'#E8B84B' },
    { label:'VIP', value: enriched.filter(c=>c.autoTags.includes('VIP')).length, color:'#E8B84B' },
    { label:'Frecuentes', value: enriched.filter(c=>c.autoTags.includes('Frecuente')).length, color:'#4A9B8E' },
    { label:'Nuevos', value: enriched.filter(c=>c.autoTags.includes('Nuevo')).length, color:'#8B7CF8' },
    { label:'Inactivos', value: enriched.filter(c=>c.autoTags.includes('Inactivo')).length, color:'#D4726A' },
  ]

  const openCustomer = (c: any) => { setSelected(c); setNoteDraft(c.internal_notes || '') }

  const saveNote = async () => {
    if (!selected) return
    await fetch(`/api/admin/customers/${selected.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ internal_notes: noteDraft }) })
    toast('✦ Nota guardada')
    setCustomers(prev => prev.map(c => c.id===selected.id ? { ...c, internal_notes:noteDraft } : c))
    setSelected((s:any)=>({...s, internal_notes:noteDraft}))
  }

  const addCustomTag = async () => {
    if (!selected || !newTag.trim()) return
    const tags = [...(selected.custom_tags||[]), newTag.trim()]
    await fetch(`/api/admin/customers/${selected.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ custom_tags: tags }) })
    setCustomers(prev => prev.map(c => c.id===selected.id ? { ...c, custom_tags:tags } : c))
    setSelected((s:any)=>({...s, custom_tags:tags}))
    setNewTag('')
    toast('✦ Etiqueta agregada')
  }

  const removeCustomTag = async (tag: string) => {
    if (!selected) return
    const tags = (selected.custom_tags||[]).filter((t:string)=>t!==tag)
    await fetch(`/api/admin/customers/${selected.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ custom_tags: tags }) })
    setCustomers(prev => prev.map(c => c.id===selected.id ? { ...c, custom_tags:tags } : c))
    setSelected((s:any)=>({...s, custom_tags:tags}))
  }

  const tagColorFor = (tag: string, idx = 0) => TAG_COLORS[tag] || CUSTOM_TAG_PALETTE[idx % CUSTOM_TAG_PALETTE.length]

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }}>✦ CRM</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Clientes</h1>
        </div>
      </div>

      {msg && <div style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'9px 14px', marginBottom:16, fontFamily:'Georgia,serif', fontSize:13 }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12, marginBottom:20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'14px 16px' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.5rem', color:k.color, fontWeight:700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar cliente..." style={{ ...I, width:220 }} />
        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
          {SEGMENTS.map(s => (
            <button key={s.id} onClick={()=>setSeg(s.id)} style={{ background:seg===s.id?'rgba(200,134,10,0.2)':'transparent', border:'1px solid rgba(200,134,10,0.25)', color:seg===s.id?'#E8B84B':'#A89070', padding:'6px 13px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selected ? '1fr 1fr' : '1fr', gap:20 }}>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', maxHeight:560, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:'50px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Cargando...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'50px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Sin resultados</div>
          ) : filtered.map((c:any) => {
            const allTags = [...c.autoTags, ...c.customTags]
            return (
              <div key={c.id} onClick={()=>openCustomer(c)} style={{ padding:'13px 16px', borderBottom:'1px solid rgba(200,134,10,0.08)', cursor:'pointer', background:selected?.id===c.id?'rgba(200,134,10,0.08)':'transparent', display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#C8860A,#E8B84B)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', fontSize:13, color:'#02000A', fontWeight:700, flexShrink:0 }}>{(c.first_name?.[0]||c.email?.[0]||'?').toUpperCase()}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{c.first_name} {c.last_name}</span>
                    <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:12, color:'#E8B84B', fontWeight:700 }}>{fmt(c.total_spent||0)}</span>
                  </div>
                  <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginTop:3 }}>
                    {allTags.length ? allTags.map((t:string,i:number) => (
                      <span key={t} style={{ background:`${tagColorFor(t,i)}22`, color:tagColorFor(t,i), padding:'1px 7px', fontSize:9, fontFamily:'monospace' }}>{t}</span>
                    )) : <span style={{ fontSize:10, color:'#666', fontFamily:'Georgia,serif' }}>{c.total_orders||0} pedidos</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {selected && (
          <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,#C8860A,#E8B84B)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', fontSize:16, color:'#02000A', fontWeight:700 }}>{(selected.first_name?.[0]||selected.email?.[0]||'?').toUpperCase()}</div>
                <div>
                  <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.1rem', color:'#F5E6C8' }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize:11, color:'#A89070', fontFamily:'Georgia,serif' }}>Cliente desde {new Date(selected.created_at).toLocaleDateString('es-CL')}</div>
                </div>
              </div>
              <button onClick={()=>setSelected(null)} style={{ background:'none', border:'none', color:'#A89070', cursor:'pointer', fontSize:18 }}>✕</button>
            </div>

            <div style={{ background:'rgba(200,134,10,0.06)', border:'1px solid rgba(200,134,10,0.15)', padding:14, marginBottom:16 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[['Email',selected.email],['Teléfono',selected.phone||'—'],['Ciudad',selected.city||'—'],['Último pedido', selected.last_order_at ? new Date(selected.last_order_at).toLocaleDateString('es-CL') : '—']].map(([k,v]) => (
                  <div key={k}><div style={{ fontSize:9, letterSpacing:2, color:'#C8860A', fontFamily:'Georgia,serif', textTransform:'uppercase', marginBottom:3 }}>{k}</div><div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{v}</div></div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
              <div style={{ background:'rgba(10,6,20,0.5)', padding:12, textAlign:'center' }}><div style={{ fontSize:9, color:'#A89070', textTransform:'uppercase', fontFamily:'Georgia,serif' }}>Pedidos</div><div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.3rem', color:'#4A9B8E' }}>{selected.total_orders||0}</div></div>
              <div style={{ background:'rgba(10,6,20,0.5)', padding:12, textAlign:'center' }}><div style={{ fontSize:9, color:'#A89070', textTransform:'uppercase', fontFamily:'Georgia,serif' }}>Total gastado</div><div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.3rem', color:'#E8B84B' }}>{fmt(selected.total_spent||0)}</div></div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>Etiquetas personalizadas</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:8 }}>
                {(selected.custom_tags||[]).map((t:string,i:number) => (
                  <span key={t} onClick={()=>removeCustomTag(t)} style={{ background:`${CUSTOM_TAG_PALETTE[i%CUSTOM_TAG_PALETTE.length]}22`, color:CUSTOM_TAG_PALETTE[i%CUSTOM_TAG_PALETTE.length], padding:'3px 10px', fontSize:11, fontFamily:'Georgia,serif', cursor:'pointer' }} title="Clic para eliminar">{t} ✕</span>
                ))}
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCustomTag()} placeholder="Ej: Alérgico a maní, evento anual..." style={{ ...I, fontSize:12 }} />
                <button onClick={addCustomTag} style={{ background:'#C8860A', border:'none', color:'#02000A', padding:'0 16px', cursor:'pointer', fontWeight:700 }}>+</button>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>Notas internas</div>
              <textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} onBlur={saveNote} rows={4} style={{ ...I, resize:'vertical' }} placeholder="Preferencias, historial de conversación, contexto útil..." />
            </div>

            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {selected.phone && <a href={`https://wa.me/${selected.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" style={{ background:'rgba(74,155,142,0.15)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'8px 14px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>WhatsApp</a>}
              {selected.email && <a href={`mailto:${selected.email}`} style={{ background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.3)', color:'#C8860A', padding:'8px 14px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>Email</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
