import Link from 'next/link'
import { PRODUCTS, CATEGORIES } from '@/lib/products'
import { fmt } from '@/lib/utils'
import AddToCartBtn from '../AddToCartBtn'

function Sphere({ g, size=110 }: { g:string; size?:number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:g, position:'relative',
      boxShadow:`inset -${size*.24}px -${size*.17}px ${size*.45}px rgba(0,0,0,.65),inset ${size*.12}px ${size*.12}px ${size*.32}px rgba(255,255,255,.18),0 0 ${size*.35}px rgba(200,134,10,.15)` }}>
      <div style={{ position:'absolute', width:'30%', height:'25%', background:'radial-gradient(ellipse,rgba(255,255,255,.6),transparent 70%)', top:'11%', left:'17%', borderRadius:'50%' }} />
    </div>
  )
}

export default function CatalogPage({ searchParams }: { searchParams: any }) {
  const cat = searchParams?.cat || 'all'
  const products = cat === 'all' ? PRODUCTS : PRODUCTS.filter((p: any) => p.cat === cat)
  return (
    <div style={{ minHeight:'100vh', paddingTop:66 }}>
      <div style={{ padding:'50px 32px 30px', textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>✦ El Atelier</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--cream)' }}>Catálogo de Creaciones</h1>
      </div>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px 80px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:36 }}>
          <Link href="/catalogo" style={{ padding:'8px 18px', background:cat==='all'?'rgba(200,134,10,.14)':'transparent', border:'1px solid rgba(200,134,10,.32)', color:cat==='all'?'var(--gold)':'var(--stellar)', fontFamily:'var(--font-body)', fontSize:12, letterSpacing:1, textDecoration:'none' }}>◈ Todos</Link>
          {CATEGORIES.map((c: any) => (
            <Link key={c.id} href={`/catalogo?cat=${c.id}`} style={{ padding:'8px 18px', background:cat===c.id?'rgba(200,134,10,.14)':'transparent', border:'1px solid rgba(200,134,10,.32)', color:cat===c.id?'var(--gold)':'var(--stellar)', fontFamily:'var(--font-body)', fontSize:12, letterSpacing:1, textDecoration:'none' }}>
              {c.icon} {c.name}
            </Link>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:22 }}>
          {products.map((p: any) => (
            <div key={p.id} style={{ background:'rgba(10,6,20,.85)', border:'1px solid rgba(200,134,10,.16)', overflow:'hidden', transition:'all .35s' }}>
              <Link href={`/producto/${p.slug}`} style={{ textDecoration:'none', display:'block' }}>
                <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at 40% 35%,rgba(40,15,5,.55),rgba(2,0,10,.92))', position:'relative' }}>
                  {p.isNew && <span style={{ position:'absolute', top:14, left:14, background:'var(--gold)', color:'var(--obsidian)', padding:'3px 10px', fontFamily:'monospace', fontSize:8, letterSpacing:2, fontWeight:700 }}>NUEVO</span>}
                  {p.isSale && <span style={{ position:'absolute', top:14, right:14, background:'var(--rose)', color:'white', padding:'3px 10px', fontFamily:'monospace', fontSize:8 }}>OFERTA</span>}
                  <Sphere g={p.sphere} />
                </div>
                <div style={{ padding:'18px 20px 0' }}>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:7 }}>{p.catName}</p>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--cream)', marginBottom:7 }}>{p.name}</h3>
                  <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)', fontStyle:'italic', lineHeight:1.6, marginBottom:14, height:38, overflow:'hidden' }}>{p.tagline}</p>
                </div>
              </Link>
              <div style={{ padding:'0 20px 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', color:'var(--gold)', fontWeight:700 }}>{fmt(p.price)}</div>
                  {p.oldPrice && <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--stellar)', textDecoration:'line-through' }}>{fmt(p.oldPrice)}</div>}
                </div>
                <AddToCartBtn product={p} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
