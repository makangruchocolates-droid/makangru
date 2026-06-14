'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/stores/cartStore'
import { fmt } from '@/lib/utils'
import Link from 'next/link'

export default function CartPage() {
  const { items, removeItem, updateQty, coupon, removeCoupon, applyCoupon, subtotal, discount, total } = useCart()
  const [hyd, setHyd] = useState(false)
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{t:'ok'|'err',s:string}|null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => { setHyd(true) }, [])
  if (!hyd) return null

  const validate = async () => {
    if (!code.trim()) return; setLoading(true); setMsg(null)
    try {
      const r = await fetch('/api/coupons/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ code, subtotal: subtotal() }) })
      const d = await r.json()
      if (!r.ok) setMsg({ t:'err', s: d.error })
      else { applyCoupon({ code: d.code, type: d.type, value: d.value, discount: d.discount }); setMsg({ t:'ok', s:`✦ Cupón aplicado: ${d.type==='percentage'?d.value+'%':fmt(d.discount)} de descuento` }) }
    } catch { setMsg({ t:'err', s:'Error al validar' }) }
    setLoading(false)
  }

  if (items.length === 0) return (
    <div style={{ minHeight:'100vh', paddingTop:66, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:64, marginBottom:24 }}>🌌</div>
        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'2rem', color:'var(--cream)', marginBottom:16 }}>Tu carrito está vacío</h2>
        <p style={{ fontFamily:'var(--font-body)', color:'var(--stellar)', marginBottom:32 }}>El universo MAKANGRU te espera</p>
        <Link href="/catalogo" style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', padding:'14px 36px', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none' }}>Explorar Creaciones</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', paddingTop:66 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 32px' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>✦ Tu Selección</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,4vw,3rem)', color:'var(--cream)', marginBottom:44 }}>Carrito del Atelier</h1>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:44, alignItems:'start' }}>
          <div>
            {items.map(item => (
              <div key={item.id} style={{ display:'flex', gap:18, padding:'22px 0', borderBottom:'1px solid rgba(200,134,10,.14)', alignItems:'center' }}>
                <div style={{ width:72, height:72, borderRadius:'50%', flexShrink:0, background:(item as any).sphere||'var(--void)', boxShadow:'inset -10px -7px 20px rgba(0,0,0,.5),inset 5px 5px 12px rgba(255,255,255,.12)' }} />
                <div style={{ flex:1 }}>
                  <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--cream)', marginBottom:4 }}>{item.name}</h3>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1rem', color:'var(--gold)' }}>{fmt(item.price)}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(200,134,10,.3)' }}>
                  <button onClick={() => updateQty(item.product_id, item.quantity-1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--starlight)', padding:'8px 14px', fontSize:18 }}>−</button>
                  <span style={{ fontFamily:'monospace', color:'var(--cream)', padding:'0 12px', minWidth:32, textAlign:'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, item.quantity+1)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--starlight)', padding:'8px 14px', fontSize:18 }}>+</button>
                </div>
                <div style={{ textAlign:'right', minWidth:100 }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--gold)', fontWeight:700, marginBottom:7 }}>{fmt(item.price*item.quantity)}</p>
                  <button onClick={() => removeItem(item.product_id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--rose)', fontSize:12, fontFamily:'var(--font-body)' }}>✕ Eliminar</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:'rgba(10,6,20,.85)', border:'1px solid rgba(200,134,10,.2)', padding:28, position:'sticky', top:90 }}>
            <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--cream)', marginBottom:24 }}>Resumen</h3>
            <div style={{ marginBottom:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:14, color:'var(--stellar)', marginBottom:10 }}><span>Subtotal</span><span>{fmt(subtotal())}</span></div>
              {discount()>0 && <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:14, color:'var(--teal)', marginBottom:10 }}><span>Descuento ({coupon?.code})</span><span>−{fmt(discount())}</span></div>}
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-body)', fontSize:14, color:'var(--stellar)', marginBottom:10 }}><span>Envío</span><span style={{ color:'var(--teal)' }}>Al pagar</span></div>
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid rgba(200,134,10,.18)' }}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--cream)' }}>Total</span>
                <span style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', color:'var(--gold)', fontWeight:700 }}>{fmt(total())}</span>
              </div>
            </div>
            <div style={{ marginBottom:18 }}>
              <p style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:2, color:'var(--amber)', textTransform:'uppercase', marginBottom:8 }}>Cupón</p>
              {coupon ? (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', background:'rgba(74,155,142,.1)', border:'1px solid rgba(74,155,142,.3)' }}>
                  <span style={{ fontFamily:'monospace', fontSize:12, color:'var(--teal)' }}>{coupon.code}</span>
                  <button onClick={removeCoupon} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--rose)', fontSize:12 }}>Quitar</button>
                </div>
              ) : (
                <div style={{ display:'flex' }}>
                  <input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} onKeyDown={e=>e.key==='Enter'&&validate()} placeholder="CÓDIGO" style={{ flex:1, background:'rgba(15,10,25,.9)', border:'1px solid rgba(200,134,10,.3)', borderRight:'none', color:'var(--starlight)', padding:'9px 12px', fontFamily:'monospace', fontSize:12, outline:'none', textTransform:'uppercase' }} />
                  <button onClick={validate} disabled={loading} style={{ background:'var(--amber)', border:'none', color:'var(--obsidian)', padding:'0 14px', cursor:'pointer', fontFamily:'monospace', fontSize:11, fontWeight:700 }}>{loading?'...':'OK'}</button>
                </div>
              )}
              {msg && <p style={{ marginTop:6, fontFamily:'var(--font-body)', fontSize:11, color:msg.t==='ok'?'var(--teal)':'var(--rose)' }}>{msg.s}</p>}
            </div>
            <Link href="/checkout" style={{ display:'block', width:'100%', padding:'15px', textAlign:'center', background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none', marginBottom:10 }}>Proceder al Pago ✦</Link>
            <Link href="/catalogo" style={{ display:'block', width:'100%', padding:'11px', textAlign:'center', border:'1px solid rgba(200,134,10,.3)', color:'var(--stellar)', fontFamily:'var(--font-body)', fontSize:12, letterSpacing:2, textTransform:'uppercase', textDecoration:'none' }}>Seguir Explorando</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
