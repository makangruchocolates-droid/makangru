'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 12px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }

const PALETTES = ['#C8860A,#E8B84B','#4A9B8E,#6BBDB0','#8B7CF8,#A99EF8','#D4726A,#E89B94','#5CB85C,#82C882']

export default function TemporadasPage() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string|null>(null)
  const [msg, setMsg] = useState<{text:string,ok:boolean}|null>(null)
  const [saving, setSaving] = useState(false)

  const EMPTY = { name:'', slug:'', description:'', starts_at:'', ends_at:'', color_start:'#C8860A', color_end:'#E8B84B', is_active:true, banner_image:'', badge_text:'' }
  const [form, setForm] = useState({...EMPTY})
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const load = async () => {
    setLoading(true)
    const [r1,r2] = await Promise.all([
      fetch('/api/admin/temporadas').then(r=>r.json()),
      fetch('/api/admin/products').then(r=>r.json()),
    ])
    setSeasons(r1.data||[])
    setProducts(r2.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const toast = (text:string,ok=true)=>{ setMsg({text,ok}); setTimeout(()=>setMsg(null),3000) }
  const setF = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))

  const openNew = ()=>{ setForm({...EMPTY}); setSelectedProducts([]); setEditing(null); setShowForm(true) }
  const openEdit = (s:any)=>{
    setForm({ name:s.name, slug:s.slug||'', description:s.description||'', starts_at:s.starts_at?s.starts_at.split('T')[0]:'', ends_at:s.ends_at?s.ends_at.split('T')[0]:'', color_start:s.color_start||'#C8860A', color_end:s.color_end||'#E8B84B', is_active:s.is_active, banner_image:s.banner_image||'', badge_text:s.badge_text||'' })
    setSelectedProducts((s.season_products||[]).map((sp:any)=>sp.product_id))
    setEditing(s.id); setShowForm(true)
  }

  const toggleProduct = (pid:string)=>setSelectedProducts(p=>p.includes(pid)?p.filter(x=>x!==pid):[...p,pid])

  const save = async ()=>{
    if (!form.name) return toast('El nombre es obligatorio',false)
    setSaving(true)
    const sl = form.slug || form.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-')
    const url = editing?`/api/admin/temporadas/${editing}`:'/api/admin/temporadas'
    const method = editing?'PUT':'POST'
    const r = await fetch(url,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,slug:sl,product_ids:selectedProducts})})
    if (r.ok){ toast(editing?'✦ Temporada actualizada':'✦ Temporada creada'); setShowForm(false); load() }
    else { const d=await r.json(); toast(`Error: ${d.error}`,false) }
    setSaving(false)
  }

  const del = async(id:string)=>{
    if(!confirm('¿Eliminar temporada?')) return
    await fetch(`/api/admin/temporadas/${id}`,{method:'DELETE'})
    toast('Eliminada'); load()
  }

  const toggleActive = async(s:any)=>{
    await fetch(`/api/admin/temporadas/${s.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_active:!s.is_active})})
    load()
  }

  const now = new Date()
  const active = seasons.filter(s=>s.is_active && new Date(s.starts_at)<=now && (!s.ends_at||new Date(s.ends_at)>=now))
  const upcoming = seasons.filter(s=>new Date(s.starts_at)>now)
  const past = seasons.filter(s=>s.ends_at && new Date(s.ends_at)<now)

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <p style={{fontSize:11,letterSpacing:4,color:'#C8860A',textTransform:'uppercase',marginBottom:6,fontFamily:'Georgia,serif'}}>🌿 Catálogo</p>
          <h1 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'2rem',color:'#FDF6E8'}}>Temporadas & Menú Estacional</h1>
        </div>
        <button onClick={openNew} style={{background:'linear-gradient(135deg,#C8860A,#E8B84B)',color:'#02000A',padding:'10px 20px',border:'none',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13,fontWeight:700}}>+ Nueva Temporada</button>
      </div>

      {msg && <div style={{background:msg.ok?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)',border:`1px solid ${msg.ok?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`,color:msg.ok?'#4A9B8E':'#D4726A',padding:'10px 14px',marginBottom:16,fontFamily:'Georgia,serif',fontSize:13}}>{msg.text}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:24}}>
        {[{label:'Activas ahora',items:active,color:'#4A9B8E'},{label:'Próximas',items:upcoming,color:'#E8B84B'},{label:'Finalizadas',items:past,color:'#A89070'}].map(g=>(
          <div key={g.label} style={{background:'rgba(10,6,20,0.85)',border:'1px solid rgba(200,134,10,0.18)',padding:'16px 18px'}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#A89070',textTransform:'uppercase',marginBottom:8,fontFamily:'Georgia,serif'}}>{g.label}</div>
            <div style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1.8rem',color:g.color,fontWeight:700}}>{g.items.length}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{background:'rgba(10,6,20,0.95)',border:'1px solid rgba(200,134,10,0.3)',padding:24,marginBottom:24}}>
          <h3 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1rem',color:'#E8B84B',marginBottom:18}}>{editing?'Editar Temporada':'Nueva Temporada'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <div style={{gridColumn:'1/-1'}}><label style={L}>Nombre *</label><input style={I} value={form.name} onChange={e=>setF('name',e.target.value)} placeholder="Colección Invierno 2025, Pascua..." /></div>
            <div><label style={L}>Fecha de inicio</label><input style={I} type="date" value={form.starts_at} onChange={e=>setF('starts_at',e.target.value)} /></div>
            <div><label style={L}>Fecha de término</label><input style={I} type="date" value={form.ends_at} onChange={e=>setF('ends_at',e.target.value)} /></div>
            <div style={{gridColumn:'1/-1'}}><label style={L}>Descripción</label><textarea style={{...I,height:64,resize:'vertical'}} value={form.description} onChange={e=>setF('description',e.target.value)} /></div>
            <div><label style={L}>Badge / Etiqueta</label><input style={I} value={form.badge_text} onChange={e=>setF('badge_text',e.target.value)} placeholder="🌿 Temporada" /></div>
            <div><label style={L}>Imagen banner (URL)</label><input style={I} value={form.banner_image} onChange={e=>setF('banner_image',e.target.value)} placeholder="https://..." /></div>

            <div style={{gridColumn:'1/-1'}}>
              <label style={L}>Paleta de colores</label>
              <div style={{display:'flex',gap:10,marginBottom:10}}>
                {PALETTES.map(p=>{
                  const [c1,c2]=p.split(',')
                  return (
                    <button key={p} onClick={()=>{setF('color_start',c1);setF('color_end',c2)}} style={{width:40,height:28,background:`linear-gradient(135deg,${c1},${c2})`,border:form.color_start===c1?'2px solid #fff':'2px solid transparent',cursor:'pointer'}} />
                  )
                })}
              </div>
              <div style={{height:6,background:`linear-gradient(135deg,${form.color_start},${form.color_end})`,marginBottom:6}} />
            </div>

            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13,color:'#F5E6C8',gridColumn:'1/-1'}}>
              <input type="checkbox" checked={form.is_active} onChange={e=>setF('is_active',e.target.checked)} style={{accentColor:'#C8860A'}} /> Temporada activa
            </label>
          </div>

          <div style={{marginTop:18}}>
            <label style={{...L,marginBottom:10}}>Productos en esta temporada ({selectedProducts.length} seleccionados)</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,maxHeight:280,overflowY:'auto',padding:4}}>
              {products.map((p:any)=>(
                <div key={p.id} onClick={()=>toggleProduct(p.id)} style={{background:selectedProducts.includes(p.id)?'rgba(200,134,10,0.15)':'rgba(10,6,20,0.5)',border:`1px solid ${selectedProducts.includes(p.id)?'rgba(200,134,10,0.5)':'rgba(200,134,10,0.15)'}`,padding:'10px 12px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,transition:'all 0.15s'}}>
                  {p.images?.[0] && <img src={p.images[0]} style={{width:28,height:28,objectFit:'cover'}} alt="" />}
                  <span style={{fontFamily:'Georgia,serif',fontSize:12,color:selectedProducts.includes(p.id)?'#E8B84B':'#A89070'}}>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{display:'flex',gap:10,marginTop:18}}>
            <button onClick={save} disabled={saving} style={{background:'linear-gradient(135deg,#C8860A,#E8B84B)',border:'none',color:'#02000A',padding:'10px 22px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13,fontWeight:700}}>{saving?'Guardando...':'Guardar ✦'}</button>
            <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'1px solid rgba(200,134,10,0.28)',color:'#A89070',padding:'10px 16px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13}}>Cancelar</button>
          </div>
        </div>
      )}

      {loading ? <div style={{padding:'60px 0',textAlign:'center',color:'#A89070',fontFamily:'Georgia,serif'}}>Cargando...</div> : (
        <div style={{display:'grid',gap:12}}>
          {seasons.length===0 && <div style={{background:'rgba(10,6,20,0.85)',border:'1px solid rgba(200,134,10,0.18)',padding:'60px 0',textAlign:'center',color:'#A89070',fontFamily:'Georgia,serif'}}>No hay temporadas. <button onClick={openNew} style={{background:'none',border:'none',color:'#C8860A',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13}}>Crear primera →</button></div>}
          {seasons.map((s:any)=>{
            const isNow = s.is_active && new Date(s.starts_at)<=now && (!s.ends_at||new Date(s.ends_at)>=now)
            return (
              <div key={s.id} style={{background:'rgba(10,6,20,0.85)',border:`1px solid ${isNow?'rgba(74,155,142,0.4)':'rgba(200,134,10,0.18)'}`,padding:20}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:6}}>
                      <div style={{width:20,height:20,background:`linear-gradient(135deg,${s.color_start||'#C8860A'},${s.color_end||'#E8B84B'})`}} />
                      <h3 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1rem',color:'#F5E6C8'}}>{s.name}</h3>
                      {s.badge_text && <span style={{background:'rgba(200,134,10,0.2)',color:'#C8860A',padding:'2px 8px',fontSize:11,fontFamily:'Georgia,serif'}}>{s.badge_text}</span>}
                      {isNow && <span style={{background:'rgba(74,155,142,0.2)',color:'#4A9B8E',padding:'2px 8px',fontSize:10,fontFamily:'monospace'}}>ACTIVA AHORA</span>}
                    </div>
                    {s.description && <p style={{fontFamily:'Georgia,serif',fontSize:12,color:'#A89070',marginBottom:8}}>{s.description}</p>}
                    <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                      {s.starts_at && <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#A89070'}}>Inicio: {new Date(s.starts_at).toLocaleDateString('es-CL')}</span>}
                      {s.ends_at && <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#A89070'}}>Término: {new Date(s.ends_at).toLocaleDateString('es-CL')}</span>}
                      <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#C8860A'}}>{(s.season_products||[]).length} productos</span>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <button onClick={()=>toggleActive(s)} style={{background:s.is_active?'rgba(74,155,142,0.15)':'rgba(200,134,10,0.1)',border:`1px solid ${s.is_active?'rgba(74,155,142,0.4)':'rgba(200,134,10,0.25)'}`,color:s.is_active?'#4A9B8E':'#A89070',padding:'5px 14px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12}}>
                      {s.is_active?'✓ Activa':'○ Inactiva'}
                    </button>
                    <button onClick={()=>openEdit(s)} style={{background:'rgba(200,134,10,0.1)',border:'1px solid rgba(200,134,10,0.3)',color:'#C8860A',padding:'5px 14px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12}}>Editar</button>
                    <button onClick={()=>del(s.id)} style={{background:'none',border:'1px solid rgba(212,114,106,0.3)',color:'#D4726A',padding:'5px 12px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12}}>✕</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
