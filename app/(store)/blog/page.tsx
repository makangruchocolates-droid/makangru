import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
export const metadata = { title: 'El Observatorio · Blog' }

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase.from('blog_posts').select('*').eq('is_published',true).order('published_at',{ascending:false})

  return (
    <div style={{ minHeight:'100vh', paddingTop:72, background:'var(--cosmos)' }}>
      <div style={{ padding:'60px 24px 40px', background:'linear-gradient(to bottom,var(--obsidian),var(--cosmos))', textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:16 }}>✦ Crónicas del Atelier</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--cream)', fontWeight:700 }}>El Observatorio</h1>
      </div>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 24px' }}>
        {posts && posts.length > 0 ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:28 }}>
            {posts.map((p:any) => (
              <div key={p.id} style={{ background:'var(--void)', border:'1px solid rgba(200,134,10,0.15)' }}>
                <div style={{ height:200, background:'radial-gradient(circle at 30% 40%,rgba(61,26,10,0.4),var(--cosmos))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:72 }}>
                  {p.cover_image?.startsWith('http') ? <img src={p.cover_image} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : p.cover_image||'✦'}
                </div>
                <div style={{ padding:24 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase' }}>{p.category}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--stellar)' }}>{p.read_time_minutes} min</span>
                  </div>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', color:'var(--cream)', marginBottom:12, lineHeight:1.3 }}>{p.title}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem', color:'var(--stellar)', lineHeight:1.7, marginBottom:20 }}>{p.excerpt}</p>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)' }}>{p.published_at ? new Date(p.published_at).toLocaleDateString('es-CL',{year:'numeric',month:'long',day:'numeric'}) : ''}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--amber)' }}>Leer →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✧</div>
            <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', color:'var(--cream)', marginBottom:12 }}>El Observatorio está en construcción</h2>
            <p style={{ color:'var(--stellar)', fontFamily:'var(--font-body)' }}>Pronto compartiremos historias del Atelier</p>
          </div>
        )}
      </div>
    </div>
  )
}
