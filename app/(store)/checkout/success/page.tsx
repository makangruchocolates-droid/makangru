'use client'
import { useEffect, useState, Suspense } from 'react'
import { useCart } from '@/stores/cartStore'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const fmt = (n:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(n)

function SuccessContent() {
  const clearCart = useCart(s => s.clearCart)
  const params = useSearchParams()
  const ref = params.get('external_reference')
  const method = params.get('method')
  const orderNumber = params.get('order_number')
  const total = params.get('total')
  const [waNumber, setWaNumber] = useState('56951975639')

  useEffect(() => { clearCart() }, [clearCart])
  useEffect(() => {
    if (method === 'transfer') {
      fetch('/api/settings/public').then(r=>r.json()).then(d => { if (d.data?.whatsapp_number) setWaNumber(d.data.whatsapp_number) }).catch(() => {})
    }
  }, [method])

  const isTransfer = method === 'transfer'
  const waMsg = `Hola MAKANGRU ✦ Quiero pagar mi pedido ${orderNumber||''} por ${total?fmt(Number(total)):''} vía transferencia. ¿Me pueden enviar los datos bancarios?`

  return (
    <div style={{ minHeight:'100vh', paddingTop:66, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center', maxWidth:520, padding:'40px 24px' }}>
        <div style={{ fontSize:64, marginBottom:22, animation:'float 4s ease-in-out infinite' }}>✦</div>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'2.5rem', color:'var(--gold)', marginBottom:14 }}>¡Pedido Confirmado!</h1>
        {(ref||orderNumber) && <p style={{ fontFamily:'var(--font-body)', fontSize:12, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>Ref: {ref||orderNumber}</p>}

        {!isTransfer && (
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1.05rem', color:'var(--stellar)', lineHeight:1.8, marginBottom:32 }}>
            El Atelier MAKANGRU está preparando tu experiencia con toda la dedicación de la Alquimia Chocolística. Te notificaremos por WhatsApp.
          </p>
        )}

        {isTransfer && (
          <div style={{ textAlign:'center', background:'rgba(10,6,20,.85)', border:'1px solid rgba(200,134,10,.25)', padding:26, marginBottom:28 }}>
            <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:2, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>Un paso más</p>
            <p style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--stellar)', lineHeight:1.7, marginBottom:8 }}>
              Escríbenos por WhatsApp con tu número de pedido y te enviamos los datos para transferir de inmediato.
            </p>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--gold)', fontWeight:700 }}>{total?fmt(Number(total)):''}</p>
          </div>
        )}

        <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Link href="/" style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', color:'var(--obsidian)', padding:'13px 30px', fontFamily:'var(--font-body)', fontSize:13, letterSpacing:3, textTransform:'uppercase', fontWeight:600, textDecoration:'none' }}>Volver al Inicio</Link>
          <a href={`https://wa.me/${waNumber}?text=${encodeURIComponent(isTransfer?waMsg:'')}`} target="_blank" rel="noopener noreferrer" style={{ display:'flex', alignItems:'center', gap:8, padding:'13px 26px', border:'1px solid rgba(37,211,102,.4)', color:'#25D366', textDecoration:'none', fontFamily:'var(--font-body)', fontSize:13, fontWeight: isTransfer ? 700 : 400 }}>
            💬 {isTransfer ? 'Pedir datos de transferencia' : 'WhatsApp'}
          </a>
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
