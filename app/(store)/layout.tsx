'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/stores/cartStore'
import { fmt } from '@/lib/utils'

// ─── COSMOS CANVAS ────────────────────────────────────────────────
function CosmosCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!
    const cx = cv.getContext('2d')!
    const rsz = () => { cv.width = window.innerWidth; cv.height = window.innerHeight }
    window.addEventListener('resize', rsz); rsz()

    const STARS = Array.from({length:300}, () => ({
      x:Math.random(), y:Math.random(), r:Math.random()*1.8+.3,
      o:Math.random()*.8+.2, sp:Math.random()*.002+.0005, ph:Math.random()*Math.PI*2,
      hue:Math.random()<.15?'rgba(180,160,255,':'rgba(245,230,200,',
    }))

    const GALS = [
      {x:.14,y:.18,rx:95,ry:28,rot:-.4,hue:'rgba(138,43,226,',o:.042},
      {x:.84,y:.68,rx:72,ry:22,rot:.6,hue:'rgba(200,134,10,',o:.048},
      {x:.48,y:.88,rx:115,ry:36,rot:.2,hue:'rgba(80,160,255,',o:.032},
      {x:.72,y:.1,rx:62,ry:18,rot:-.8,hue:'rgba(255,100,60,',o:.038},
      {x:.05,y:.55,rx:50,ry:16,rot:.3,hue:'rgba(100,200,180,',o:.03},
    ]
    let galAngle = 0

    const METEORS: any[] = []
    const spawnMeteor = () => {
      const a = (12 + Math.random()*22)*Math.PI/180
      METEORS.push({
        x:-80, y:Math.random()*cv.height*.65,
        vx:(6+Math.random()*8)*Math.cos(a), vy:(6+Math.random()*8)*Math.sin(a),
        len:120+Math.random()*180, r:1+Math.random()*1.4,
        o:0, life:0, maxLife:100+Math.random()*100,
        col:Math.random()<.5?'rgba(255,240,200,':'rgba(180,160,255,',
      })
    }
    const mt = setInterval(spawnMeteor, 900+Math.random()*1800)

    const RUNES = Array.from({length:22}, () => ({
      x:Math.random(), y:1.06+Math.random()*.4,
      ch:['ᚨ','ᚱ','ᚦ','ᚷ','☿','☽','⊕','♄','✦','◈','❋','◇','⊗','✧','▣','⚗','☽','ᛏ','ᛉ','ᛊ','ᚾ','ᛗ'][Math.floor(Math.random()*22)],
      sp:.00022+Math.random()*.00032, o:0, sz:12+Math.random()*10,
      drift:(Math.random()-.5)*.00007,
    }))

    const PARTS = Array.from({length:70}, () => ({
      angle:Math.random()*Math.PI*2, r:140+Math.random()*220,
      speed:.00035+Math.random()*.00055*(Math.random()<.5?1:-1),
      o:Math.random()*.055+.01, sz:.7+Math.random()*1.3,
    }))

    let T = 0
    let raf: number

    const draw = () => {
      cx.clearRect(0,0,cv.width,cv.height)
      // deep space
      const g = cx.createRadialGradient(cv.width*.5,cv.height*.4,0,cv.width*.5,cv.height*.5,cv.width*.95)
      g.addColorStop(0,'rgba(20,6,35,.98)'); g.addColorStop(.4,'rgba(6,2,14,.99)'); g.addColorStop(1,'rgba(2,0,8,1)')
      cx.fillStyle=g; cx.fillRect(0,0,cv.width,cv.height)
      // nebulae
      ;[[.27,.23,cv.width*.4,'rgba(100,30,200,',.034],[.76,.62,cv.width*.33,'rgba(180,80,10,',.042],[.5,.91,cv.width*.47,'rgba(40,80,200,',.026],[.08,.7,cv.width*.25,'rgba(20,120,100,',.028]].forEach(([fx,fy,fr,col,ao]:any)=>{
        const ng=cx.createRadialGradient(cv.width*fx,cv.height*fy,0,cv.width*fx,cv.height*fy,fr)
        ng.addColorStop(0,col+ao+')'); ng.addColorStop(1,col+'0)')
        cx.fillStyle=ng; cx.fillRect(0,0,cv.width,cv.height)
      })
      // galaxies
      galAngle+=.0007
      GALS.forEach(gal=>{
        cx.save(); cx.translate(gal.x*cv.width,gal.y*cv.height)
        cx.rotate(galAngle*(gal.rx>80?1:-1)+gal.rot)
        const gg=cx.createRadialGradient(0,0,0,0,0,gal.rx)
        gg.addColorStop(0,gal.hue+(gal.o*3)+')'); gg.addColorStop(.35,gal.hue+(gal.o*1.5)+')'); gg.addColorStop(1,gal.hue+'0)')
        cx.scale(1,gal.ry/gal.rx); cx.beginPath(); cx.arc(0,0,gal.rx,0,Math.PI*2)
        cx.fillStyle=gg; cx.fill()
        for(let a=0;a<4;a++){
          cx.beginPath(); const ar=a*Math.PI/2
          for(let t=0;t<90;t++){const tr=t/90;const rad=tr*gal.rx*1.2;const aa=ar+tr*Math.PI*3;cx.lineTo(Math.cos(aa)*rad,Math.sin(aa)*rad)}
          cx.strokeStyle=gal.hue+(gal.o*.7)+')'; cx.lineWidth=.7; cx.stroke()
        }
        cx.restore()
      })
      // orbit particles
      const pcx=cv.width*.5, pcy=cv.height*.44
      PARTS.forEach(p=>{
        p.angle+=p.speed
        const px=pcx+Math.cos(p.angle)*p.r, py=pcy+Math.sin(p.angle)*p.r
        cx.beginPath(); cx.arc(px,py,p.sz,0,Math.PI*2)
        cx.fillStyle=`rgba(200,134,10,${p.o*(0.5+0.5*Math.sin(T*.5+p.angle))})`; cx.fill()
      })
      // stars
      STARS.forEach(s=>{
        const pulse=Math.sin(T*s.sp*80+s.ph)*.35+.65
        cx.beginPath(); cx.arc(s.x*cv.width,s.y*cv.height,s.r,0,Math.PI*2)
        cx.fillStyle=s.hue+(s.o*pulse)+')'; cx.fill()
      })
      // meteors
      for(let i=METEORS.length-1;i>=0;i--){
        const m=METEORS[i]; m.x+=m.vx; m.y+=m.vy; m.life++
        if(m.life<20) m.o=m.life/20
        else if(m.life>m.maxLife-20) m.o=(m.maxLife-m.life)/20
        else m.o=1
        if(m.life>m.maxLife||m.x>cv.width+250){METEORS.splice(i,1);continue}
        const hyp=Math.hypot(m.vx,m.vy)
        const tail=cx.createLinearGradient(m.x-m.len*m.vx/hyp,m.y-m.len*m.vy/hyp,m.x,m.y)
        tail.addColorStop(0,'rgba(255,255,255,0)'); tail.addColorStop(.55,m.col+(m.o*.42)+')'); tail.addColorStop(1,m.col+(m.o*.95)+')')
        cx.beginPath(); cx.moveTo(m.x-m.len*m.vx/hyp,m.y-m.len*m.vy/hyp); cx.lineTo(m.x,m.y)
        cx.strokeStyle=tail; cx.lineWidth=m.r; cx.stroke()
        cx.beginPath(); cx.arc(m.x,m.y,m.r*1.6,0,Math.PI*2)
        cx.fillStyle=`rgba(255,250,220,${m.o*.9})`; cx.fill()
        const mg=cx.createRadialGradient(m.x,m.y,0,m.x,m.y,10)
        mg.addColorStop(0,`rgba(255,240,180,${m.o*.5})`); mg.addColorStop(1,'rgba(255,240,180,0)')
        cx.beginPath(); cx.arc(m.x,m.y,10,0,Math.PI*2); cx.fillStyle=mg; cx.fill()
      }
      // runes
      cx.textAlign='center'
      RUNES.forEach(r=>{
        r.y-=r.sp; r.x+=r.drift
        if(r.y<-.05){r.y=1.08;r.x=Math.random();r.o=0}
        r.o=r.y<.95&&r.y>.02?Math.min(.16,r.o+.0007):Math.max(0,r.o-.004)
        cx.font=`${r.sz}px serif`; cx.fillStyle=`rgba(200,134,10,${r.o})`; cx.fillText(r.ch,r.x*cv.width,r.y*cv.height)
      })
      // magic rings
      cx.save(); cx.translate(cv.width*.5,cv.height*.44)
      for(let ring=0;ring<4;ring++){
        const rad=120+ring*100
        cx.beginPath(); cx.arc(0,0,rad,0,Math.PI*2)
        cx.strokeStyle=`rgba(200,134,10,${.022-ring*.004})`; cx.lineWidth=.5; cx.stroke()
        for(let tick=0;tick<(ring===0?8:12);tick++){
          const a=tick*Math.PI*2/(ring===0?8:12)+(ring%2===0?T*.025:-T*.02)
          cx.beginPath(); cx.moveTo(Math.cos(a)*(rad-4),Math.sin(a)*(rad-4)); cx.lineTo(Math.cos(a)*(rad+4),Math.sin(a)*(rad+4))
          cx.strokeStyle=`rgba(200,134,10,0.05)`; cx.lineWidth=.5; cx.stroke()
        }
      }
      cx.restore()
      T+=.016
      raf=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); clearInterval(mt); window.removeEventListener('resize',rsz) }
  },[])
  return <canvas ref={ref} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', zIndex:0, pointerEvents:'none' }} />
}

