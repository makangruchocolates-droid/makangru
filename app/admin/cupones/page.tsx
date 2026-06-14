'use client'
import { useState, useEffect } from 'react'
import { fmt } from '@/lib/utils'
const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }
const E = { code:'', description:'', type:'percentage', value:'', min_order_amount:'0', max_discount:'', usage_limit:'', expires_at:'', is_active:true }
export default function CuponesPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState(E)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const load = async () => { const r = await fetch('/api/admin/coupons'); const d = await r.json(); setCoupons(d.data||[]) }
  useEffect(()=>{load()},[])
  const set = (k: string, v: any) => setForm(p=>({...p,[k]:v}))
  const save = async () => {
    if (!form.code||!form.value) return; setLoading(true)
    const payload = { ...form, code:form.code.toUpperCase(), value:Number(form.value), min_order_amount:Number(form.min_order_amount)||0, max_discount:form.max_discount?Number(form.max_discount):null, usage_limit:form.usage_limit?Number(form.usage_limit):null, expires_at:form.expires_at||null }
    const isNew = editing==='new'
    const r = await fetch(isNew?'/api/admin/coupons':`/api/admin/coupons/${editing}`, { method:isNew?'POST':'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) })
    setLoading(false)
    if (r.ok) { setMsg('✓ Guardado'); setEditing(null); load() } else { const d=await r.json(); setMsg('⚠ '+d.error) }
    setTimeout(()=>setMsg(null),3000)
  }
  const del = async (id: string) => { if (!confirm('¿Eliminar?')) return; await fetch(`/api/admin/coupons/${id}`,{method:'DELETE'}); load() }
  const openEdit = (c: any) => { setEditing(c.id); setForm({...c,value:c.value,min_order_amount:c.min_order_amount||'0',max_discount:c.max_discount||'',usage_limit:c.usage_limit||'',expires_at:c.expires_at?c.expires_at.split('T')[0]:''}) }
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div><p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Promociones</p><h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Cupones</h1></div>
        <button onClick={()=>{setEditing('new');setForm(E)}} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>+ Nuevo Cupón</button>
      </div>
      {msg && <div style={{ background:msg.startsWith('✓')?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.startsWith('✓')?'#4A9B8E':'#D4726A', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif' }}>{msg}</div>}
      {editing && (
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.35)', padding:26, marginBottom:22 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', color:'#FDF6E8', marginBottom:20 }}>{editing==='new'?'Nuevo Cupón':'Editar Cupón'}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div><label style={L}>Código</label><input value={form.code} onChange={e=>set('code',e.target.value.toUpperCase())} style={I} placeholder="COSMOS10" /></div>
            <div><label style={L}>Descripción</label><input value={form.description} onChange={e=>set('description',e.target.value)} style={I} placeholder="10% de descuento" /></div>
            <div><label style={L}>Tipo</label><select value={form.type} onChange={e=>set('type',e.target.value)} style={{...I,cursor:'pointer'}}><option value="percentage">Porcentaje (%)</option><option value="fixed">Monto fijo (CLP)</option><option value="free_shipping">Envío gratis</option></select></div>
            <div><label style={L}>Valor {form.type==='percentage'?'(%)':'(CLP)'}</label><input type="number" value={form.value} onChange={e=>set('value',e.target.value)} style={I} /></div>
            <div><label style={L}>Compra mínima (CLP)</label><input type="number" value={form.min_order_amount} onChange={e=>set('min_order_amount',e.target.value)} style={I} /></div>
            <div><label style={L}>Límite de usos</label><input type="number" value={form.usage_limit} onChange={e=>set('usage_limit',e.target.value)} style={I} placeholder="Vacío = ilimitado" /></div>
            <div><label style={L}>Fecha de expiración</label><input type="date" value={form.expires_at} onChange={e=>set('expires_at',e.target.value)} style={I} /></div>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ width:16, height:16, accentColor:'#C8860A' }} />Activo</label>
          </div>
          <div style={{ display:'flex', gap:12, marginTop:18 }}>
            <button onClick={save} disabled={loading} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 26px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700 }}>{loading?'Guardando...':'Guardar ✦'}</button>
            <button onClick={()=>setEditing(null)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'11px 18px', cursor:'pointer', fontFamily:'Georgia,serif' }}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ display:'grid', gap:10 }}>
        {coupons.map(c => {
          const exp = c.expires_at && new Date(c.expires_at) < new Date()
          return (
            <div key={c.id} style={{ background:'rgba(10,6,20,0.85)', border:`1px solid rgba(200,134,10,${c.is_active&&!exp?'0.22':'0.08'})`, padding:'16px 22px', display:'flex', alignItems:'center', gap:18, opacity:c.is_active&&!exp?1:0.55 }}>
              <div style={{ fontFamily:'monospace', fontSize:17, color:'#C8860A', letterSpacing:3, minWidth:150 }}>{c.code}</div>
              <div style={{ flex:1, display:'flex', gap:22, flexWrap:'wrap' }}>
                <div><div style={{ fontSize:9, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:2 }}>TIPO</div><div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{c.type==='percentage'?'%':c.type==='fixed'?'Fijo':'Envío'}</div></div>
                <div><div style={{ fontSize:9, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:2 }}>VALOR</div><div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{c.type==='percentage'?`${c.value}%`:fmt(c.value)}</div></div>
                <div><div style={{ fontSize:9, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:2 }}>USOS</div><div style={{ fontFamily:'monospace', fontSize:13, color:'#F5E6C8' }}>{c.usage_count}/{c.usage_limit||'∞'}</div></div>
                {c.expires_at && <div><div style={{ fontSize:9, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:2 }}>VENCE</div><div style={{ fontFamily:'Georgia,serif', fontSize:12, color:exp?'#D4726A':'#A89070' }}>{new Date(c.expires_at).toLocaleDateString('es-CL')}</div></div>}
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {exp && <span style={{ background:'rgba(212,114,106,0.18)', color:'#D4726A', padding:'2px 8px', fontFamily:'monospace', fontSize:9 }}>EXPIRADO</span>}
                <button onClick={()=>openEdit(c)} style={{ background:'none', border:'1px solid rgba(200,134,10,0.28)', color:'#C8860A', padding:'6px 12px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>Editar</button>
                <button onClick={()=>del(c.id)} style={{ background:'none', border:'1px solid rgba(212,114,106,0.28)', color:'#D4726A', padding:'6px 12px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>✕</button>
              </div>
            </div>
          )
        })}
        {!coupons.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay cupones.</div>}
      </div>
    </div>
  )
}
