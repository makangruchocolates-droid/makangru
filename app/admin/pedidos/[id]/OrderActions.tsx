'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const I: React.CSSProperties = { background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 13px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }

const STATUSES = [['pending','Pendiente','#C8860A'],['confirmed','Confirmado','#4A9B8E'],['processing','Preparando','#8B7CF8'],['shipped','Enviado','#4A9BC4'],['delivered','Entregado','#5CB85C'],['cancelled','Cancelado','#D4726A']] as const

export default function OrderActions({ order }: { order: any }) {
  const router = useRouter()
  const [status, setStatus] = useState(order.status)
  const [tracking, setTracking] = useState(order.tracking_number || '')
  const [notes, setNotes] = useState(order.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{text:string,ok:boolean}|null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)

  const toast = (text:string,ok=true)=>{ setMsg({text,ok}); setTimeout(()=>setMsg(null),3000) }

  const confirmPayment = async () => {
    setConfirmingPayment(true)
    const r = await fetch(`/api/admin/orders/${order.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ payment_status:'paid', paid_at: new Date().toISOString() }) })
    setConfirmingPayment(false)
    if (r.ok) { toast('✦ Pago confirmado'); router.refresh() }
    else toast('⚠ Error al confirmar el pago', false)
  }

  const save = async () => {
    setSaving(true)
    const r = await fetch(`/api/admin/orders/${order.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ status, tracking_number:tracking, admin_notes:notes }) })
    setSaving(false)
    if (r.ok) { toast('✦ Pedido actualizado'); router.refresh() }
    else toast('⚠ Error al guardar', false)
  }

  const print = () => {
    const fmt = (n:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(n)
    const items = order.order_items?.map((i:any) => `<tr><td>${i.product_name}</td><td style="text-align:center">×${i.quantity}</td><td style="text-align:right">${fmt(i.unit_price)}</td><td style="text-align:right">${fmt(i.subtotal)}</td></tr>`).join('') || ''
    const addr = order.shipping_address as any
    const w = window.open('','_blank','width=700,height=900')
    w?.document.write(`<!DOCTYPE html><html><head><title>Pedido ${order.order_number}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;padding:32px;color:#111;max-width:680px;margin:0 auto}.header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #C8860A}.brand{font-size:22px;font-weight:700;letter-spacing:3px;font-family:serif;color:#C8860A}.order-num{font-size:28px;font-weight:700}.section{margin-bottom:20px;padding:16px;border:1px solid #ddd}.section-title{font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#C8860A;margin-bottom:10px}table{width:100%;border-collapse:collapse}th{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#666;padding:8px 6px;text-align:left;border-bottom:1px solid #ddd}td{padding:9px 6px;border-bottom:1px solid #f0f0f0;font-size:13px}.total-row{font-size:16px;font-weight:700;color:#C8860A}.badge{display:inline-block;padding:4px 12px;border:1px solid #C8860A;font-size:11px;letter-spacing:1px}@media print{body{padding:16px}}</style></head><body>
    <div class="header"><div><div class="brand">MAKANGRU ✦</div><div style="font-size:11px;color:#666;margin-top:4px">ATELIER DE LA ALQUIMIA CHOCOLÍSTICA</div></div><div style="text-align:right"><div class="order-num">${order.order_number}</div><div style="font-size:12px;color:#666;margin-top:4px">${new Date(order.created_at).toLocaleDateString('es-CL',{day:'numeric',month:'long',year:'numeric'})}</div><div style="margin-top:6px"><span class="badge">${({pending:'PENDIENTE',confirmed:'CONFIRMADO',processing:'PREPARANDO',shipped:'ENVIADO',delivered:'ENTREGADO',cancelled:'CANCELADO'} as any)[order.status]||order.status}</span></div></div></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <div class="section"><div class="section-title">Cliente</div><div style="font-size:15px;font-weight:bold;margin-bottom:4px">${order.customer_name||''}</div><div style="font-size:12px;color:#666">${order.customer_email||''}</div><div style="font-size:12px;color:#666">${order.customer_phone||''}</div></div>
    <div class="section"><div class="section-title">Entrega</div>${order.delivery_date?`<div style="font-size:13px;font-weight:bold;margin-bottom:6px">📅 ${new Date(order.delivery_date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long'})}</div>`:''}${addr?`<div style="font-size:12px;color:#444">${addr.line1||''}</div><div style="font-size:12px;color:#666">${addr.city||''}</div>`:''}${order.shipping_zone_name?`<div style="font-size:11px;color:#999;margin-top:4px">Zona: ${order.shipping_zone_name}</div>`:''}</div></div>
    <div class="section"><div class="section-title">Productos</div><table><thead><tr><th>Producto</th><th style="text-align:center">Cant.</th><th style="text-align:right">Precio unit.</th><th style="text-align:right">Subtotal</th></tr></thead><tbody>${items}</tbody></table>
    <div style="margin-top:16px;padding-top:12px;border-top:1px solid #ddd">
    ${order.discount_amount>0?`<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:#4A9B8E"><span>Descuento</span><span>−${fmt(order.discount_amount)}</span></div>`:''}
    ${order.shipping_amount>0?`<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;color:#666"><span>Envío (${order.shipping_zone_name||''})</span><span>${fmt(order.shipping_amount)}</span></div>`:''}
    <div style="display:flex;justify-content:space-between" class="total-row"><span>Total</span><span>${fmt(order.total)}</span></div></div></div>
    ${order.notes?`<div class="section"><div class="section-title">Notas del cliente</div><p style="font-size:13px;color:#444">${order.notes}</p></div>`:''}
    <div style="margin-top:32px;text-align:center;font-size:10px;color:#999;letter-spacing:2px">MAKANGRU ✦ CHOCOLATERÍA ARTESANAL · GRACIAS POR TU CONFIANZA</div>
    <script>window.onload=()=>window.print()</script></body></html>`)
    w?.document.close()
  }

  return (
    <div>
      {msg && <div style={{ background:msg.ok?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.ok?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.ok?'#4A9B8E':'#D4726A', padding:'10px 14px', marginBottom:14, fontFamily:'Georgia,serif', fontSize:13 }}>{msg.text}</div>}

      {order.payment_method === 'transfer' && order.payment_status !== 'paid' && (
        <div style={{ background:'rgba(139,124,248,0.08)', border:'1px solid rgba(139,124,248,0.3)', padding:18, marginBottom:16 }}>
          <p style={{ fontSize:9, letterSpacing:3, color:'#8B7CF8', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>🏦 Pago por Transferencia — Pendiente</p>
          <p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8', marginBottom:14, lineHeight:1.6 }}>Este cliente eligió pagar por transferencia. Verifica que el comprobante haya llegado (WhatsApp o email) antes de confirmar.</p>
          <button onClick={confirmPayment} disabled={confirmingPayment} style={{ background:'linear-gradient(135deg,#4A9B8E,#6BBDB0)', border:'none', color:'#02000A', padding:'10px 22px', cursor:confirmingPayment?'not-allowed':'pointer', fontFamily:'Georgia,serif', fontWeight:700, fontSize:13, opacity:confirmingPayment?0.7:1 }}>
            {confirmingPayment ? 'Confirmando...' : '✓ Confirmar pago recibido'}
          </button>
        </div>
      )}

      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22, marginBottom:16 }}>
        <p style={{ fontSize:9, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:16, fontFamily:'Georgia,serif' }}>Progreso del Pedido</p>
        <div style={{ display:'flex', alignItems:'center', gap:0, marginBottom:20, overflowX:'auto' }}>
          {STATUSES.filter(s=>s[0]!=='cancelled').map(([s,label,color],i,arr)=>{
            const idx = STATUSES.findIndex(x=>x[0]===status)
            const thisIdx = STATUSES.findIndex(x=>x[0]===s)
            const done = idx >= thisIdx && status !== 'cancelled'
            return (
              <div key={s} style={{ display:'flex', alignItems:'center', flex:1 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:80 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:done?color:'rgba(10,6,20,0.5)', border:`2px solid ${done?color:'rgba(200,134,10,0.2)'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, color:done?'#fff':'#A89070' }}>{done?'✓':i+1}</div>
                  <div style={{ fontSize:9, letterSpacing:1, color:done?color:'#A89070', fontFamily:'Georgia,serif', textAlign:'center' }}>{label}</div>
                </div>
                {i<arr.length-1 && <div style={{ flex:1, height:2, background:done&&idx>thisIdx?color:'rgba(200,134,10,0.15)', minWidth:20, marginBottom:14 }} />}
              </div>
            )
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={L}>Cambiar estado</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} style={{...I,cursor:'pointer'}}>
              {STATUSES.map(([v,l])=><option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={L}>Número de seguimiento</label>
            <input value={tracking} onChange={e=>setTracking(e.target.value)} style={I} placeholder="Código de tracking..." />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={L}>Notas internas (no visibles al cliente)</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} style={{...I,resize:'vertical'}} />
          </div>
        </div>
      </div>

      {order.paid_at || order.shipped_at || order.delivered_at ? (
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:18, marginBottom:16 }}>
          <p style={{ fontSize:9, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:14, fontFamily:'Georgia,serif' }}>Historial</p>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {[
              { label:'Creado', date:order.created_at, icon:'◈' },
              { label:'Pago confirmado', date:order.paid_at, icon:'✦' },
              { label:'Enviado', date:order.shipped_at, icon:'◎' },
              { label:'Entregado', date:order.delivered_at, icon:'✓' },
            ].filter(e=>e.date).map(e=>(
              <div key={e.label} style={{ display:'flex', alignItems:'center', gap:12 }}>
                <span style={{ color:'#C8860A', fontSize:13, width:16 }}>{e.icon}</span>
                <span style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8', flex:1 }}>{e.label}</span>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#A89070' }}>{new Date(e.date).toLocaleDateString('es-CL',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <button onClick={save} disabled={saving} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'11px 26px', cursor:saving?'not-allowed':'pointer', fontFamily:'Georgia,serif', fontWeight:700, fontSize:13, opacity:saving?0.7:1 }}>{saving?'Guardando...':'Guardar ✦'}</button>
        <button onClick={print} style={{ background:'rgba(139,124,248,0.12)', border:'1px solid rgba(139,124,248,0.4)', color:'#8B7CF8', padding:'11px 18px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>🖨 Imprimir orden</button>
        {order.customer_phone && <a href={`https://wa.me/${order.customer_phone?.replace(/\D/g,'')}?text=Hola+${encodeURIComponent(order.customer_name||'')}+✦+tu+pedido+${order.order_number}+está+${({pending:'pendiente',confirmed:'confirmado',processing:'en preparación',shipped:'en camino',delivered:'entregado'} as any)[status]||status}`} target="_blank" rel="noreferrer" style={{ background:'rgba(74,155,142,0.12)', border:'1px solid rgba(74,155,142,0.35)', color:'#4A9B8E', padding:'11px 18px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>💬 WhatsApp</a>}
        {order.customer_email && <a href={`mailto:${order.customer_email}?subject=Tu pedido ${order.order_number} · MAKANGRU`} style={{ background:'rgba(200,134,10,0.08)', border:'1px solid rgba(200,134,10,0.25)', color:'#C8860A', padding:'11px 18px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>✉ Email</a>}
        <a href="/admin/pedidos" style={{ border:'1px solid rgba(200,134,10,0.25)', color:'#A89070', padding:'11px 18px', fontFamily:'Georgia,serif', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center' }}>← Volver</a>
      </div>
    </div>
  )
}
