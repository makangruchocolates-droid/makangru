import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
import Link from 'next/link'
const SC: Record<string,string> = { pending:'#C8860A', confirmed:'#4A9B8E', processing:'#8B7CF8', shipped:'#4A9BC4', delivered:'#5CB85C', cancelled:'#D4726A' }
const SL: Record<string,string> = { pending:'Pendiente', confirmed:'Confirmado', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }
export default async function AdminPedidos({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const db = createAdminClient()
  let q = db.from('orders').select('*').order('created_at', { ascending:false }) as any
  if (status) q = q.eq('status', status)
  const { data: orders } = await q
  const { data: all } = await db.from('orders').select('status')
  const counts: Record<string,number> = {}
  all?.forEach((o: any) => { counts[o.status] = (counts[o.status]||0)+1 })
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Gestión</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:22 }}>Pedidos</h1>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:22 }}>
        <Link href="/admin/pedidos" style={{ padding:'7px 15px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12, background:!status?'rgba(200,134,10,0.18)':'transparent', border:'1px solid rgba(200,134,10,0.28)', color:!status?'#E8B84B':'#A89070' }}>Todos ({all?.length||0})</Link>
        {Object.entries(SL).map(([k,v]) => (
          <Link key={k} href={`/admin/pedidos?status=${k}`} style={{ padding:'7px 15px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12, background:status===k?`${SC[k]}22`:'transparent', border:`1px solid ${SC[k]}44`, color:status===k?SC[k]:'#A89070' }}>{v} ({counts[k]||0})</Link>
        ))}
      </div>
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
            {['Número','Cliente','Total','Estado','Entrega','Fecha',''].map(h => <th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'12px 13px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {orders?.map((o: any) => (
              <tr key={o.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'11px 13px', fontFamily:'monospace', fontSize:12, color:'#C8860A' }}>{o.order_number}</td>
                <td style={{ padding:'11px 13px' }}><div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{o.customer_name}</div><div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#A89070' }}>{o.customer_email}</div></td>
                <td style={{ padding:'11px 13px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{fmt(o.total)}</td>
                <td style={{ padding:'11px 13px' }}><span style={{ background:`${SC[o.status]||'#A89070'}22`, color:SC[o.status]||'#A89070', padding:'3px 9px', fontFamily:'monospace', fontSize:10 }}>{SL[o.status]||o.status}</span></td>
                <td style={{ padding:'11px 13px', fontFamily:'Georgia,serif', fontSize:12, color:o.delivery_date?'#4A9B8E':'#A89070' }}>{o.delivery_date?new Date(o.delivery_date+'T12:00:00').toLocaleDateString('es-CL'):'—'}</td>
                <td style={{ padding:'11px 13px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
                <td style={{ padding:'11px 13px' }}><Link href={`/admin/pedidos/${o.id}`} style={{ color:'#C8860A', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>Ver →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders?.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay pedidos</div>}
      </div>
    </div>
  )
}
