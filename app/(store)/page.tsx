'use client'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'
import { fmt } from '@/lib/utils'
import AddToCartBtn from './AddToCartBtn'

function Sphere({ gradient, size=110 }: { gradient:string; size?:number }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:gradient, position:'relative',
      boxShadow:`inset -${size*.24}px -${size*.17}px ${size*.45}px rgba(0,0,0,0.65), inset ${size*.12}px ${size*.12}px ${size*.32}px rgba(255,255,255,0.18), inset 0 0 ${size*.7}px rgba(0,0,0,0.3), 0 0 ${size*.35}px rgba(200,134,10,0.15), 0 ${size*.07}px ${size*.28}px rgba(0,0,0,0.6)`,
      transition:'transform .4s, box-shadow .4s',
    }}>
      <div style={{position:'absolute',width:'30%',height:'25%',background:'radial-gradient(ellipse,rgba(255,255,255,0.62),transparent 70%)',top:'11%',left:'17%',borderRadius:'50%'}} />
    </div>
  )
}

const featured = PRODUCTS.filter(p => p.isNew || p.isSale).slice(0, 4)

export default function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'100px 24px 60px', position:'relative', overflow:'hidden' }}>
        {/* Rings */}
        {[700,520,360,220].map((sz,i) => (
          <div key={i} style={{
            position:'absolute', width:sz, height:sz, borderRadius:'50%',
            border:`1px solid rgba(${i%2===0?'200,134,10':'138,43,226'},${.1+i*.02})`,
            top:'50%', left:'50%',
            animation:`rspin ${90-i*15}s linear infinite${i%2===0?'':' reverse'}`,
          }}>
            {i===0 && ['ᚨ','ᚱ','ᚦ','ᚷ','✦','◈','❋','◇'].map((r,j) => (
              <span key={j} style={{
                position:'absolute', fontSize:14, color:'rgba(200,134,10,0.38)',
                animation:'sigpulse 3s ease-in-out infinite',
                animationDelay:`${j*.4}s`,
                top: j<2?'-1%':j<4?'50%':j<6?'98%':'50%',
                left: j===1||j===5?'50%':j===0||j===4?'10%':j===2||j===6?'50%':'88%',
                transform:'translate(-50%,-50%)',
              }}>{r}</span>
            ))}
            {i===1 && ['☿','☽','⊕','♄'].map((r,j) => (
              <span key={j} style={{ position:'absolute', fontSize:13, color:'rgba(138,43,226,0.4)', animation:'sigpulse 4s ease-in-out infinite', animationDelay:`${j*.5}s`, top:j===0?'-2%':j===1?'50%':j===2?'100%':'50%', left:j===0||j===2?'50%':j===1?'100%':'-1%', transform:'translate(-50%,-50%)' }}>{r}</span>
            ))}
          </div>
        ))}
        <div className="animate-fade-up" style={{ position:'relative', zIndex:3, maxWidth:800 }}>
          <p style={{ fontFamily:'var(--font-body)', fontSize:12, letterSpacing:7, color:'var(--amber)', textTransform:'uppercase', marginBottom:26 }}>✦ Atelier de la Alquimia Chocolística · Chile ✦</p>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2.8rem,7vw,5.5rem)', fontWeight:700, lineHeight:1.05, color:'var(--cream)', marginBottom:22 }}>
            Donde el cacao<br /><em style={{ color:'var(--gold)', fontStyle:'italic', fontFamily:'var(--font-body)' }}>encuentra las estrellas</em>
          </h1>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'clamp(1.05rem,2vw,1.3rem)', color:'var(--stellar)', lineHeight:1.85, marginBottom:44, maxWidth:620, marginLeft:'auto', marginRight:'auto' }}>
            No vendemos chocolates. Creamos universos de sabor.<br />Cada bombón, un planeta. Cada bocado, una constelación.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <Link href="/catalogo" style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', padding:'15px 38px', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none', transition:'transform .2s' }}>Explorar Creaciones</Link>
            <Link href="/contacto" style={{ background:'transparent', border:'1px solid rgba(200,134,10,0.5)', color:'var(--starlight)', padding:'15px 38px', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', textDecoration:'none' }}>Contacto</Link>
          </div>
        </div>
        <div style={{ position:'absolute', bottom:28, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:8, opacity:.35 }}>
          <span style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:3, color:'var(--stellar)', textTransform:'uppercase' }}>Descubrir</span>
          <div style={{ width:1, height:36, background:'linear-gradient(to bottom,var(--amber),transparent)' }} />
        </div>
      </section>

      {/* FEATURED */}
      <section style={{ padding:'0 32px 80px', maxWidth:1280, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:48 }}>
          <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:12 }}>✦ Creaciones Destacadas</p>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(1.8rem,3.5vw,3rem)', color:'var(--cream)' }}>Universos de <em style={{ color:'var(--gold)', fontStyle:'italic', fontFamily:'var(--font-body)' }}>Sabor</em></h2>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:22 }}>
          {featured.map(p => (
            <div key={p.id} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.16)', overflow:'hidden', transition:'all .35s', cursor:'pointer' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(200,134,10,0.55)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-5px)'; (e.currentTarget as HTMLDivElement).style.boxShadow='0 24px 70px rgba(138,43,226,0.18)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor='rgba(200,134,10,0.16)'; (e.currentTarget as HTMLDivElement).style.transform=''; (e.currentTarget as HTMLDivElement).style.boxShadow='' }}>
              <Link href={`/producto/${p.slug}`} style={{ textDecoration:'none', display:'block' }}>
                <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center', background:'radial-gradient(circle at 40% 35%,rgba(40,15,5,0.55),rgba(2,0,10,0.92))', position:'relative' }}>
                  {p.isNew && <span style={{ position:'absolute', top:14, left:14, background:'var(--gold)', color:'var(--obsidian)', padding:'3px 10px', fontFamily:'monospace', fontSize:8, letterSpacing:2, fontWeight:700 }}>NUEVO</span>}
                  {p.isSale && <span style={{ position:'absolute', top:14, right:14, background:'var(--rose)', color:'white', padding:'3px 10px', fontFamily:'monospace', fontSize:8, letterSpacing:2 }}>OFERTA</span>}
                  <Sphere gradient={p.sphere} />
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
        <div style={{ textAlign:'center', marginTop:44 }}>
          <Link href="/catalogo" style={{ border:'1px solid rgba(200,134,10,0.5)', color:'var(--gold)', padding:'13px 34px', fontFamily:'var(--font-body)', fontSize:13, letterSpacing:3, textTransform:'uppercase', textDecoration:'none' }}>Ver Todo el Catálogo →</Link>
        </div>
      </section>

      {/* QUOTE */}
      <section style={{ textAlign:'center', padding:'80px 40px', background:'linear-gradient(135deg,rgba(40,15,5,0.12),rgba(10,6,20,0.4))', position:'relative' }}>
        <div className="animate-float" style={{ fontSize:50, marginBottom:22 }}>✦</div>
        <blockquote style={{ fontFamily:'var(--font-body)', fontSize:'clamp(1.4rem,2.8vw,2.2rem)', fontStyle:'italic', color:'var(--cream)', maxWidth:780, margin:'0 auto 20px', lineHeight:1.5 }}>
          "La Alquimia Chocolística es el arte de transformar cacao, imaginación, simbolismo y emoción en experiencias extraordinarias"
        </blockquote>
        <div style={{ width:55, height:1, background:'var(--amber)', margin:'0 auto' }} />
      </section>

      {/* FOOTER */}
      <footer style={{ background:'rgba(3,1,8,0.96)', borderTop:'1px solid rgba(200,134,10,0.14)', padding:'50px 32px 24px' }}>
        <div style={{ maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:36, marginBottom:36 }}>
            <div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--gold)', letterSpacing:3, marginBottom:7 }}>MAKANGRU</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:8, color:'var(--stellar)', letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Atelier de la Alquimia Chocolística</div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)', lineHeight:1.7 }}>Donde el cacao encuentra las estrellas. Alta Chocolatería Cósmica artesanal desde Chile.</p>
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:12 }}>Catálogo</p>
              {['Bombones Galaxia','Tabletas Cósmicas','Cajas Atelier','Edición Limitada'].map(l => (
                <Link key={l} href="/catalogo" style={{ display:'block', fontFamily:'var(--font-body)', fontSize:13, color:'var(--stellar)', marginBottom:9, textDecoration:'none' }}>{l}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:12 }}>Atelier</p>
              <Link href="/contacto" style={{ display:'block', fontFamily:'var(--font-body)', fontSize:13, color:'var(--stellar)', marginBottom:9, textDecoration:'none' }}>Contacto</Link>
              <Link href="/admin" style={{ display:'block', fontFamily:'var(--font-body)', fontSize:13, color:'var(--stellar)', marginBottom:9, textDecoration:'none' }}>Panel Admin</Link>
            </div>
            <div>
              <p style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:12 }}>Contacto</p>
              <p style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--stellar)', lineHeight:1.9 }}>Chile<br />hola@makangru.cl<br />WhatsApp: +56 9 5197 5639</p>
            </div>
          </div>
          <div style={{ borderTop:'1px solid rgba(200,134,10,0.12)', paddingTop:22, display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--stellar)' }}>© {new Date().getFullYear()} MAKANGRU. Todos los derechos reservados.</span>
            <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--stellar)' }}>Hecho con ✦ en Chile</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
