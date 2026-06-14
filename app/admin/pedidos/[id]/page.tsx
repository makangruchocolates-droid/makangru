import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
import { notFound } from 'next/navigation'
import OrderActions from './OrderActions'
const SC: Record<string,string> = { pending:'#C8860A', confirmed:'#4A9B8E', processing:'#8B7CF8', shipped:'#4A9BC4', delivered:'#5CB85C', cancelled:'#D4726A' }
const SL: Record<string,string> = { pending:'Pendiente', confirmed:'Confirmado', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }
export default async function PedidoDetalle({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data: o } = await db.from('orders').select('*, order_items(*)').eq('id', id).single()
  if (!o) notFound()
  const addr = o.shipping_address as any
  return (
    <div style={{ maxWidth:880 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Pedido</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:4 }}>{o.order_number}</h1>
          <p style={{ color:'#A89070', fontFamily:'Georgia,serif', fontSize:13 }}>{new Date(o.created_at).toLocaleDateString('es-CL', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        </div>
        <span style={{ background:`${SC[o.status]||'#A89070'}22`, color:SC[o.status]||'#A89070', padding:'8px 18px', fontFamily:'monospace', fontSize:13 }}>{SL[o.status]||o.status}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:18 }}>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
          <p style={{ fontSize:10, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:14, fontFamily:'Georgia,serif' }}>Cliente</p>
          <p style={{ fontFamily:'Georgia,serif', fontSize:15, color:'#F5E6C8', marginBottom:5 }}>{o.customer_name}</p>
          <p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', marginBottom:4 }}>{o.customer_email}</p>
          <p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', marginBottom:12 }}>{o.customer_phone}</p>
          {o.customer_phone && <a href={`https://wa.me/${o.customer_phone?.replace(/\D/g,'')}?text=Hola+${encodeURIComponent(o.customer_name||'')}+✦+tu+pedido+${o.order_number}`} target="_blank" rel="noopener noreferrer" style={{ color:'#25D366', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>💬 WhatsApp</a>}
        </div>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
          <p style={{ fontSize:10, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:14, fontFamily:'Georgia,serif' }}>Entrega</p>
          {o.delivery_date && <div style={{ marginBottom:10, padding:'9px 13px', background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.3)' }}><p style={{ fontFamily:'Georgia,serif', fontSize:14, color:'#4A9B8E', fontWeight:700 }}>📅 {new Date(o.delivery_date+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>}
          {addr && <><p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8', marginBottom:3 }}>{addr.line1}</p><p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070' }}>{addr.city}{addr.state?`, ${addr.state}`:''}</p></>}
          {o.shipping_zone_name && <p style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070', marginTop:8 }}>Zona: {o.shipping_zone_name}</p>}
          {o.notes && <div style={{ marginTop:10, padding:'9px 13px', background:'rgba(200,134,10,0.06)', border:'1px solid rgba(200,134,10,0.18)' }}><p style={{ fontSize:9, color:'#C8860A', fontFamily:'Georgia,serif', marginBottom:4 }}>NOTAS</p><p style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#A89070' }}>{o.notes}</p></div>}
        </div>
      </div>
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22, marginBottom:18 }}>
        <p style={{ fontSize:10, letterSpacing:3, color:'#C8860A', textTransform:'uppercase', marginBottom:14, fontFamily:'Georgia,serif' }}>Productos</p>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <tbody>
            {(o.order_items as any[])?.map((item: any) => (
              <tr key={item.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.08)' }}>
                <td style={{ padding:'9px 0', fontFamily:'Georgia,serif', fontSize:14, color:'#F5E6C8' }}>{item.product_name}</td>
                <td style={{ padding:'9px 0', fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', textAlign:'center' }}>×{item.quantity}</td>
                <td style={{ padding:'9px 0', fontFamily:'Georgia,serif', fontSize:13, color:'#A89070', textAlign:'right' }}>{fmt(item.unit_price)}</td>
                <td style={{ padding:'9px 0', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', textAlign:'right', fontWeight:700 }}>{fmt(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ marginTop:14, paddingTop:14, borderTop:'1px solid rgba(200,134,10,0.18)' }}>
          {o.discount_amount>0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, fontFamily:'Georgia,serif', fontSize:13, color:'#4A9B8E' }}><span>Descuento</span><span>−{fmt(o.discount_amount)}</span></div>}
          {o.shipping_amount>0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7, fontFamily:'Georgia,serif', fontSize:13, color:'#A89070' }}><span>Envío</span><span>{fmt(o.shipping_amount)}</span></div>}
          <div style={{ display:'flex', justifyContent:'space-between' }}>
            <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.05rem', color:'#F5E6C8', fontWeight:700 }}>Total</span>
            <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.2rem', color:'#E8B84B', fontWeight:700 }}>{fmt(o.total)}</span>
          </div>
        </div>
      </div>
      <OrderActions order={o} />
    </div>
  )
}
