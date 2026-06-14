'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
const I: React.CSSProperties = { background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
export default function OrderActions({ order }: { order: any }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [tracking, setTracking] = useState(order.tracking_number || '')
  const [notes, setNotes] = useState(order.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const save = async () => {
    setSaving(true)
    const r = await fetch(`/api/admin/orders/${order.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, tracking_number:tracking, admin_notes:notes }) })
    setSaving(false); setMsg(r.ok?'✓ Actualizado':'⚠ Error'); if(r.ok) router.refresh()
    setTimeout(()=>setMsg(null),3000)
  }
  return (
    <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
      <p style={{ fontSize:10, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:18, fontFamily:'Georgia,serif' }}>Gestionar Pedido</p>
      {msg && <div style={{ background:msg.startsWith('✓')?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.startsWith('✓')?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.startsWith('✓')?'#4A9B8E':'#D4726A', padding:'9px 13px', marginBottom:14, fontFamily:'Georgia,serif', fontSize:13 }}>{msg}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <div><label style={{ display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }}>Estado</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} style={{ ...I, width:'100%', cursor:'pointer' }}>
            {[['pending','Pendiente'],['confirmed','Confirmado'],['processing','Procesando'],['shipped','Enviado'],['delivered','Entregado'],['cancelled','Cancelado']].map(([v,l])=><option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div><label style={{ display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }}>Número de seguimiento</label><input value={tracking} onChange={e=>setTracking(e.target.value)} style={{ ...I, width:'100%' }} placeholder="Código tracking..." /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={{ display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }}>Notas internas</label><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{ ...I, width:'100%', resize:'vertical' }} /></div>
      </div>
      <div style={{ display:'flex', gap:12 }}>
        <button onClick={save} disabled={saving} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 26px', cursor:saving?'not-allowed':'pointer', fontFamily:'Georgia,serif', fontWeight:700, fontSize:13 }}>{saving?'Guardando...':'Guardar ✦'}</button>
        <a href="/admin/pedidos" style={{ border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'11px 18px', fontFamily:'Georgia,serif', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center' }}>← Volver</a>
      </div>
    </div>
  )
}
