'use client'
import { useState, useEffect } from 'react'
const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }
const E = { name:'', slug:'', description:'', icon:'✦', sort_order:0, is_active:true }
function sl(s: string) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') }
export default function CategoriasPage() {
  const [cats, setCats] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(E)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const load = async () => { const r = await fetch('/api/admin/categories'); const d = await r.json(); setCats(d.data||[]) }
  useEffect(() => { load() }, [])
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const save = async () => {
    if (!form.name) return; setLoading(true)
    const payload = { ...form, slug: form.slug||sl(form.name), sort_order: Number(form.sort_order) }
    const isNew = editing === 'new'
    const r = await fetch(isNew?'/api/admin/categories':`/api/admin/categories/${editing}`, { method:isNew?'POST':'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    setLoading(false)
    if (r.ok) { setMsg('✓ Guardado'); setEditing(null); load() } else { const d = await r.json(); setMsg('⚠ '+d.error) }
    setTimeout(()=>setMsg(null),3000)
  }
  const del = async (id: string) => { if (!confirm('¿Eliminar?')) return; await fetch(`/api/admin/categories/${id}`,{method:'DELETE'}); load() }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div><p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Organización</p><h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Categorías</h1></div>
        <button onClick={() => { setEditing('new'); setForm(E) }} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>+ Nueva Categoría</button>
      </div>
      {msg && <div style={{ background:msg.startsWith('✓')?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.startsWith('✓')?'#4A9B8E':'#D4726A', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif' }}>{msg}</div>}
      {editing && (
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.35)', padding:26, marginBottom:22 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', color:'#FDF6E8', marginBottom:20 }}>{editing==='new'?'Nueva Categoría':'Editar Categoría'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={L}>Nombre</label><input value={form.name} onChange={e=>{ set('name',e.target.value); if(editing==='new') set('slug',sl(e.target.value)) }} style={I} placeholder="Bombones Galaxia" /></div>
            <div><label style={L}>Ícono (emoji)</label><input value={form.icon} onChange={e=>set('icon',e.target.value)} style={I} placeholder="❋" /></div>
            <div><label style={L}>Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} style={I} /></div>
            <div><label style={L}>Orden</label><input type="number" value={form.sort_order} onChange={e=>set('sort_order',e.target.value)} style={I} min="0" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={L}>Descripción</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={2} style={{...I,resize:'vertical'}} /></div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, accentColor:'#C8860A' }} />Activa</label>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:18 }}>
            <button onClick={save} disabled={loading} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 26px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>{loading?'Guardando...':'Guardar ✦'}</button>
            <button onClick={()=>setEditing(null)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'11px 18px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
        {cats.map(c => (
          <div key={c.id} style={{ background:'rgba(10,6,20,0.85)', border:`1px solid rgba(200,134,10,${c.is_active?'0.22':'0.08'})`, padding:'18px 22px', opacity:c.is_active?1:0.5 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:26 }}>{c.icon}</span>
                <div><div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#F5E6C8', fontWeight:700 }}>{c.name}</div><div style={{ fontFamily:'monospace', fontSize:10, color:'#A89070' }}>/{c.slug}</div></div>
              </div>
              <span style={{ background:c.is_active?'rgba(74,155,142,0.2)':'rgba(168,144,112,0.2)', color:c.is_active?'#4A9B8E':'#A89070', padding:'2px 8px', fontFamily:'monospace', fontSize:9 }}>{c.is_active?'Activa':'Inactiva'}</span>
            </div>
            {c.description && <p style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070', marginBottom:12 }}>{c.description}</p>}
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{ setEditing(c.id); setForm({...c,sort_order:c.sort_order||0}) }} style={{ flex:1, background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#C8860A', padding:'7px 0', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>Editar</button>
              <button onClick={()=>del(c.id)} style={{ background:'none', border:'1px solid rgba(212,114,106,0.28)', color:'#D4726A', padding:'7px 12px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>✕</button>
            </div>
          </div>
        ))}
        {!cats.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif', gridColumn:'1/-1' }}>No hay categorías.</div>}
      </div>
    </div>
  )
}