// ─── CART SIDEBAR ────────────────────────────────────────────────
function CartSidebar({ open, onClose }: { open:boolean; onClose:()=>void }) {
  const { items, removeItem, updateQty, coupon, removeCoupon, subtotal, discount, total, count } = useCart()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{t:'ok'|'err',s:string}|null>(null)
  const [loading, setLoading] = useState(false)

  const validate = async () => {
    if (!code.trim()) return
    setLoading(true); setMsg(null)
    try {
      const r = await fetch('/api/coupons/validate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code,subtotal:subtotal()})})
      const d = await r.json()
      if (!r.ok) setMsg({t:'err',s:d.error})
      else { useCart.getState().applyCoupon({code:d.code,type:d.type,value:d.value,discount:d.discount}); setMsg({t:'ok',s:`✦ ${d.type==='percentage'?d.value+'%':'descuento'} aplicado`}) }
    } catch { setMsg({t:'err',s:'Error al validar'}) }
    setLoading(false)
  }

  const S = { sidebar:{ position:'fixed' as const, right: open?0:-440, top:0, width:440, height:'100vh', background:'rgba(6,3,14,0.98)', borderLeft:'1px solid rgba(200,134,10,0.18)', zIndex:600, transition:'right .4s ease', display:'flex', flexDirection:'column' as const } }

  return (
    <div style={S.sidebar}>
      <div style={{padding:'22px',borderBottom:'1px solid rgba(200,134,10,0.14)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h3 style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cream)'}}>Carrito del Atelier</h3>
        <button onClick={onClose} style={{background:'none',border:'none',color:'var(--stellar)',cursor:'pointer',fontSize:20}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        {items.length===0 ? (
          <div style={{textAlign:'center',padding:'50px 20px',color:'var(--stellar)',fontFamily:'var(--font-body)',fontSize:'1rem',lineHeight:2}}>🌌<br/>Tu carrito está vacío<br/><small style={{fontSize:11}}>El universo MAKANGRU te espera</small></div>
        ) : items.map(item=>(
          <div key={item.id} style={{display:'flex',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(200,134,10,0.09)',alignItems:'center'}}>
            <div style={{width:48,height:48,borderRadius:'50%',flexShrink:0,background:(item as any).sphere||'var(--void)',boxShadow:'inset -8px -6px 16px rgba(0,0,0,0.5),inset 4px 4px 10px rgba(255,255,255,0.12)'}} />
            <div style={{flex:1}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:13,color:'var(--cream)',marginBottom:3}}>{item.name}</div>
              <div style={{fontFamily:'var(--font-body)',fontSize:12,color:'var(--gold)'}}>{fmt(item.price)} × {item.quantity}</div>
            </div>
            <button onClick={()=>removeItem(item.product_id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--rose)',fontSize:15}}>✕</button>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div style={{padding:18,borderTop:'1px solid rgba(200,134,10,0.14)'}}>
          <div style={{marginBottom:14}}>
            <p style={{fontFamily:'var(--font-body)',fontSize:9,letterSpacing:2,color:'var(--amber)',textTransform:'uppercase',marginBottom:8}}>Cupón</p>
            {coupon ? (
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',background:'rgba(74,155,142,0.1)',border:'1px solid rgba(74,155,142,0.3)'}}>
                <span style={{fontFamily:'monospace',fontSize:12,color:'var(--teal)'}}>{coupon.code}</span>
                <button onClick={removeCoupon} style={{background:'none',border:'none',cursor:'pointer',color:'var(--rose)',fontSize:12}}>Quitar</button>
              </div>
            ) : (
              <div style={{display:'flex'}}>
                <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&validate()} placeholder="CÓDIGO" style={{flex:1,background:'rgba(15,10,25,0.9)',border:'1px solid rgba(200,134,10,0.3)',borderRight:'none',color:'var(--starlight)',padding:'9px 12px',fontFamily:'monospace',fontSize:12,outline:'none',textTransform:'uppercase'}} />
                <button onClick={validate} disabled={loading} style={{background:'var(--amber)',border:'none',color:'var(--obsidian)',padding:'0 14px',cursor:'pointer',fontFamily:'monospace',fontSize:11,fontWeight:700}}>{loading?'...':'OK'}</button>
              </div>
            )}
            {msg && <p style={{marginTop:6,fontFamily:'var(--font-body)',fontSize:11,color:msg.t==='ok'?'var(--teal)':'var(--rose)'}}>{msg.s}</p>}
          </div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--stellar)'}}>Subtotal</span>
            <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--starlight)'}}>{fmt(subtotal())}</span>
          </div>
          {discount()>0 && <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--teal)'}}>Descuento</span><span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--teal)'}}>−{fmt(discount())}</span></div>}
          <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid rgba(200,134,10,0.15)',marginBottom:14}}>
            <span style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',color:'var(--cream)'}}>Total</span>
            <span style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',color:'var(--gold)',fontWeight:700}}>{fmt(total())}</span>
          </div>
          <Link href="/checkout" onClick={onClose} style={{display:'block',width:'100%',padding:'14px',textAlign:'center',background:'linear-gradient(135deg,var(--amber),var(--gold))',color:'var(--obsidian)',fontFamily:'var(--font-body)',fontSize:14,letterSpacing:3,textTransform:'uppercase',fontWeight:600,textDecoration:'none'}}>Proceder al Pago ✦</Link>
        </div>
      )}
    </div>
  )
}

