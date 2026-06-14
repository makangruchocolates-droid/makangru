'use client'
import { useState, useEffect } from 'react'
const DAYS=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const DS=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }
export default function EntregasPage() {
  const [settings, setSettings] = useState<any>({ enabled_weekdays:[2,4,6], min_advance_days:2, max_advance_days:21, cutoff_hour:12, delivery_message:'Elige tu fecha de entrega preferida ✦', max_orders_per_day:0 })
  const [blocked, setBlocked] = useState<any[]>([])
  const [newDate, setNewDate] = useState('')
  const [newReason, setNewReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const load = async () => {
    const [sr, br] = await Promise.all([fetch('/api/admin/delivery-dates'), fetch('/api/admin/delivery-dates/blocked')])
    const [sd, bd] = await Promise.all([sr.json(), br.json()])
    if (sd.data) setSettings(sd.data); if (bd.data) setBlocked(bd.data)
  }
  useEffect(()=>{load()},[])
  const toggleDay = (d: number) => { const days=settings.enabled_weekdays||[]; setSettings((p: any)=>({...p,enabled_weekdays:days.includes(d)?days.filter((x: number)=>x!==d):[...days,d].sort()})) }
  const saveSettings = async () => {
    setSaving(true)
    const r = await fetch('/api/admin/delivery-dates', { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify(settings) })
    setSaving(false); setMsg(r.ok?'✓ Guardado':'⚠ Error'); setTimeout(()=>setMsg(null),3000)
  }
  const addBlocked = async () => {
    if (!newDate) return
    await fetch('/api/admin/delivery-dates/blocked', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({date:newDate,reason:newReason||null}) })
    setNewDate(''); setNewReason(''); load()
  }
  const removeBlocked = async (id: string) => { await fetch(`/api/admin/delivery-dates/blocked/${id}`,{method:'DELETE'}); load() }
  const preview = () => {
    const dates: Date[] = []; const now = new Date()
    const extra = now.getHours()>=(settings.cutoff_hour||12)?1:0
    const minD = new Date(now); minD.setDate(now.getDate()+(settings.min_advance_days||2)+extra); minD.setHours(0,0,0,0)
    const maxD = new Date(now); maxD.setDate(now.getDate()+Math.min(settings.max_advance_days||21,30))
    const bs = new Set(blocked.map(b=>b.date)); const cur = new Date(minD)
    while (cur<=maxD&&dates.length<14) { const ds=cur.toISOString().split('T')[0]; if ((settings.enabled_weekdays||[]).includes(cur.getDay())&&!bs.has(ds)) dates.push(new Date(cur)); cur.setDate(cur.getDate()+1) }
    return dates
  }
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Logística</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:8 }}>Días de Entrega</h1>
      <p style={{ color:'#A89070', fontFamily:'Georgia,serif', marginBottom:28 }}>Configura qué días realizas entregas y cuáles están bloqueados</p>
      {msg && <div style={{ background:msg.startsWith('✓')?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.startsWith('✓')?'#4A9B8E':'#D4726A', padding:'11px 14px', marginBottom:22, fontFamily:'Georgia,serif' }}>{msg}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:22 }}>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:26 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.05rem', color:'#FDF6E8', marginBottom:18 }}>Días Habilitados</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:18 }}>
            {DAYS.map((day,i)=>{ const a=(settings.enabled_weekdays||[]).includes(i); return <button key={i} onClick={()=>toggleDay(i)} style={{ padding:'9px 3px', background:a?'rgba(200,134,10,0.18)':'#0A0614', border:a?'1px solid #C8860A':'1px solid rgba(200,134,10,0.18)', color:a?'#E8B84B':'#A89070', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:10, textAlign:'center' }}>{DS[i]}</button> })}
          </div>
          <p style={{ fontSize:12, color:'#4A9B8E', fontFamily:'Georgia,serif', marginBottom:18 }}>Activos: {(settings.enabled_weekdays||[]).map((d: number)=>DAYS[d]).join(', ')||'Ninguno'}</p>
          <div style={{ display:'grid', gap:13 }}>
            <div><label style={L}>Días mínimos de anticipación</label><input type="number" value={settings.min_advance_days} onChange={e=>setSettings((p: any)=>({...p,min_advance_days:Number(e.target.value)}))} style={I} min="0" /><p style={{ fontSize:11, color:'#A89070', marginTop:4, fontFamily:'Georgia,serif' }}>El cliente debe pedir con X días de anticipación</p></div>
            <div><label style={L}>Días máximos hacia adelante</label><input type="number" value={settings.max_advance_days} onChange={e=>setSettings((p: any)=>({...p,max_advance_days:Number(e.target.value)}))} style={I} min="1" /></div>
            <div><label style={L}>Hora de corte (0–23)</label><input type="number" value={settings.cutoff_hour} onChange={e=>setSettings((p: any)=>({...p,cutoff_hour:Number(e.target.value)}))} style={I} min="0" max="23" /></div>
            <div><label style={L}>Mensaje en el checkout</label><input value={settings.delivery_message} onChange={e=>setSettings((p: any)=>({...p,delivery_message:e.target.value}))} style={I} /></div>
          </div>
          <button onClick={saveSettings} disabled={saving} style={{ marginTop:22, background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'12px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700, width:'100%' }}>{saving?'Guardando...':'Guardar Configuración ✦'}</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
            <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.05rem', color:'#FDF6E8', marginBottom:14 }}>Vista Previa — Lo que verá el cliente</h3>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {preview().map((d,i)=><div key={i} style={{ background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.28)', padding:'6px 11px', fontFamily:'Georgia,serif', fontSize:11, color:'#E8B84B', textTransform:'capitalize' }}>{DS[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()]}</div>)}
              {!preview().length && <p style={{ color:'#A89070', fontFamily:'Georgia,serif', fontSize:12 }}>No hay fechas con la configuración actual</p>}
            </div>
          </div>
          <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22, flex:1 }}>
            <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.05rem', color:'#FDF6E8', marginBottom:8 }}>Fechas Bloqueadas</h3>
            <p style={{ fontSize:12, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:14 }}>Feriados, vacaciones, cierre del Atelier</p>
            <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
              <input type="date" value={newDate} onChange={e=>setNewDate(e.target.value)} style={{...I,flex:1,minWidth:130}} />
              <input value={newReason} onChange={e=>setNewReason(e.target.value)} placeholder="Motivo (opcional)" style={{...I,flex:2,minWidth:110}} />
              <button onClick={addBlocked} style={{ background:'#C8860A', border:'none', color:'#02000A', padding:'0 16px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700, fontSize:18 }}>+</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, maxHeight:250, overflowY:'auto' }}>
              {blocked.map(b=>(
                <div key={b.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 13px', background:'rgba(212,114,106,0.07)', border:'1px solid rgba(212,114,106,0.18)' }}>
                  <div><span style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{new Date(b.date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>{b.reason&&<span style={{ marginLeft:10, fontSize:12, color:'#A89070', fontFamily:'Georgia,serif' }}>{b.reason}</span>}</div>
                  <button onClick={()=>removeBlocked(b.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'#D4726A', fontSize:16 }}>✕</button>
                </div>
              ))}
              {!blocked.length && <p style={{ color:'#A89070', fontFamily:'Georgia,serif', fontSize:12, textAlign:'center', padding:'18px 0' }}>No hay fechas bloqueadas</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
