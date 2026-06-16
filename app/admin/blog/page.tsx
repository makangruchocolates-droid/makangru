import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminBlogPage() {
  const db = createAdminClient()
  const { data: posts } = await db.from('blog_posts').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Contenido</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Blog del Atelier</h1>
        </div>
        <Link href="/admin/blog/nuevo" style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'11px 22px', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:2, fontWeight:700 }}>+ Nuevo Post</Link>
      </div>

      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
              {['Título','Categoría','Estado','Lectura','Publicado',''].map(h => (
                <th key={h} style={{ fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'12px 14px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts?.map((p: any) => (
              <tr key={p.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)' }}>
                <td style={{ padding:'12px 14px' }}>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{p.title}</div>
                  {p.excerpt && <div style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#A89070', marginTop:2 }}>{p.excerpt.substring(0, 60)}…</div>}
                </td>
                <td style={{ padding:'12px 14px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{p.category || '—'}</td>
                <td style={{ padding:'12px 14px' }}>
                  <span style={{ background: p.is_published ? 'rgba(74,155,142,0.2)' : 'rgba(200,134,10,0.15)', color: p.is_published ? '#4A9B8E' : '#C8860A', padding:'3px 9px', fontFamily:'monospace', fontSize:10 }}>
                    {p.is_published ? 'Publicado' : 'Borrador'}
                  </span>
                </td>
                <td style={{ padding:'12px 14px', fontFamily:'monospace', fontSize:12, color:'#A89070' }}>{p.read_time_minutes ? `${p.read_time_minutes} min` : '—'}</td>
                <td style={{ padding:'12px 14px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>
                  {p.published_at ? new Date(p.published_at).toLocaleDateString('es-CL') : '—'}
                </td>
                <td style={{ padding:'12px 14px' }}>
                  <Link href={`/admin/blog/${p.id}`} style={{ color:'#C8860A', textDecoration:'none', fontFamily:'Georgia,serif', fontSize:13 }}>Editar →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!posts?.length && (
          <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>
            Aún no hay posts. <Link href="/admin/blog/nuevo" style={{ color:'#C8860A' }}>Crear el primero →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
