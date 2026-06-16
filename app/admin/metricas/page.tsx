import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'

export default async function MetricasPage() {
  const db = createAdminClient()
  const now = new Date()

  // Últimos 6 meses
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return { start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59), label: d.toLocaleDateString('es-CL', { month: 'short', year: '2-digit' }) }
  })

  const [
    { data: allOrders },
    { data: allItems },
    { data: customers },
    { data: topCategories },
  ] = await Promise.all([
    db.from('orders').select('total,status,payment_status,created_at,customer_email').order('created_at', { ascending: false }),
    db.from('order_items').select('product_name,category_name,quantity,price,created_at'),
    db.from('customers').select('id,created_at,total_orders,total_spent').order('total_spent', { ascending: false }),
    db.from('order_items').select('category_name,quantity,price'),
  ])

  // Ventas por mes
  const monthlyData = months.map(m => {
    const os = allOrders?.filter(o => {
      const d = new Date(o.created_at)
      return d >= m.start && d <= m.end && o.payment_status === 'paid'
    }) || []
    return { label: m.label, revenue: os.reduce((s, o) => s + Number(o.total), 0), orders: os.length }
  })

  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1)

  // Totales globales
  const paidOrders = allOrders?.filter(o => o.payment_status === 'paid') || []
  const totalRevenue = paidOrders.reduce((s, o) => s + Number(o.total), 0)
  const avgTicket = paidOrders.length ? totalRevenue / paidOrders.length : 0
  const cancelRate = allOrders?.length ? (allOrders.filter(o => o.status === 'cancelled').length / allOrders.length * 100).toFixed(1) : '0'

  // Top productos
  const prodMap: Record<string, { name: string; qty: number; rev: number }> = {}
  allItems?.forEach((i: any) => {
    if (!prodMap[i.product_name]) prodMap[i.product_name] = { name: i.product_name, qty: 0, rev: 0 }
    prodMap[i.product_name].qty += i.quantity
    prodMap[i.product_name].rev += Number(i.price) * i.quantity
  })
  const topProducts = Object.values(prodMap).sort((a, b) => b.rev - a.rev).slice(0, 8)
  const maxProd = Math.max(...topProducts.map(p => p.rev), 1)

  // Por categoría
  const catMap: Record<string, { name: string; qty: number; rev: number }> = {}
  topCategories?.forEach((i: any) => {
    const cat = i.category_name || 'Sin categoría'
    if (!catMap[cat]) catMap[cat] = { name: cat, qty: 0, rev: 0 }
    catMap[cat].qty += i.quantity
    catMap[cat].rev += Number(i.price) * i.quantity
  })
  const catList = Object.values(catMap).sort((a, b) => b.rev - a.rev)
  const maxCat = Math.max(...catList.map(c => c.rev), 1)

  // Clientes top
  const topCustomers = customers?.slice(0, 5) || []

  const kpis = [
    { label: 'Ingresos Totales', value: fmt(totalRevenue), color: '#E8B84B' },
    { label: 'Pedidos Pagados', value: paidOrders.length, color: '#4A9B8E' },
    { label: 'Ticket Promedio', value: fmt(avgTicket), color: '#8B7CF8' },
    { label: 'Tasa Cancelación', value: `${cancelRate}%`, color: Number(cancelRate) > 10 ? '#D4726A' : '#4A9B8E' },
  ]

  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: 4, color: '#C8860A', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Georgia,serif' }}>✦ Analítica</p>
      <h1 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '2rem', color: '#FDF6E8', marginBottom: 28 }}>Métricas</h1>

      {/* KPIs globales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: '20px 22px' }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: '#A89070', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '1.7rem', color: k.color, fontWeight: 700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Ventas por mes */}
      <div style={{ background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: 24, marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '1rem', color: '#FDF6E8', marginBottom: 24 }}>Ingresos Mensuales — últimos 6 meses</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
          {monthlyData.map(m => (
            <div key={m.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 11, color: '#E8B84B' }}>
                {m.revenue > 0 ? fmt(m.revenue).replace('$', '').replace(/\./g, '.') : '—'}
              </div>
              <div style={{ width: '100%', background: m.revenue > 0 ? 'linear-gradient(0deg,#C8860A,#E8B84B)' : 'rgba(200,134,10,0.1)', height: `${Math.max((m.revenue / maxRevenue) * 100, 6)}px`, border: '1px solid rgba(200,134,10,0.25)' }} />
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 11, color: '#A89070' }}>{m.label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#666' }}>{m.orders} ped.</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Top productos */}
        <div style={{ background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: 22 }}>
          <h3 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '1rem', color: '#FDF6E8', marginBottom: 18 }}>Top Productos por Ingresos</h3>
          {topProducts.map((p, i) => (
            <div key={p.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#F5E6C8' }}>
                  <span style={{ color: '#C8860A', marginRight: 6, fontFamily: 'Cinzel,Georgia,serif' }}>{i + 1}.</span>{p.name}
                </div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 12, color: '#E8B84B' }}>{fmt(p.rev)}</div>
              </div>
              <div style={{ height: 4, background: 'rgba(200,134,10,0.12)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(p.rev / maxProd) * 100}%`, background: 'linear-gradient(90deg,#C8860A,#E8B84B)', borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 10, color: '#A89070', marginTop: 3 }}>{p.qty} unidades vendidas</div>
            </div>
          ))}
          {!topProducts.length && <p style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#A89070' }}>Sin datos aún</p>}
        </div>

        {/* Por categoría */}
        <div style={{ background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: 22 }}>
          <h3 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '1rem', color: '#FDF6E8', marginBottom: 18 }}>Ventas por Categoría</h3>
          {catList.map(c => (
            <div key={c.name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <div style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#F5E6C8' }}>{c.name}</div>
                <div style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: 12, color: '#8B7CF8' }}>{fmt(c.rev)}</div>
              </div>
              <div style={{ height: 4, background: 'rgba(139,124,248,0.12)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${(c.rev / maxCat) * 100}%`, background: 'linear-gradient(90deg,#5B4FD4,#8B7CF8)', borderRadius: 2 }} />
              </div>
              <div style={{ fontFamily: 'Georgia,serif', fontSize: 10, color: '#A89070', marginTop: 3 }}>{c.qty} unidades</div>
            </div>
          ))}
          {!catList.length && <p style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#A89070' }}>Sin datos aún</p>}
        </div>
      </div>

      {/* Top clientes */}
      <div style={{ background: 'rgba(10,6,20,0.85)', border: '1px solid rgba(200,134,10,0.18)', padding: 22 }}>
        <h3 style={{ fontFamily: 'Cinzel,Georgia,serif', fontSize: '1rem', color: '#FDF6E8', marginBottom: 18 }}>Clientes más Valiosos</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(200,134,10,0.18)' }}>
              {['#', 'ID Cliente', 'Pedidos', 'Total gastado', 'Desde'].map(h => (
                <th key={h} style={{ fontSize: 10, letterSpacing: 2, color: '#C8860A', textTransform: 'uppercase', padding: '8px 12px', textAlign: 'left', fontFamily: 'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((c: any, i: number) => (
              <tr key={c.id} style={{ borderBottom: '1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding: '10px 12px', fontFamily: 'Cinzel,Georgia,serif', color: '#C8860A', fontSize: 13 }}>{i + 1}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, color: '#A89070' }}>{c.id.slice(0, 8)}…</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Cinzel,Georgia,serif', color: '#4A9B8E', fontSize: 14 }}>{c.total_orders || 0}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Cinzel,Georgia,serif', color: '#E8B84B', fontSize: 14, fontWeight: 700 }}>{fmt(c.total_spent || 0)}</td>
                <td style={{ padding: '10px 12px', fontFamily: 'Georgia,serif', fontSize: 12, color: '#A89070' }}>{new Date(c.created_at).toLocaleDateString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!topCustomers.length && <p style={{ fontFamily: 'Georgia,serif', fontSize: 12, color: '#A89070', padding: '20px 0' }}>Sin clientes aún</p>}
      </div>
    </div>
  )
}
