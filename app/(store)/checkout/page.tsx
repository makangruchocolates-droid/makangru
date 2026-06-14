'use client'
import { useState, useEffect } from 'react'
import { useCart } from '@/stores/cartStore'
import { fmt } from '@/lib/utils'
import { useRouter } from 'next/navigation'

const DAYS=['dom','lun','mar','mié','jue','vie','sáb']
const MONTHS=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
function fmtDate(s:string){const d=new Date(s+'T12:00:00');return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`}

const I:React.CSSProperties={width:'100%',background:'rgba(15,10,25,.9)',border:'1px solid rgba(200,134,10,.3)',color:'var(--starlight)',padding:'12px 15px',fontFamily:'var(--font-body)',fontSize:15,outline:'none'}
const L:React.CSSProperties={display:'block',fontFamily:'var(--font-body)',fontSize:10,letterSpacing:3,color:'var(--amber)',textTransform:'uppercase',marginBottom:8}

export default function CheckoutPage(){
  const router=useRouter()
  const {items,coupon,subtotal,discount,total}=useCart()
  const [hyd,setHyd]=useState(false)
  const [step,setStep]=useState(1)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState<string|null>(null)
  const [zones,setZones]=useState<any[]>([])
  const [dates,setDates]=useState<string[]>([])
  const [dateMsg,setDateMsg]=useState('')
  const [zone,setZone]=useState<any>(null)
  const [date,setDate]=useState('')
  const [form,setForm]=useState({first_name:'',last_name:'',email:'',phone:'',address_line1:'',city:'',state:'',postal_code:'',notes:''})

  useEffect(()=>{
    setHyd(true)
    Promise.all([fetch('/api/shipping-zones').then(r=>r.json()),fetch('/api/delivery-dates').then(r=>r.json())])
      .then(([sz,dd])=>{setZones(sz.data||[]);setDates(dd.dates||[]);setDateMsg(dd.message||'')})
  },[])

  useEffect(()=>{useCart.persist.rehydrate()},[])
  if(!hyd) return null
  if(items.length===0){router.push('/carrito');return null}

  const sub=subtotal(); const dis=discount()
  const shipping=zone?(zone.free_above&&sub>=zone.free_above?0:Number(zone.price)):0
  const tot=total()+shipping
  const valid1=form.first_name&&form.last_name&&form.email&&form.phone&&form.address_line1&&form.city
  const valid2=!!zone

  const pay=async()=>{
    setLoading(true);setError(null)
    try{
      const r=await fetch('/api/checkout/create-preference',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({items,customer:form,coupon_code:coupon?.code,shipping_zone_id:zone?.id,shipping_zone_name:zone?.name,shipping_amount:shipping,delivery_date:date||null})})
      const d=await r.json()
      if(!r.ok) throw new Error(d.error)
      window.location.href=d.sandbox_init_point||d.init_point
    }catch(e:any){setError(e.message);setLoading(false)}
  }

  const set=(k:string,v:string)=>setForm(p=>({...p,[k]:v}))

  return(
    <div style={{minHeight:'100vh',paddingTop:66}}>
      <div style={{maxWidth:860,margin:'0 auto',padding:'60px 32px'}}>
        <p style={{fontFamily:'var(--font-body)',fontSize:11,letterSpacing:6,color:'var(--amber)',textTransform:'uppercase',marginBottom:14}}>✦ Atelier</p>
        <h1 style={{fontFamily:'var(--font-display)',fontSize:'2.5rem',color:'var(--cream)',marginBottom:44}}>Finalizar Pedido</h1>
        <div style={{display:'flex',marginBottom:44,borderBottom:'1px solid rgba(200,134,10,.18)'}}>
          {['Tus Datos','Envío & Entrega','Pago'].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:'center',paddingBottom:12,borderBottom:step===i+1?'2px solid var(--amber)':'2px solid transparent',fontFamily:'var(--font-body)',fontSize:13,letterSpacing:2,textTransform:'uppercase',color:step===i+1?'var(--gold)':'var(--stellar)'}}>
              {i+1}. {s}
            </div>
          ))}
        </div>

        {step===1&&(
          <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:36}}>
            <div>
              <h3 style={{fontFamily:'var(--font-display)',fontSize:'1.3rem',color:'var(--cream)',marginBottom:24}}>Información de Entrega</h3>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                {[{k:'first_name',l:'Nombre',p:'Tu nombre',c:1},{k:'last_name',l:'Apellido',p:'Tu apellido',c:1},
                  {k:'email',l:'Email',p:'tu@email.com',c:2,t:'email'},{k:'phone',l:'Teléfono / WhatsApp',p:'+56 9 XXXX XXXX',c:1},
                  {k:'address_line1',l:'Dirección',p:'Calle, número...',c:2},{k:'city',l:'Ciudad',p:'Santiago',c:1},
                  {k:'state',l:'Región',p:'Metropolitana',c:1},{k:'notes',l:'Notas (opcional)',p:'Instrucciones...',c:2,ta:true}].map(f=>(
                  <div key={f.k} style={{gridColumn:f.c===2?'1/-1':'auto'}}>
                    <label style={L}>{f.l}</label>
                    {f.ta?<textarea value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} rows={3} style={{...I,resize:'vertical'}}/>
                    :<input type={(f as any).t||'text'} value={(form as any)[f.k]} onChange={e=>set(f.k,e.target.value)} placeholder={f.p} style={I}/>}
                  </div>
                ))}
              </div>
              <button onClick={()=>valid1&&setStep(2)} disabled={!valid1} style={{marginTop:24,background:valid1?'linear-gradient(135deg,var(--amber),var(--gold))':'var(--void)',border:'none',color:valid1?'var(--obsidian)':'var(--stellar)',cursor:valid1?'pointer':'not-allowed',padding:'14px 34px',fontFamily:'var(--font-body)',fontSize:14,letterSpacing:3,textTransform:'uppercase',fontWeight:600}}>Continuar ✦</button>
            </div>
            <div style={{background:'rgba(10,6,20,.85)',border:'1px solid rgba(200,134,10,.18)',padding:22,height:'fit-content'}}>
              <h4 style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:'var(--cream)',marginBottom:16}}>Tu pedido</h4>
              {items.map(i=>(
                <div key={i.id} style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--starlight)'}}>{i.name} ×{i.quantity}</span>
                  <span style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--gold)'}}>{fmt(i.price*i.quantity)}</span>
                </div>
              ))}
              <div style={{display:'flex',justifyContent:'space-between',paddingTop:12,borderTop:'1px solid rgba(200,134,10,.18)'}}>
                <span style={{fontFamily:'var(--font-display)',color:'var(--cream)'}}>Subtotal</span>
                <span style={{fontFamily:'var(--font-display)',color:'var(--gold)',fontWeight:700}}>{fmt(sub)}</span>
              </div>
            </div>
          </div>
        )}

        {step===2&&(
          <div style={{maxWidth:640}}>
            <p style={{fontFamily:'var(--font-body)',fontSize:11,letterSpacing:3,color:'var(--amber)',textTransform:'uppercase',marginBottom:14}}>Zona de Envío</p>
            <div style={{display:'grid',gap:10,marginBottom:32}}>
              {zones.map(z=>{
                const price=z.free_above&&sub>=z.free_above?0:Number(z.price)
                const sel=zone?.id===z.id
                return(
                  <button key={z.id} onClick={()=>setZone(z)} style={{background:sel?'rgba(200,134,10,.1)':'rgba(10,6,20,.85)',border:sel?'1px solid var(--amber)':'1px solid rgba(200,134,10,.18)',padding:'14px 18px',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',textAlign:'left'}}>
                    <div>
                      <div style={{fontFamily:'var(--font-display)',fontSize:'0.95rem',color:'var(--cream)',marginBottom:3}}>{z.name}</div>
                      <div style={{fontFamily:'var(--font-body)',fontSize:11,color:'var(--stellar)'}}>{z.regions?.slice(0,4).join(', ')}{z.regions?.length>4?'...':''}</div>
                    </div>
                    <div style={{fontFamily:'var(--font-display)',fontSize:'1rem',color:price===0?'var(--teal)':'var(--gold)',fontWeight:700}}>{price===0?'GRATIS':fmt(price)}</div>
                  </button>
                )
              })}
            </div>
            {dates.length>0&&(
              <div style={{marginBottom:28}}>
                <p style={{fontFamily:'var(--font-body)',fontSize:11,letterSpacing:3,color:'var(--amber)',textTransform:'uppercase',marginBottom:10}}>Fecha de Entrega</p>
                {dateMsg&&<p style={{fontFamily:'var(--font-body)',fontSize:13,color:'var(--stellar)',marginBottom:12}}>{dateMsg}</p>}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))',gap:8}}>
                  {dates.slice(0,12).map(d=>(
                    <button key={d} onClick={()=>setDate(d)} style={{background:date===d?'rgba(200,134,10,.14)':'rgba(10,6,20,.85)',border:date===d?'1px solid var(--amber)':'1px solid rgba(200,134,10,.18)',padding:'11px',cursor:'pointer',fontFamily:'var(--font-body)',fontSize:13,color:date===d?'var(--gold)':'var(--starlight)',textAlign:'center',textTransform:'capitalize'}}>
                      {fmtDate(d)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setStep(1)} style={{background:'none',border:'1px solid rgba(200,134,10,.3)',color:'var(--stellar)',cursor:'pointer',padding:'13px 22px',fontFamily:'var(--font-body)',fontSize:13}}>← Atrás</button>
              <button onClick={()=>valid2&&setStep(3)} disabled={!valid2} style={{flex:1,background:valid2?'linear-gradient(135deg,var(--amber),var(--gold))':'var(--void)',border:'none',color:valid2?'var(--obsidian)':'var(--stellar)',cursor:valid2?'pointer':'not-allowed',padding:'13px',fontFamily:'var(--font-body)',fontSize:14,letterSpacing:3,textTransform:'uppercase',fontWeight:600}}>Revisar Pedido ✦</button>
            </div>
          </div>
        )}

        {step===3&&(
          <div style={{maxWidth:580}}>
            <div style={{background:'rgba(10,6,20,.85)',border:'1px solid rgba(200,134,10,.18)',padding:26,marginBottom:18}}>
              <p style={{fontFamily:'var(--font-body)',fontSize:10,letterSpacing:3,color:'var(--amber)',textTransform:'uppercase',marginBottom:16}}>Resumen Final</p>
              {items.map(i=>(<div key={i.id} style={{display:'flex',justifyContent:'space-between',marginBottom:9}}><span style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--starlight)'}}>{i.name} ×{i.quantity}</span><span style={{fontFamily:'var(--font-body)',fontSize:14,color:'var(--gold)'}}>{fmt(i.price*i.quantity)}</span></div>))}
              <div style={{borderTop:'1px solid rgba(200,134,10,.18)',paddingTop:12,marginTop:8}}>
                {dis>0&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:7,fontFamily:'var(--font-body)',fontSize:13,color:'var(--teal)'}}><span>Descuento</span><span>−{fmt(dis)}</span></div>}
                {zone&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:7,fontFamily:'var(--font-body)',fontSize:13,color:shipping===0?'var(--teal)':'var(--stellar)'}}><span>Envío — {zone.name}</span><span>{shipping===0?'GRATIS':fmt(shipping)}</span></div>}
                {date&&<div style={{display:'flex',justifyContent:'space-between',marginBottom:7,fontFamily:'var(--font-body)',fontSize:13,color:'var(--teal)',textTransform:'capitalize'}}><span>📅 Entrega</span><span>{fmtDate(date)}</span></div>}
                <div style={{display:'flex',justifyContent:'space-between',paddingTop:10,borderTop:'1px solid rgba(200,134,10,.18)'}}>
                  <span style={{fontFamily:'var(--font-display)',fontSize:'1.05rem',color:'var(--cream)'}}>Total</span>
                  <span style={{fontFamily:'var(--font-display)',fontSize:'1.2rem',color:'var(--gold)',fontWeight:700}}>{fmt(tot)}</span>
                </div>
              </div>
            </div>
            {error&&<div style={{background:'rgba(212,114,106,.1)',border:'1px solid rgba(212,114,106,.4)',color:'var(--rose)',padding:'11px 14px',marginBottom:18,fontFamily:'var(--font-body)',fontSize:14}}>⚠ {error}</div>}
            <div style={{display:'flex',gap:12}}>
              <button onClick={()=>setStep(2)} style={{background:'none',border:'1px solid rgba(200,134,10,.3)',color:'var(--stellar)',cursor:'pointer',padding:'13px 22px',fontFamily:'var(--font-body)',fontSize:13}}>← Atrás</button>
              <button onClick={pay} disabled={loading} style={{flex:1,background:'linear-gradient(135deg,var(--amber),var(--gold))',border:'none',color:'var(--obsidian)',cursor:loading?'not-allowed':'pointer',padding:'13px',fontFamily:'var(--font-body)',fontSize:14,letterSpacing:3,textTransform:'uppercase',fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                {loading?<><div style={{width:18,height:18,borderRadius:'50%',border:'2px solid rgba(10,8,6,.3)',borderTop:'2px solid #0A0806',animation:'spin .8s linear infinite'}}/>Procesando...</>:'Pagar con Mercado Pago ✦'}
              </button>
            </div>
            <p style={{marginTop:12,textAlign:'center',fontFamily:'var(--font-body)',fontSize:12,color:'var(--stellar)'}}>🔒 Pago 100% seguro · Mercado Pago · SSL</p>
          </div>
        )}
      </div>
    </div>
  )
}
