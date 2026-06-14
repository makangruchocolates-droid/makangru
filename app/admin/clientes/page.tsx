import { createAdminClient } from '@/lib/supabase/server'
import { fmt } from '@/lib/utils'
export default async function ClientesPage() {
  const db = createAdminClient()
  const { data: customers } = await db.from('customers').select('*').order('total_spent', { ascending:false })
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ CRM</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:28 }}>Clientes</h1>
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead><tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
            {['Cliente','Email','Teléfono','Ciudad','Pedidos','Gastado','Desde'].map(h=><th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'12px 13px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {customers?.map((c: any)=>(
              <tr key={c.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'11px 13px' }}><div style={{ display:'flex', alignItems:'center', gap:9 }}><div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg,#C8860A,#E8B84B)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', fontSize:13, color:'#02000A', fontWeight:700 }}>{(c.first_name?.[0]||c.email[0]).toUpperCase()}</div><span style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{c.first_name} {c.last_name}</span></div></td>
                <td style={{ padding:'11px 13px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{c.email}</td>
                <td style={{ padding:'11px 13px' }}>{c.phone?<a href={`https://wa.me/${c.phone?.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" style={{ color:'#25D366', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:12 }}>{c.phone}</a>:<span style={{ color:'#A89070', fontSize:12, fontFamily:'Georgia,serif' }}>—</span>}</td>
                <td style={{ padding:'11px 13px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{c.city||'—'}</td>
                <td style={{ padding:'11px 13px', fontFamily:'monospace', fontSize:13, color:'#4A9B8E', textAlign:'center' }}>{c.total_orders}</td>
                <td style={{ padding:'11px 13px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B', fontWeight:700 }}>{fmt(c.total_spent)}</td>
                <td style={{ padding:'11px 13px', fontFamily:'Georgia,serif', fontSize:11, color:'#A89070' }}>{new Date(c.created_at).toLocaleDateString('es-CL')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!customers?.length && <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>No hay clientes aún</div>}
      </div>
    </div>
  )
}
