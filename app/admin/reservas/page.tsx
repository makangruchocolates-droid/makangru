'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 12px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }

const STATUS_COLORS: Record<string,string> = { pending:'#C8860A', confirmed:'#4A9B8E', ready:'#8B7CF8', completed:'#5CB85C', cancelled:'#D4726A' }
const STATUS_LABELS: Record<string,string> = { pending:'Pendiente', confirmed:'Confirmada', ready:'Lista para retirar', completed:'Completada', cancelled:'Cancelada' }
const SLOTS = ['10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00']

export default function ReservasPage() {
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any|null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterDate, setFilterDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState<{text:string,ok:boolean}|null>(null)
  const [saving, setSaving] = useState(false)

  const EMPTY = { customer_name:'', customer_email:'', customer_phone:'', reservation_date:'', reservation_time:'10:00', party_size:1, notes:'', internal_notes:'', status:'pending', type:'pickup' }
  const [form, setForm] = useState({...EMPTY})

  const load = async()=>{
    setLoading(true)
    const r = await fetch('/api/admin/reservas')
    const d = await r.json()
    setReservations(d.data||[])
    setLoading(false)
  }

  useEffect(()=>{ load() },[])

  const toast = (text:string,ok=true)=>{ setMsg({text,ok}); setTimeout(()=>setMsg(null),3000) }
  const setF = (k:string,v:any)=>setForm(f=>({...f,[k]:v}))

  const save = async()=>{
    if (!form.customer_name||!form.reservation_date) return toast('Nombre y fecha son obligatorios',false)
    setSaving(true)
    const r = await fetch('/api/admin/reservas',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,party_size:Number(form.party_size)})})
    if (r.ok){ toast('✦ Reserva creada'); setShowForm(false); load() }
    else { const d=await r.json(); toast(`Error: ${d.error}`,false) }
    setSaving(false)
  }

  const updateStatus = async(id:string,status:string)=>{
    await fetch(`/api/admin/reservas/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})})
    toast('✦ Estado actualizado'); load()
    if (selected?.id===id) setSelected((s:any)=>({...s,status}))
  }

  const updateNotes = async(id:string,internal_notes:string)=>{
    await fetch(`/api/admin/reservas/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({internal_notes})})
    toast('✦ Notas guardadas')
  }

  const del = async(id:string)=>{
    if (!confirm('¿Eliminar reserva?')) return
    await fetch(`/api/admin/reservas/${id}`,{method:'DELETE'})
    setSelected(null); toast('Eliminada'); load()
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = reservations.filter(r=>
    (filterStatus==='all'||r.status===filterStatus) &&
    (!filterDate||r.reservation_date===filterDate)
  )

  const todayRes = reservations.filter(r=>r.reservation_date===today)
  const pending = reservations.filter(r=>r.status==='pending').length
  const confirmed = reservations.filter(r=>r.status==='confirmed').length

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <p style={{fontSize:11,letterSpacing:4,color:'#C8860A',textTransform:'uppercase',marginBottom:6,fontFamily:'Georgia,serif'}}>📅 Comercio</p>
          <h1 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'2rem',color:'#FDF6E8'}}>Reservas & Retiro en Atelier</h1>
        </div>
        <button onClick={()=>{setForm({...EMPTY});setShowForm(true)}} style={{background:'linear-gradient(135deg,#C8860A,#E8B84B)',color:'#02000A',padding:'10px 20px',border:'none',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13,fontWeight:700}}>+ Nueva Reserva</button>
      </div>

      {msg && <div style={{background:msg.ok?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)',border:`1px solid ${msg.ok?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`,color:msg.ok?'#4A9B8E':'#D4726A',padding:'10px 14px',marginBottom:16,fontFamily:'Georgia,serif',fontSize:13}}>{msg.text}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
        {[
          {label:'Hoy',value:todayRes.length,color:'#E8B84B'},
          {label:'Pendientes',value:pending,color:pending>0?'#C8860A':'#A89070'},
          {label:'Confirmadas',value:confirmed,color:'#4A9B8E'},
          {label:'Total',value:reservations.length,color:'#8B7CF8'},
        ].map(k=>(
          <div key={k.label} style={{background:'rgba(10,6,20,0.85)',border:'1px solid rgba(200,134,10,0.18)',padding:'16px 18px'}}>
            <div style={{fontSize:9,letterSpacing:2,color:'#A89070',textTransform:'uppercase',marginBottom:8,fontFamily:'Georgia,serif'}}>{k.label}</div>
            <div style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1.8rem',color:k.color,fontWeight:700}}>{k.value}</div>
          </div>
        ))}
      </div>

      {showForm && (
        <div style={{background:'rgba(10,6,20,0.95)',border:'1px solid rgba(200,134,10,0.3)',padding:22,marginBottom:20}}>
          <h3 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1rem',color:'#E8B84B',marginBottom:18}}>Nueva Reserva Manual</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
            <div><label style={L}>Nombre *</label><input style={I} value={form.customer_name} onChange={e=>setF('customer_name',e.target.value)} /></div>
            <div><label style={L}>Email</label><input style={I} type="email" value={form.customer_email} onChange={e=>setF('customer_email',e.target.value)} /></div>
            <div><label style={L}>Teléfono</label><input style={I} value={form.customer_phone} onChange={e=>setF('customer_phone',e.target.value)} /></div>
            <div><label style={L}>Fecha *</label><input style={I} type="date" value={form.reservation_date} onChange={e=>setF('reservation_date',e.target.value)} /></div>
            <div><label style={L}>Horario</label>
              <select style={{...I,cursor:'pointer'}} value={form.reservation_time} onChange={e=>setF('reservation_time',e.target.value)}>
                {SLOTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label style={L}>Tipo</label>
              <select style={{...I,cursor:'pointer'}} value={form.type} onChange={e=>setF('type',e.target.value)}>
                <option value="pickup">Retiro en Atelier</option>
                <option value="tasting">Degustación</option>
                <option value="workshop">Taller</option>
                <option value="visit">Visita guiada</option>
              </select>
            </div>
            <div style={{gridColumn:'1/-1'}}><label style={L}>Notas del cliente</label><textarea style={{...I,height:60,resize:'vertical'}} value={form.notes} onChange={e=>setF('notes',e.target.value)} /></div>
          </div>
          <div style={{display:'flex',gap:10,marginTop:16}}>
            <button onClick={save} disabled={saving} style={{background:'linear-gradient(135deg,#C8860A,#E8B84B)',border:'none',color:'#02000A',padding:'10px 22px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13,fontWeight:700}}>{saving?'Guardando...':'Crear Reserva ✦'}</button>
            <button onClick={()=>setShowForm(false)} style={{background:'transparent',border:'1px solid rgba(200,134,10,0.28)',color:'#A89070',padding:'10px 16px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:13}}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <input type="date" value={filterDate} onChange={e=>setFilterDate(e.target.value)} style={{...I,width:160}} />
        <div style={{display:'flex',gap:4}}>
          {['all','pending','confirmed','ready','completed','cancelled'].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{background:filterStatus===s?'rgba(200,134,10,0.2)':'transparent',border:'1px solid rgba(200,134,10,0.25)',color:filterStatus===s?'#E8B84B':'#A89070',padding:'6px 12px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:11}}>
              {s==='all'?'Todas':STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {filterDate && <button onClick={()=>setFilterDate('')} style={{background:'none',border:'none',color:'#A89070',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12}}>✕ Limpiar fecha</button>}
      </div>

      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 1fr':'1fr',gap:20}}>
        <div style={{background:'rgba(10,6,20,0.85)',border:'1px solid rgba(200,134,10,0.18)'}}>
          {loading?<div style={{padding:'40px 0',textAlign:'center',color:'#A89070',fontFamily:'Georgia,serif'}}>Cargando...</div>:
          filtered.length===0?<div style={{padding:'40px 0',textAlign:'center',color:'#A89070',fontFamily:'Georgia,serif'}}>No hay reservas</div>:
          filtered.map((r:any)=>(
            <div key={r.id} onClick={()=>setSelected(r)} style={{padding:'14px 18px',borderBottom:'1px solid rgba(200,134,10,0.1)',cursor:'pointer',background:selected?.id===r.id?'rgba(200,134,10,0.08)':'transparent',transition:'background 0.15s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <div style={{fontFamily:'Georgia,serif',fontSize:13,color:'#F5E6C8',fontWeight:'bold'}}>{r.customer_name}</div>
                <span style={{background:`${STATUS_COLORS[r.status]||'#A89070'}22`,color:STATUS_COLORS[r.status]||'#A89070',padding:'2px 9px',fontSize:10,fontFamily:'monospace'}}>{STATUS_LABELS[r.status]||r.status}</span>
              </div>
              <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#C8860A'}}>📅 {r.reservation_date} {r.reservation_time}</span>
                {r.type && <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#A89070'}}>{r.type==='pickup'?'Retiro':r.type==='tasting'?'Degustación':r.type==='workshop'?'Taller':'Visita'}</span>}
                {r.customer_phone && <span style={{fontFamily:'Georgia,serif',fontSize:11,color:'#A89070'}}>{r.customer_phone}</span>}
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div style={{background:'rgba(10,6,20,0.85)',border:'1px solid rgba(200,134,10,0.18)',padding:22}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
              <h3 style={{fontFamily:'Cinzel,Georgia,serif',fontSize:'1rem',color:'#FDF6E8'}}>{selected.customer_name}</h3>
              <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#A89070',cursor:'pointer',fontSize:18}}>✕</button>
            </div>

            <div style={{background:'rgba(200,134,10,0.06)',border:'1px solid rgba(200,134,10,0.15)',padding:14,marginBottom:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                {[['Fecha',selected.reservation_date],['Horario',selected.reservation_time],['Email',selected.customer_email||'—'],['Teléfono',selected.customer_phone||'—'],['Tipo',selected.type||'—']].map(([k,v])=>(
                  <div key={k}><div style={{fontSize:9,letterSpacing:2,color:'#C8860A',fontFamily:'Georgia,serif',textTransform:'uppercase',marginBottom:3}}>{k}</div><div style={{fontFamily:'Georgia,serif',fontSize:13,color:'#F5E6C8'}}>{v}</div></div>
                ))}
              </div>
            </div>

            {selected.notes && <div style={{background:'rgba(139,124,248,0.08)',border:'1px solid rgba(139,124,248,0.2)',padding:12,marginBottom:14}}><div style={{fontSize:9,color:'#8B7CF8',fontFamily:'Georgia,serif',textTransform:'uppercase',marginBottom:4}}>Notas del cliente</div><p style={{fontFamily:'Georgia,serif',fontSize:13,color:'#F5E6C8'}}>{selected.notes}</p></div>}

            <div style={{marginBottom:16}}>
              <label style={L}>Cambiar estado</label>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {Object.entries(STATUS_LABELS).map(([k,v])=>(
                  <button key={k} onClick={()=>updateStatus(selected.id,k)} style={{background:selected.status===k?`${STATUS_COLORS[k]}22`:'transparent',border:`1px solid ${STATUS_COLORS[k]}66`,color:STATUS_COLORS[k],padding:'5px 12px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:11,opacity:selected.status===k?1:0.6}}>
                    {selected.status===k?'✓ ':''}{v}
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:16}}>
              <label style={L}>Notas internas</label>
              <textarea key={selected.id} defaultValue={selected.internal_notes||''} onBlur={e=>updateNotes(selected.id,e.target.value)} style={{...I,height:72,resize:'vertical'}} placeholder="Solo visible para el equipo..." />
            </div>

            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {selected.customer_email && <a href={`mailto:${selected.customer_email}?subject=Tu reserva en MAKANGRU ✦`} style={{background:'rgba(200,134,10,0.12)',border:'1px solid rgba(200,134,10,0.3)',color:'#C8860A',padding:'8px 14px',textDecoration:'none',fontFamily:'Georgia,serif',fontSize:12}}>✉ Email</a>}
              {selected.customer_phone && <a href={`https://wa.me/${selected.customer_phone.replace(/\D/g,'')}?text=${encodeURIComponent(`Hola ${selected.customer_name} ✦ confirmamos tu reserva en MAKANGRU para el ${selected.reservation_date} a las ${selected.reservation_time}`)}`} target="_blank" rel="noreferrer" style={{background:'rgba(74,155,142,0.12)',border:'1px solid rgba(74,155,142,0.3)',color:'#4A9B8E',padding:'8px 14px',textDecoration:'none',fontFamily:'Georgia,serif',fontSize:12}}>WhatsApp</a>}
              <button onClick={()=>del(selected.id)} style={{marginLeft:'auto',background:'none',border:'1px solid rgba(212,114,106,0.3)',color:'#D4726A',padding:'8px 14px',cursor:'pointer',fontFamily:'Georgia,serif',fontSize:12}}>Eliminar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
