import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

const SC: Record<string,string> = { pending:'#C8860A', confirmed:'#4A9B8E', processing:'#8B7CF8', shipped:'#4A9BC4', delivered:'#5CB85C', cancelled:'#D4726A' }
const SL: Record<string,string> = { pending:'Pendiente', confirmed:'Confirmado', processing:'Procesando', shipped:'Enviado', delivered:'Entregado', cancelled:'Cancelado' }

export default async function AdminDash() {
  const db = createAdminClient()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

  const [
    { data: orders },
    { data: lastOrders },
    { count: pCount },
    { count: cCount },
    { data: recent },
    { data: unreadMsgs },
    { data: allItems },
    { count: featuredCount },
    { data: todayRes },
  ] = await Promise.all([
    db.from('orders').select('total,status,payment_status,created_at').gte('created_at', start.toISOString()),
    db.from('orders').select('total,payment_status').gte('created_at', lastStart.toISOString()).lte('created_at', lastEnd.toISOString()),
    db.from('products').select('id', { count:'exact' }).eq('is_active', true),
    db.from('customers').select('id', { count:'exact' }),
    db.from('orders').select('*, order_items(product_name,quantity)').order('created_at', { ascending:false }).limit(8),
    db.from('contact_messages').select('id', { count:'exact' }).eq('is_read', false),
    db.from('order_items').select('product_name,quantity,price,created_at').order('created_at', { ascending:false }).limit(200),
    db.from('products').select('id', { count:'exact' }).eq('is_featured', true),
    db.from('store_reservations').select('id,customer_name,reservation_time,status').eq('reservation_date', now.toISOString().split('T')[0]).neq('status','cancelled'),
  ])

  const paid = orders?.filter(o => o.payment_status === 'paid') || []
  const revenue = paid.reduce((s, o) => s + Number(o.total), 0)
  const lastPaid = lastOrders?.filter(o => o.payment_status === 'paid') || []
  const lastRevenue = lastPaid.reduce((s, o) => s + Number(o.total), 0)
  const revDiff = lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue * 100).toFixed(0) : null
  const pending = orders?.filter(o => o.status === 'pending').length || 0
  const unreadCount = unreadMsgs?.length || 0

  const prodMap: Record<string,{name:string,qty:number,rev:number}> = {}
  allItems?.forEach((i: any) => {
    if (!prodMap[i.product_name]) prodMap[i.product_name] = { name:i.product_name, qty:0, rev:0 }
    prodMap[i.product_name].qty += i.quantity
    prodMap[i.product_name].rev += Number(i.price) * i.quantity
  })
  const topList = Object.values(prodMap).sort((a,b) => b.qty - a.qty).slice(0, 5)

  const days: Record<string,number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    days[d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric'})] = 0
  }
  orders?.filter(o => o.payment_status === 'paid').forEach(o => {
    const d = new Date(o.created_at)
    const label = d.toLocaleDateString('es-CL',{weekday:'short',day:'numeric'})
    if (days[label] !== undefined) days[label] += Number(o.total)
  })

  const kpis = [
    { label:'Ventas este mes', value: fmt(revenue), sub: revDiff ? `${Number(revDiff)>0?'+':''}${revDiff}% vs mes anterior` : 'Primer mes', color:'#E8B84B' },
    { label:'Pedidos este mes', value: orders?.length || 0, sub: `${lastOrders?.length||0} el mes pasado`, color:'#4A9B8E' },
    { label:'Pendientes', value: pending, sub: pending > 0 ? '⚠ Requieren atención' : '✓ Todo al día', color: pending > 0 ? '#C8860A' : '#4A9B8E' },
    { label:'Clientes', value: cCount || 0, sub: `${pCount||0} productos activos`, color:'#8B7CF8' },
  ]

  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:10, fontFamily:'Georgia,serif' }}>✦ Overview</p>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Dashboard</h1>
        <div style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{now.toLocaleDateString('es-CL',{ weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      </div>

      {(pending > 0 || unreadCount > 0 || (todayRes?.length||0) > 0) && (
        <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
          {pending > 0 && <Link href="/admin/pedidos" style={{ background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.35)', color:'#E8B84B', padding:'8px 16px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>⚠ {pending} pedido{pending>1?'s':''} pendiente{pending>1?'s':''} →</Link>}
          {unreadCount > 0 && <Link href="/admin/mensajes" style={{ background:'rgba(139,124,248,0.1)', border:'1px solid rgba(139,124,248,0.35)', color:'#8B7CF8', padding:'8px 16px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>✉ {unreadCount} mensaje{unreadCount>1?'s':''} sin leer →</Link>}
          {(todayRes?.length||0) > 0 && <Link href="/admin/reservas" style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.35)', color:'#4A9B8E', padding:'8px 16px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>📅 {todayRes?.length} reserva{(todayRes?.length||0)>1?'s':''} hoy →</Link>}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:20 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'20px 22px' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:10, fontFamily:'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.7rem', color:k.color, fontWeight:700, marginBottom:5 }}>{k.value}</div>
            <div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#555' }}>{k.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#FDF6E8', marginBottom:20 }}>Ventas — últimos 7 días</h3>
          {(() => {
            const vals = Object.values(days)
            const max = Math.max(...vals, 1)
            return (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:110 }}>
                {Object.entries(days).map(([label, v]) => (
                  <div key={label} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                    <div style={{ fontSize:9, color:'#A89070', fontFamily:'monospace', whiteSpace:'nowrap' }}>{v > 0 ? fmt(v).replace('$','').replace('.000','k') : ''}</div>
                    <div style={{ width:'100%', background:v>0?'linear-gradient(0deg,#C8860A,#E8B84B)':'rgba(200,134,10,0.1)', height:`${Math.max((v/max)*86,4)}px`, border:'1px solid rgba(200,134,10,0.2)' }} />
                    <div style={{ fontSize:9, color:'#666', fontFamily:'Georgia,serif', textAlign:'center' }}>{label}</div>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#FDF6E8', marginBottom:16 }}>Top Productos</h3>
          {topList.length === 0 ? <p style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070', paddingTop:16 }}>Sin ventas aún</p> : topList.map((p, i) => (
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:11 }}>
              <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:14, color:'#C8860A', width:18 }}>{i+1}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#F5E6C8' }}>{p.name}</div>
                <div style={{ fontFamily:'Georgia,serif', fontSize:10, color:'#A89070' }}>{fmt(p.rev)}</div>
              </div>
              <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B' }}>×{p.qty}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#FDF6E8' }}>📅 Reservas Hoy</h3>
            <Link href="/admin/reservas" style={{ fontSize:12, color:'#C8860A', fontFamily:'Georgia,serif', textDecoration:'none' }}>Ver todas →</Link>
          </div>
          {!todayRes?.length ? <p style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>Sin reservas para hoy</p> : todayRes.map((r:any) => (
            <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid rgba(200,134,10,0.08)' }}>
              <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{r.customer_name}</div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <span style={{ fontFamily:'monospace', fontSize:11, color:'#C8860A' }}>{r.reservation_time}</span>
                <span style={{ background:`${SC[r.status]||'#A89070'}22`, color:SC[r.status]||'#A89070', padding:'2px 7px', fontSize:9, fontFamily:'monospace' }}>{r.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:20 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#FDF6E8', marginBottom:14 }}>Accesos Rápidos</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { href:'/admin/productos/nuevo', label:'Nuevo Producto', icon:'✦', color:'#E8B84B' },
              { href:'/admin/blog/nuevo', label:'Nuevo Post', icon:'✒', color:'#8B7CF8' },
              { href:'/admin/ingredientes', label:'Ingredientes', icon:'🍫', color:'#C8860A' },
              { href:'/admin/recetas', label:'Recetas', icon:'⚗', color:'#4A9B8E' },
              { href:'/admin/temporadas', label:'Temporadas', icon:'🌿', color:'#4A9B8E' },
              { href:'/admin/reservas', label:'Reservas', icon:'📅', color:'#8B7CF8' },
              { href:'/admin/destacados', label:`${featuredCount||0} Destacados`, icon:'⭐', color:'#C8860A' },
              { href:'/admin/mensajes', label:`${unreadCount||0} Mensajes`, icon:'✉', color:unreadCount>0?'#8B7CF8':'#A89070' },
            ].map(a => (
              <Link key={a.href} href={a.href} style={{ background:'rgba(10,6,20,0.6)', border:`1px solid ${a.color}30`, padding:'10px 12px', textDecoration:'none', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:14 }}>{a.icon}</span>
                <span style={{ fontFamily:'Georgia,serif', fontSize:11, color:a.color }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:22 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
          <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#FDF6E8' }}>Últimos Pedidos</h3>
          <Link href="/admin/pedidos" style={{ fontSize:13, color:'#C8860A', fontFamily:'Georgia,serif', textDecoration:'none' }}>Ver todos →</Link>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
              {['Número','Cliente','Total','Estado','Fecha'].map(h => (
                <th key={h} style={{ fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'8px 12px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent?.map((o: any) => (
              <tr key={o.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'10px 12px', fontFamily:'monospace', fontSize:12, color:'#C8860A' }}>
                  <Link href={`/admin/pedidos/${o.id}`} style={{ color:'#C8860A', textDecoration:'none' }}>{o.order_number}</Link>
                </td>
                <td style={{ padding:'10px 12px', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{o.customer_name || o.customer_email}</td>
                <td style={{ padding:'10px 12px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{fmt(o.total)}</td>
                <td style={{ padding:'10px 12px' }}>
                  <span style={{ background:`${SC[o.status]||'#A89070'}22`, color:SC[o.status]||'#A89070', padding:'3px 10px', fontFamily:'monospace', fontSize:10 }}>{SL[o.status]||o.status}</span>
                </td>
                <td style={{ padding:'10px 12px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{new Date(o.created_at).toLocaleDateString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!recent?.length && <p style={{ color:'#A89070', fontFamily:'Georgia,serif', textAlign:'center', padding:'40px 0' }}>Aún no hay pedidos</p>}
      </div>
    </div>
  )
}
