import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

const SC: Record<string,string> = { pending:'#C8860A', confirmed:'#4A9B8E', processing:'#8B7CF8', shipped:'#4A9BC4', delivered:'#5CB85C', cancelled:'#D4726A' }
const SL: Record<string,string> = { pending:'Pendiente', confirmed:'Confirmado', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }

export default async function AdminDash() {
  const db = createAdminClient()
  const start = new Date(); start.setDate(1); start.setHours(0,0,0,0)
  const [{ data: orders }, { count: pCount }, { count: cCount }, { data: recent }] = await Promise.all([
    db.from('orders').select('total,status,payment_status').gte('created_at', start.toISOString()),
    db.from('products').select('id', { count:'exact' }).eq('is_active', true),
    db.from('customers').select('id', { count:'exact' }),
    db.from('orders').select('*, order_items(product_name,quantity)').order('created_at', { ascending:false }).limit(8),
  ])
  const paid = orders?.filter(o => o.payment_status === 'paid') || []
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0)
  const pending = orders?.filter(o => o.status === 'pending').length || 0

  const kpis = [
    { label:'Ventas este mes', value: fmt(revenue), color:'#E8B84B' },
    { label:'Pedidos este mes', value: orders?.length || 0, color:'#4A9B8E' },
    { label:'Pendientes', value: pending, color:'#C8860A' },
    { label:'Clientes totales', value: cCount || 0, color:'#8B7CF8' },
  ]

  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:10, fontFamily:'Georgia,serif' }}>✦ Overview</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:28 }}>Dashboard</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:18, marginBottom:28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'20px 22px' }}>
            <div style={{ fontSize:11, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:10, fontFamily:'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.8rem', color:k.color, fontWeight:700 }}>{k.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.1rem', color:'#FDF6E8' }}>Últimos Pedidos</h3>
          <Link href="/admin/pedidos" style={{ fontSize:13, color:'#C8860A', fontFamily:'Georgia,serif', textDecoration:'none' }}>Ver todos →</Link>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
              {['Número','Cliente','Total','Estado','Fecha'].map(h => (
                <th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'8px 12px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent?.map((o: any) => (
              <tr key={o.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'11px 12px', fontFamily:'monospace', fontSize:12, color:'#C8860A' }}>
                  <Link href={`/admin/pedidos/${o.id}`} style={{ color:'#C8860A', textDecoration:'none' }}>{o.order_number}</Link>
                </td>
                <td style={{ padding:'11px 12px', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{o.customer_name || o.customer_email}</td>
                <td style={{ padding:'11px 12px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{fmt(o.total)}</td>
                <td style={{ padding:'11px 12px' }}>
                  <span style={{ background:`${SC[o.status]||'#A89070'}22`, color:SC[o.status]||'#A89070', padding:'3px 10px', fontFamily:'monospace', fontSize:11 }}>{SL[o.status]||o.status}</span>
                </td>
                <td style={{ padding:'11px 12px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!recent?.length && <p style={{ color:'#A89070', fontFamily:'Georgia,serif', textAlign:'center', padding:'40px 0' }}>Aún no hay pedidos</p>}
      </div>
    </div>
  )
}
