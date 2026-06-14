'use client'
import { useEffect, Suspense } from 'react'
import { useCart } from '@/stores/cartStore'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
  const clearCart = useCart(s => s.clearCart)
  const params = useSearchParams()
  const ref = params.get('external_reference')
  useEffect(() => { clearCart() }, [clearCart])
  return (
    <div style={{ minHeight:'100vh', paddingTop:66, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:500, padding:'40px 24px' }}>
        <div style={{ fontSize:64, marginBottom:22, animation:'float 4s ease-in-out infinite' }}>✦</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', color:'var(--gold)', marginBottom:14 }}>¡Pedido Confirmado!</h1>
        {ref && <p style={{ fontFamily:'var(--font-body)', fontSize:12, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>Ref: {ref}</p>}
        <p style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'var(--stellar)', lineHeight:1.8, marginBottom:32 }}>
          El Atelier MAKANGRU está preparando tu experiencia con toda la dedicación de la Alquimia Chocolística. Te notificaremos por WhatsApp.
        </p>
        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/" style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', padding:'13px 30px', fontFamily:'var(--font-body)', fontSize:13, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none' }}>Volver al Inicio</Link>
          <a href="https://wa.me/56951975639" target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 26px', border:'1px solid rgba(37,211,102,.4)', color:'#25D366', textDecoration:'none', fontFamily:'var(--font-body)', fontSize:13 }}>💬 WhatsApp</a>
        </div>
      </div>
    </div>
  )
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)' }}>
        Cargando confirmación...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