// ─── HEADER ──────────────────────────────────────────────────────
function Header({ onCartOpen }: { onCartOpen:()=>void }) {
  const pathname = usePathname()
  const count = useCart(s=>s.count())
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  },[])

  const nav = [
    {href:'/',l:'Inicio'},{href:'/catalogo',l:'Catálogo'},{href:'/contacto',l:'Contacto'}
  ]

  return (
    <header style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:scrolled?'rgba(2,0,10,0.9)':'transparent',backdropFilter:scrolled?'blur(20px)':'none',borderBottom:scrolled?'1px solid rgba(200,134,10,0.18)':'none',transition:'all .3s',height:66,display:'flex',alignItems:'center',padding:'0 28px',justifyContent:'space-between'}}>
      <Link href="/" style={{textDecoration:'none',display:'flex',flexDirection:'column'}}>
        <span style={{fontFamily:'var(--font-display)',fontSize:20,color:'var(--gold)',letterSpacing:5,lineHeight:1}}>MAKANGRU</span>
        <span style={{fontFamily:'var(--font-body)',fontSize:8,color:'var(--stellar)',letterSpacing:3,textTransform:'uppercase',marginTop:2}}>Atelier de la Alquimia Chocolística</span>
      </Link>
      <nav style={{display:'flex',gap:28}}>
        {nav.map(n=>(
          <Link key={n.href} href={n.href} style={{fontFamily:'var(--font-body)',fontSize:13,letterSpacing:2,textTransform:'uppercase',textDecoration:'none',color:pathname===n.href?'var(--gold)':'var(--stellar)',borderBottom:pathname===n.href?'1px solid var(--gold)':'1px solid transparent',paddingBottom:2,transition:'color .3s'}}>
            {n.l}
          </Link>
        ))}
        <Link href="/admin" style={{fontFamily:'var(--font-body)',fontSize:12,letterSpacing:2,textTransform:'uppercase',textDecoration:'none',color:'var(--stellar)',border:'1px solid rgba(200,134,10,0.28)',padding:'4px 12px',transition:'all .2s'}}>Admin</Link>
      </nav>
      <button onClick={onCartOpen} style={{background:'none',border:'none',color:'var(--starlight)',cursor:'pointer',padding:8,fontSize:18,position:'relative'}}>
        🛒
        {count>0 && <span style={{position:'absolute',top:2,right:2,width:15,height:15,background:'var(--gold)',color:'var(--obsidian)',fontSize:9,fontWeight:700,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace'}}>{count}</span>}
      </button>
    </header>
  )
}

// ─── WA BUTTON ───────────────────────────────────────────────────
function WAButton() {
  return (
    <a href="https://wa.me/56951975639?text=Hola+MAKANGRU+✦" target="_blank" rel="noopener noreferrer"
      style={{position:'fixed',bottom:26,right:26,zIndex:200,width:54,height:54,borderRadius:'50%',background:'#25D366',display:'flex',alignItems:'center',justifyContent:'center',color:'white',textDecoration:'none',fontSize:24,boxShadow:'0 4px 24px rgba(37,211,102,0.4)',transition:'transform .2s'}}
      onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.12)')}
      onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
      💬
    </a>
  )
}

// ─── MAIN LAYOUT ─────────────────────────────────────────────────
export default function StoreLayout({ children }: { children:React.ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false)
  useEffect(() => { useCart.persist.rehydrate() },[])

  return (
    <>
      <CosmosCanvas />
      <Header onCartOpen={()=>setCartOpen(true)} />
      <CartSidebar open={cartOpen} onClose={()=>setCartOpen(false)} />
      <main style={{position:'relative',zIndex:2}}>{children}</main>
      <WAButton />
    </>
  )
}
