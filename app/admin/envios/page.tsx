'use client'
import { useState, useEffect } from 'react'
import { fmt } from '@/lib/utils'
const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }
const E = { name:'', regions:'', price:'', free_above:'', min_days:1, max_days:3, is_active:true, sort_order:0 }
export default function EnviosPage() {
  const [zones, setZones] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(E)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const load = async () => { const r = await fetch('/api/admin/shipping'); const d = await r.json(); setZones(d.data||[]) }
  useEffect(()=>{load()},[])
  const set = (k: string, v: any) => setForm(p=>({...p,[k]:v}))
  const save = async () => {
    if (!form.name||!String(form.price)) return; setLoading(true)
    const payload = { ...form, price:Number(form.price), free_above:form.free_above?Number(form.free_above):null, regions:(form.regions as any).split(',').map((s: string)=>s.trim()).filter(Boolean), min_days:Number(form.min_days), max_days:Number(form.max_days), sort_order:Number(form.sort_order) }
    const isNew = editing==='new'
    const r = await fetch(isNew?'/api/admin/shipping':`/api/admin/shipping/${editing}`, { method:isNew?'POST':'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    setLoading(false)
    if (r.ok) { setMsg('✓ Guardado'); setEditing(null); load() } else { const d=await r.json(); setMsg('⚠ '+d.error) }
    setTimeout(()=>setMsg(null),3000)
  }
  const del = async (id: string) => { if (!confirm('¿Eliminar zona?')) return; await fetch(`/api/admin/shipping/${id}`,{method:'DELETE'}); load() }
  const toggle = async (z: any) => { await fetch(`/api/admin/shipping/${z.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({is_active:!z.is_active})}); load() }
  const openEdit = (z: any) => { setEditing(z.id); setForm({...z,regions:z.regions?.join(', ')||'',free_above:z.free_above||''}) }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div><p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Logística</p><h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Zonas de Envío & Tarifas</h1></div>
        <button onClick={()=>{setEditing('new');setForm(E)}} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>+ Nueva Zona</button>
      </div>
      {msg && <div style={{ background:msg.startsWith('✓')?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.startsWith('✓')?'#4A9B8E':'#D4726A', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif' }}>{msg}</div>}
      {editing && (
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.35)', padding:26, marginBottom:22 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', color:'#FDF6E8', marginBottom:20 }}>{editing==='new'?'Nueva Zona':'Editar Zona'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div style={{ gridColumn:'1/-1' }}><label style={L}>Nombre</label><input value={form.name} onChange={e=>set('name',e.target.value)} style={I} placeholder="Santiago Oriente" /></div>
            <div style={{ gridColumn:'1/-1' }}><label style={L}>Comunas (separadas por coma)</label><textarea value={form.regions} onChange={e=>set('regions',e.target.value)} rows={3} style={{...I,resize:'vertical'}} placeholder="Providencia, Ñuñoa, Las Condes..." /><p style={{ fontSize:11, color:'#A89070', marginTop:4, fontFamily:'Georgia,serif' }}>El cliente elegirá su ciudad al pagar</p></div>
            <div><label style={L}>Precio envío (CLP)</label><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} style={I} placeholder="3500" /><p style={{ fontSize:11, color:'#A89070', marginTop:4, fontFamily:'Georgia,serif' }}>0 = Retiro gratis</p></div>
            <div><label style={L}>Gratis sobre (CLP, vacío=nunca)</label><input type="number" value={form.free_above} onChange={e=>set('free_above',e.target.value)} style={I} placeholder="80000" /></div>
            <div><label style={L}>Días mínimos</label><input type="number" value={form.min_days} onChange={e=>set('min_days',e.target.value)} style={I} min="0" /></div>
            <div><label style={L}>Días máximos</label><input type="number" value={form.max_days} onChange={e=>set('max_days',e.target.value)} style={I} min="0" /></div>
            <div><label style={L}>Orden</label><input type="number" value={form.sort_order} onChange={e=>set('sort_order',e.target.value)} style={I} min="0" /></div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, accentColor:'#C8860A' }} />Activa</label>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:18 }}>
            <button onClick={save} disabled={loading} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 26px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>{loading?'Guardando...':'Guardar ✦'}</button>
            <button onClick={()=>setEditing(null)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'11px 18px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gap:10 }}>
        {zones.map(z => (
          <div key={z.id} style={{ background:'rgba(10,6,20,0.85)', border:`1px solid rgba(200,134,10,${z.is_active?'0.22':'0.08'})`, padding:'16px 22px', display:'flex', alignItems:'flex-start', gap:18, opacity:z.is_active?1:0.55 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
                <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#FDF6E8', fontWeight:700 }}>{z.name}</span>
                <span style={{ background:z.is_active?'rgba(74,155,142,0.2)':'rgba(168,144,112,0.2)', color:z.is_active?'#4A9B8E':'#A89070', padding:'2px 8px', fontFamily:'monospace', fontSize:9 }}>{z.is_active?'Activa':'Inactiva'}</span>
              </div>
              <div style={{ display:'flex', gap:18, marginBottom:6 }}>
                <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{Number(z.price)===0?'Gratis / Retiro':fmt(z.price)}</span>
                {z.free_above && <span style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#4A9B8E' }}>Gratis sobre {fmt(z.free_above)}</span>}
                {z.min_days>0 && <span style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{z.min_days}–{z.max_days} días</span>}
              </div>
              <p style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#A89070' }}>{z.regions?.join(' · ')}</p>
            </div>
            <div style={{ display:'flex', gap:8, flexShrink:0 }}>
              <button onClick={()=>toggle(z)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'6px 11px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:11 }}>{z.is_active?'Desactivar':'Activar'}</button>
              <button onClick={()=>openEdit(z)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#C8860A', padding:'6px 11px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:11 }}>Editar</button>
              <button onClick={()=>del(z.id)} style={{ background:'none', border:'1px solid rgba(212,114,106,0.28)', color:'#D4726A', padding:'6px 11px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:11 }}>✕</button>
            </div>
          </div>
        ))}
        {!zones.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay zonas. Ya vienen por defecto desde el SQL.</div>}
      </div>
    </div>
  )
}
