import { PRODUCTS } from '@/lib/products'
import { fmt } from '@/lib/utils'
import { notFound } from 'next/navigation'
import AddToCartBtn from '../../AddToCartBtn'

function Sphere({ g }: { g:string }) {
  return (
    <div style={{ width:200, height:200, borderRadius:'50%', background:g, position:'relative',
      boxShadow:'inset -48px -34px 90px rgba(0,0,0,.7),inset 24px 24px 64px rgba(255,255,255,.2),0 0 80px rgba(200,134,10,.3)',
      animation:'sfloat 4s ease-in-out infinite' }}>
      <div style={{ position:'absolute', width:'28%', height:'23%', background:'radial-gradient(ellipse,rgba(255,255,255,.65),transparent 70%)', top:'11%', left:'17%', borderRadius:'50%' }} />
      <style>{`@keyframes sfloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-14px) rotate(5deg)}}`}</style>
    </div>
  )
}

export async function generateMetadata({ params }: any) {
  const p = PRODUCTS.find(x => x.slug === params.slug)
  return { title: p?.name || 'Producto', description: p?.tagline }
}

export default function ProductPage({ params }: any) {
  const p = PRODUCTS.find(x => x.slug === params.slug)
  if (!p) notFound()
  return (
    <div style={{ minHeight:'100vh', paddingTop:66 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 32px' }}>
        <a href="/catalogo" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:44, fontFamily:'var(--font-body)', fontSize:12, letterSpacing:2, textTransform:'uppercase', textDecoration:'none', color:'var(--stellar)' }}>← Volver al Catálogo</a>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'start' }}>
          <div style={{ height:480, display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at center,rgba(40,15,5,.5),rgba(2,0,10,.95))', border:'1px solid rgba(200,134,10,.15)' }}>
            {p && <Sphere g={p.sphere} />}
          </div>
          <div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:5, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>{p?.catName}</p>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3rem)', color:'var(--cream)', fontWeight:700, lineHeight:1.1, marginBottom:14 }}>{p?.name}</h1>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'1.1rem', color:'var(--stellar)', fontStyle:'italic', lineHeight:1.6, marginBottom:26 }}>{p?.tagline}</p>
            <div style={{ display:'flex', alignItems:'baseline', gap:14, marginBottom:30 }}>
              <span style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--gold)', fontWeight:700 }}>{p && fmt(p.price)}</span>
              {p?.oldPrice && <span style={{ fontFamily:'var(--font-body)', fontSize:'1.1rem', color:'var(--stellar)', textDecoration:'line-through' }}>{fmt(p.oldPrice)}</span>}
            </div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--starlight)', lineHeight:1.9, marginBottom:22 }}>{p?.desc}</p>
            {p?.story && (
              <div style={{ borderLeft:'3px solid var(--amber)', padding:'14px 18px', marginBottom:26, background:'rgba(200,134,10,.05)', border:'1px solid rgba(200,134,10,.18)', borderLeftWidth:3 }}>
                <p style={{ fontFamily:'var(--font-body)', fontSize:'0.95rem', color:'var(--stellar)', lineHeight:1.8, fontStyle:'italic' }}>{p.story}</p>
              </div>
            )}
            {p?.ingredients && p.ingredients.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <p style={{ fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:10 }}>Ingredientes</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                  {p.ingredients.map((ing: string) => (
                    <span key={ing} style={{ background:'rgba(15,10,25,.9)', border:'1px solid rgba(200,134,10,.22)', color:'var(--stellar)', padding:'3px 12px', fontFamily:'var(--font-body)', fontSize:12 }}>{ing}</span>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap', marginBottom:16 }}>
              {p && <AddToCartBtn product={p} />}
              <a href={`https://wa.me/56951975639?text=Hola+MAKANGRU+✦+me+interesa:+${encodeURIComponent(p?.name||'')}`} target="_blank" rel="noopener noreferrer"
                style={{ color:'#25D366', textDecoration:'none', fontFamily:'var(--font-body)', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                💬 Consultar por WhatsApp
              </a>
            </div>
            <p style={{ fontFamily:'var(--font-body)', fontSize:12, color: (p?.stock||0) < 10 ? 'var(--rose)' : 'var(--stellar)' }}>
              {(p?.stock||0) < 10 ? `⚠ Solo ${p?.stock} unidades disponibles` : '✦ En stock'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
