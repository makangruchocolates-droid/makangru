import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminProductos() {
  const db = createAdminClient()
  const { data: products } = await db.from('products').select('*, category:categories(name)').order('created_at', { ascending:false })
  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Catálogo</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Productos</h1>
        </div>
        <Link href="/admin/productos/nuevo" style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'11px 22px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:2, fontWeight:700 }}>+ Nuevo Producto</Link>
      </div>
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
              {['Producto','Categoría','Precio','Stock','Estado',''].map(h => (
                <th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'12px 14px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products?.map((p: any) => (
              <tr key={p.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:14, color:'#F5E6C8' }}>{p.name}</div>
                  <div style={{ fontFamily:'monospace', fontSize:10, color:'#A89070' }}>{p.sku || '—'}</div>
                </td>
                <td style={{ padding:'12px 14px', fontFamily:'Georgia,serif', fontSize:13, color:'#A89070' }}>{(p.category as any)?.name || '—'}</td>
                <td style={{ padding:'12px 14px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{fmt(p.price)}</td>
                <td style={{ padding:'12px 14px', fontFamily:'monospace', fontSize:14, color: p.stock <= p.low_stock_alert ? '#D4726A' : '#4A9B8E', fontWeight:700 }}>{p.stock}</td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ background:p.is_active?'rgba(74,155,142,0.2)':'rgba(212,114,106,0.2)', color:p.is_active?'#4A9B8E':'#D4726A', padding:'2px 8px', fontFamily:'monospace', fontSize:10 }}>{p.is_active?'Activo':'Oculto'}</span>
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <Link href={`/admin/productos/${p.id}`} style={{ color:'#C8860A', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>Editar →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!products?.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay productos. <Link href="/admin/productos/nuevo" style={{ color:'#C8860A' }}>Crear el primero →</Link></div>}
      </div>
    </div>
  )
}
