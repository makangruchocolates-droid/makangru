import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getPost(slug: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post no encontrado · MAKANGRU' }
  return {
    title: `${post.title} · El Observatorio · MAKANGRU`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.cover_image?.startsWith('http') ? [{ url: post.cover_image, width: 1200, height: 630, alt: post.title }] : undefined,
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) notFound()

  return (
    <div style={{ minHeight:'100vh', paddingTop:72, background:'var(--cosmos)' }}>
      <div style={{ maxWidth:760, margin:'0 auto', padding:'60px 24px 100px' }}>
        <Link href="/blog" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:36, fontFamily:'var(--font-body)', fontSize:12, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', color:'var(--stellar)' }}>← Volver al Observatorio</Link>

        {post.cover_image?.startsWith('http') && (
          <div style={{ height:340, marginBottom:32, overflow:'hidden', border:'1px solid rgba(200,134,10,0.15)' }}>
            <img src={post.cover_image} alt={post.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          </div>
        )}

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          {post.category && <span style={{ fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase' }}>{post.category}</span>}
          <div style={{ display:'flex', gap:14, fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)' }}>
            {post.published_at && <span>{new Date(post.published_at).toLocaleDateString('es-CL',{ year:'numeric', month:'long', day:'numeric' })}</span>}
            {post.read_time_minutes && <span>· {post.read_time_minutes} min de lectura</span>}
          </div>
        </div>

        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', color:'var(--cream)', fontWeight:700, lineHeight:1.15, marginBottom:20 }}>{post.title}</h1>

        {post.excerpt && <p style={{ fontFamily:'var(--font-body)', fontSize:'1.15rem', color:'var(--stellar)', fontStyle:'italic', lineHeight:1.7, marginBottom:36 }}>{post.excerpt}</p>}

        <div style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'var(--starlight)', lineHeight:2, whiteSpace:'pre-wrap' }}>
          {post.content}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:40, paddingTop:24, borderTop:'1px solid rgba(200,134,10,0.15)' }}>
            {post.tags.map((tag: string) => (
              <span key={tag} style={{ background:'rgba(200,134,10,0.08)', border:'1px solid rgba(200,134,10,0.22)', color:'var(--stellar)', padding:'4px 14px', fontFamily:'var(--font-body)', fontSize:12 }}>#{tag}</span>
            ))}
          </div>
        )}

        <div style={{ marginTop:44, textAlign:'center' }}>
          <Link href="/catalogo" style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', padding:'13px 32px', fontFamily:'var(--font-body)', fontSize:13, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none' }}>Ver Catálogo →</Link>
        </div>
      </div>
    </div>
  )
}
