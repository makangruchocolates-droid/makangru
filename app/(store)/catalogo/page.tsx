import Link from 'next/link'
import { PRODUCTS, CATEGORIES } from '@/lib/products'
import { fmt } from '@/lib/utils'
import { createAdminClient } from '@/lib/supabase/server'
import { fallbackGradient, firstImage } from '@/lib/productVisual'
import { fallbackProductForDatabase } from '@/lib/commerce/catalog'
import AddToCartBtn from '../AddToCartBtn'

function Sphere({ gradient, size=110 }: { gradient:string; size?:number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:gradient, position:'relative',
      boxShadow:`inset -${size*.24}px -${size*.17}px ${size*.45}px rgba(0,0,0,.65),inset ${size*.12}px ${size*.12}px ${size*.32}px rgba(255,255,255,.18),0 0 ${size*.35}px rgba(200,134,10,.15)` }}>
      <div style={{ position:'absolute', width:'30%', height:'25%', background:'radial-gradient(ellipse,rgba(255,255,255,.6),transparent 70%)', top:'11%', left:'17%', borderRadius:'50%' }} />
    </div>
  )
}

async function getCatalog() {
  const db = createAdminClient()
  const [{ data: products }, { data: categories }] = await Promise.all([
    db.from('products').select('*, category:categories(name,slug)').eq('is_active', true).order('created_at', { ascending:false }),
    db.from('categories').select('id,name,slug,icon').eq('is_active', true).order('sort_order'),
  ])
  if (products?.length) return { products, categories:categories || [] }
  return {
    products:PRODUCTS.map(fallbackProductForDatabase),
    categories:CATEGORIES.map(category => ({ ...category, slug:category.id })),
  }
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const { cat='all' } = await searchParams
  const catalog = await getCatalog()
  const products = cat === 'all' ? catalog.products : catalog.products.filter((product: any) => product.category?.slug === cat || product.category?.id === cat)

  return (
    <div style={{ minHeight:'100vh', paddingTop:66 }}>
      <div style={{ padding:'50px 32px 30px', textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>✦ El Atelier</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--cream)' }}>Catálogo de Creaciones</h1>
      </div>
      <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 32px 80px' }}>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'center', marginBottom:36 }}>
          <Link href="/catalogo" style={{ padding:'8px 18px', background:cat==='all'?'rgba(200,134,10,.14)':'transparent', border:'1px solid rgba(200,134,10,.32)', color:cat==='all'?'var(--gold)':'var(--stellar)', fontFamily:'var(--font-body)', fontSize:12, letterSpacing:1, textDecoration:'none' }}>◈ Todos</Link>
          {catalog.categories.map((category: any) => (
            <Link key={category.id} href={`/catalogo?cat=${category.slug}`} style={{ padding:'8px 18px', background:cat===category.slug?'rgba(200,134,10,.14)':'transparent', border:'1px solid rgba(200,134,10,.32)', color:cat===category.slug?'var(--gold)':'var(--stellar)', fontFamily:'var(--font-body)', fontSize:12, letterSpacing:1, textDecoration:'none' }}>
              {category.icon} {category.name}
            </Link>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:22 }}>
          {products.map((product: any) => {
            const image = firstImage(product.images)
            const gradient = product.sphere || fallbackGradient(product.id)
            const onSale = Number(product.compare_price || 0) > Number(product.price)
            const cartProduct = { ...product, sphere:gradient, stock:Number(product.stock || 0) }
            return (
              <div key={product.id} style={{ background:'rgba(10,6,20,.85)', border:'1px solid rgba(200,134,10,.16)', overflow:'hidden' }}>
                <Link href={`/producto/${product.slug}`} style={{ textDecoration:'none', display:'block' }}>
                  <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at 40% 35%,rgba(40,15,5,.55),rgba(2,0,10,.92))', position:'relative', overflow:'hidden' }}>
                    {product.is_new && <span style={{ position:'absolute', top:14, left:14, background:'var(--gold)', color:'var(--obsidian)', padding:'3px 10px', fontFamily:'monospace', fontSize:8, letterSpacing:2, fontWeight:700, zIndex:2 }}>NUEVO</span>}
                    {onSale && <span style={{ position:'absolute', top:14, right:14, background:'var(--rose)', color:'white', padding:'3px 10px', fontFamily:'monospace', fontSize:8, zIndex:2 }}>OFERTA</span>}
                    {image ? <img src={image} alt={product.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : <Sphere gradient={gradient} />}
                  </div>
                  <div style={{ padding:'18px 20px 0' }}>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:7 }}>{product.category?.name || 'MAKANGRU'}</p>
                    <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.05rem', color:'var(--cream)', marginBottom:7 }}>{product.name}</h3>
                    <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)', fontStyle:'italic', lineHeight:1.6, marginBottom:14, height:38, overflow:'hidden' }}>{product.tagline}</p>
                  </div>
                </Link>
                <div style={{ padding:'0 20px 20px', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div>
                    <div style={{ fontFamily:'var(--font-display)', fontSize:'1.15rem', color:'var(--gold)', fontWeight:700 }}>{fmt(product.price)}</div>
                    {onSale && <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--stellar)', textDecoration:'line-through' }}>{fmt(product.compare_price)}</div>}
                  </div>
                  <AddToCartBtn product={cartProduct} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
