'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }

export default function DestacadosPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState<string|null>(null)
  const [search, setSearch] = useState('')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/products?all=1')
    const d = await r.json()
    setProducts(d.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 2800) }

  const toggle = async (p: any) => {
    const r = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !p.is_featured })
    })
    if (r.ok) {
      toast(p.is_featured ? '✦ Quitado de destacados' : '✦ Marcado como destacado')
      load()
    }
  }

  const toggleNew = async (p: any) => {
    const r = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_new: !p.is_new })
    })
    if (r.ok) { toast('★ Actualizado'); load() }
  }

  const featured = products.filter(p => p.is_featured)
  const filtered = products.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Vitrina</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:8 }}>Destacados & Novedades</h1>
      <p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', marginBottom:28 }}>Controla qué productos aparecen en la portada de la tienda.</p>

      {msg && <div style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'10px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>{msg}</div>}

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:28 }}>
        {[
          { label:'Destacados en home', value: featured.length, color:'#E8B84B' },
          { label:'Marcados como Nuevo', value: products.filter(p=>p.is_new).length, color:'#8B7CF8' },
          { label:'Total productos activos', value: products.filter(p=>p.is_active).length, color:'#4A9B8E' },
        ].map(k => (
          <div key={k.label} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'18px 20px' }}>
            <div style={{ fontSize:10, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.8rem', color:k.color, fontWeight:700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Destacados actuales */}
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22, marginBottom:24 }}>
        <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#E8B84B', marginBottom:16 }}>⭐ Destacados en Portada</h3>
        {featured.length === 0 ? (
          <p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', padding:'20px 0' }}>Ningún producto destacado. Actívalos desde la tabla de abajo.</p>
        ) : (
          <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
            {featured.map((p: any) => (
              <div key={p.id} style={{ background:'rgba(200,134,10,0.08)', border:'1px solid rgba(200,134,10,0.28)', padding:'10px 14px', display:'flex', alignItems:'center', gap:10, minWidth:180 }}>
                {p.images?.[0] && <img src={p.images[0]} style={{ width:36, height:36, objectFit:'cover' }} alt="" />}
                <div>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{p.name}</div>
                  {p.is_new && <span style={{ fontSize:9, letterSpacing:1, color:'#8B7CF8', fontFamily:'monospace' }}>★ NUEVO</span>}
                </div>
                <button onClick={() => toggle(p)} title="Quitar de destacados" style={{ marginLeft:'auto', background:'none', border:'none', color:'#D4726A', cursor:'pointer', fontSize:16 }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Todos los productos */}
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(200,134,10,0.12)', display:'flex', alignItems:'center', gap:14 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#FDF6E8', flex:1 }}>Todos los Productos</h3>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar producto..." style={{ ...I, width:220 }} />
        </div>
        {loading ? (
          <div style={{ padding:'40px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Cargando...</div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
                {['Producto','Categoría','Precio','⭐ Destacado','★ Nuevo'].map(h => (
                  <th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'12px 14px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p: any) => (
                <tr key={p.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)', opacity: p.is_active ? 1 : 0.45 }}>
                  <td style={{ padding:'11px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} style={{ width:38, height:38, objectFit:'cover', border:'1px solid rgba(200,134,10,0.2)' }} alt="" />
                        : <div style={{ width:38, height:38, background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>✦</div>
                      }
                      <div>
                        <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{p.name}</div>
                        {!p.is_active && <span style={{ fontSize:9, color:'#D4726A', fontFamily:'monospace' }}>OCULTO</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding:'11px 14px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{p.category?.name || '—'}</td>
                  <td style={{ padding:'11px 14px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B' }}>
                    {new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(p.price)}
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <button
                      onClick={() => toggle(p)}
                      style={{ background: p.is_featured ? 'rgba(232,184,75,0.18)' : 'rgba(10,6,20,0.5)', border: p.is_featured ? '1px solid #E8B84B' : '1px solid rgba(200,134,10,0.25)', color: p.is_featured ? '#E8B84B' : '#A89070', padding:'5px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12, transition:'all 0.2s' }}
                    >
                      {p.is_featured ? '⭐ Sí' : '○ No'}
                    </button>
                  </td>
                  <td style={{ padding:'11px 14px' }}>
                    <button
                      onClick={() => toggleNew(p)}
                      style={{ background: p.is_new ? 'rgba(139,124,248,0.18)' : 'rgba(10,6,20,0.5)', border: p.is_new ? '1px solid #8B7CF8' : '1px solid rgba(139,124,248,0.25)', color: p.is_new ? '#8B7CF8' : '#A89070', padding:'5px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12, transition:'all 0.2s' }}
                    >
                      {p.is_new ? '★ Sí' : '○ No'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
