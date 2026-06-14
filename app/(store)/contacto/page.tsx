'use client'
import { useState } from 'react'
export default function ContactoPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const I:React.CSSProperties = { width:'100%', background:'rgba(15,10,25,.9)', border:'1px solid rgba(200,134,10,.3)', color:'var(--starlight)', padding:'12px 15px', fontFamily:'var(--font-body)', fontSize:15, outline:'none' }
  const L:React.CSSProperties = { display:'block', fontFamily:'var(--font-body)', fontSize:10, letterSpacing:3, color:'var(--amber)', textTransform:'uppercase', marginBottom:8 }
  const submit = async () => {
    if (!form.name||!form.email||!form.message) return; setLoading(true)
    const r = await fetch('/api/contact', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })
    if (r.ok) setSent(true); setLoading(false)
  }
  return (
    <div style={{ minHeight:'100vh', paddingTop:66 }}>
      <div style={{ padding:'50px 32px 30px', textAlign:'center' }}>
        <p style={{ fontFamily:'var(--font-body)', fontSize:11, letterSpacing:6, color:'var(--amber)', textTransform:'uppercase', marginBottom:14 }}>✦ El Atelier</p>
        <h1 style={{ fontFamily:'var(--font-display)', fontSize:'clamp(2rem,5vw,3.5rem)', color:'var(--cream)' }}>Contacto</h1>
      </div>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'0 32px 80px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:56 }}>
        <div>
          <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.7rem', color:'var(--cream)', marginBottom:18 }}>Hablemos del Cosmos</h2>
          <p style={{ fontFamily:'var(--font-body)', fontSize:'1rem', color:'var(--stellar)', lineHeight:1.8, marginBottom:28 }}>Para pedidos personalizados, regalos corporativos o explorar el universo MAKANGRU.</p>
          {[{icon:'✉',l:'Email',v:'hola@makangru.cl'},{icon:'📱',l:'WhatsApp',v:'+56 9 5197 5639'},{icon:'📍',l:'País',v:'Chile'}].map(c=>(
            <div key={c.l} style={{ display:'flex', alignItems:'center', gap:14, marginBottom:12, padding:'13px 17px', background:'rgba(10,6,20,.7)', border:'1px solid rgba(200,134,10,.14)' }}>
              <span style={{ fontSize:20 }}>{c.icon}</span>
              <div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:9, letterSpacing:2, color:'var(--amber)', textTransform:'uppercase', marginBottom:3 }}>{c.l}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:15, color:'var(--starlight)' }}>{c.v}</div>
              </div>
            </div>
          ))}
          <a href="https://wa.me/56951975639" target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:10, marginTop:16, padding:'13px 24px', background:'rgba(37,211,102,.08)', border:'1px solid rgba(37,211,102,.3)', color:'#25D366', textDecoration:'none', fontFamily:'var(--font-body)', fontSize:13, letterSpacing:2 }}>💬 Escribirnos por WhatsApp</a>
        </div>
        <div>
          {sent ? (
            <div style={{ textAlign:'center', padding:'60px 0' }}>
              <div style={{ fontSize:48, marginBottom:18 }}>✦</div>
              <h3 style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', color:'var(--gold)', marginBottom:10 }}>Mensaje Enviado</h3>
              <p style={{ fontFamily:'var(--font-body)', color:'var(--stellar)', lineHeight:1.7 }}>El Atelier responderá en las próximas horas.</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:13 }}>
              {[{k:'name',l:'Nombre',p:'Tu nombre'},{k:'email',l:'Email',p:'tu@email.com'},{k:'phone',l:'Teléfono',p:'+56 9...'},{k:'subject',l:'Asunto',p:'¿En qué podemos ayudarte?'}].map(f=>(
                <div key={f.k}>
                  <label style={L}>{f.l}</label>
                  <input value={(form as any)[f.k]} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} placeholder={f.p} style={I} />
                </div>
              ))}
              <div><label style={L}>Mensaje</label><textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="Tu mensaje..." rows={5} style={{...I,resize:'vertical'}} /></div>
              <button onClick={submit} disabled={loading} style={{ background:'linear-gradient(135deg,var(--amber),var(--gold))', border:'none', color:'var(--obsidian)', cursor:'pointer', padding:'14px', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', fontWeight:600 }}>{loading?'Enviando...':'Enviar Mensaje ✦'}</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
