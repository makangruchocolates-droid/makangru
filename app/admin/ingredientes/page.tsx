'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 12px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }

const ALLERGEN_LIST = ['Gluten','Lácteos','Huevo','Frutos secos','Maní','Soja','Sésamo','Mariscos','Pescado','Apio','Mostaza','Sulfitos','Lupino','Moluscos']
const UNIT_LIST = ['g','kg','ml','l','unidad','cucharada','cucharadita','taza','oz']

const EMPTY = { name:'', category:'', unit:'g', cost_per_unit:0, supplier:'', allergens:[] as string[], is_allergen:false, notes:'', calories_per_100g:0, protein_per_100g:0, carbs_per_100g:0, fat_per_100g:0, is_active:true }

export default function IngredientesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ ...EMPTY })
  const [editing, setEditing] = useState<string|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [msg, setMsg] = useState<{text:string,ok:boolean}|null>(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'basico'|'nutricional'>('basico')

  const load = async () => {
    setLoading(true)
    const r = await fetch('/api/admin/ingredientes')
    const d = await r.json()
    setItems(d.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toast = (text: string, ok = true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3000) }
  const set = (k: string, v: any) => setForm(f => ({...f, [k]:v}))

  const openNew = () => { setForm({...EMPTY}); setEditing(null); setShowForm(true); setTab('basico') }
  const openEdit = (item: any) => { setForm({...EMPTY, ...item, allergens: item.allergens||[]}); setEditing(item.id); setShowForm(true); setTab('basico') }

  const toggleAllergen = (a: string) => {
    setForm(f => ({ ...f, allergens: f.allergens.includes(a) ? f.allergens.filter(x=>x!==a) : [...f.allergens, a] }))
  }

  const save = async () => {
    if (!form.name) return toast('El nombre es obligatorio', false)
    setSaving(true)
    const url = editing ? `/api/admin/ingredientes/${editing}` : '/api/admin/ingredientes'
    const method = editing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, cost_per_unit: Number(form.cost_per_unit)||0 }) })
    if (r.ok) { toast(editing ? '✦ Ingrediente actualizado' : '✦ Ingrediente creado'); setShowForm(false); load() }
    else { const d = await r.json(); toast(`Error: ${d.error}`, false) }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar ingrediente?')) return
    await fetch(`/api/admin/ingredientes/${id}`, { method:'DELETE' })
    toast('Eliminado'); load()
  }

  const categories = [...new Set(items.map(i=>i.category).filter(Boolean))]
  const filtered = items.filter(i =>
    (!search || i.name.toLowerCase().includes(search.toLowerCase())) &&
    (!filterCat || i.category === filterCat)
  )

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }}>🍫 Gastronomía</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Ingredientes & Alérgenos</h1>
        </div>
        <button onClick={openNew} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'10px 20px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, fontWeight:700 }}>+ Nuevo Ingrediente</button>
      </div>

      {msg && <div style={{ background:msg.ok?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.ok?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.ok?'#4A9B8E':'#D4726A', padding:'10px 14px', marginBottom:16, fontFamily:'Georgia,serif', fontSize:13 }}>{msg.text}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
        {[
          { label:'Total ingredientes', value:items.length, color:'#E8B84B' },
          { label:'Con alérgenos', value:items.filter(i=>i.allergens?.length>0).length, color:'#D4726A' },
          { label:'Categorías', value:categories.length, color:'#4A9B8E' },
          { label:'Activos', value:items.filter(i=>i.is_active).length, color:'#8B7CF8' },
        ].map(k => (
          <div key={k.label} style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'16px 18px' }}>
            <div style={{ fontSize:9, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>{k.label}</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.6rem', color:k.color, fontWeight:700 }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar ingrediente..." style={{ ...I, width:220 }} />
        <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={{ ...I, width:160, cursor:'pointer' }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{ background:'rgba(10,6,20,0.95)', border:'1px solid rgba(200,134,10,0.3)', padding:24, marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#E8B84B' }}>{editing ? 'Editar Ingrediente' : 'Nuevo Ingrediente'}</h3>
            <div style={{ display:'flex', gap:4 }}>
              {(['basico','nutricional'] as const).map(t => (
                <button key={t} onClick={()=>setTab(t)} style={{ background:tab===t?'rgba(200,134,10,0.2)':'transparent', border:'1px solid rgba(200,134,10,0.3)', color:tab===t?'#E8B84B':'#A89070', padding:'5px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>
                  {t==='basico'?'Básico':'Nutricional'}
                </button>
              ))}
            </div>
          </div>

          {tab === 'basico' && (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14 }}>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Nombre *</label><input style={I} value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Cacao crudo 72%" /></div>
              <div><label style={L}>Categoría</label><input style={I} value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Cacao, Azúcar, Lácteos..." /></div>
              <div><label style={L}>Unidad</label><select style={{...I,cursor:'pointer'}} value={form.unit} onChange={e=>set('unit',e.target.value)}>{UNIT_LIST.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
              <div><label style={L}>Costo por unidad (CLP)</label><input style={I} type="number" value={form.cost_per_unit} onChange={e=>set('cost_per_unit',e.target.value)} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Proveedor</label><input style={I} value={form.supplier} onChange={e=>set('supplier',e.target.value)} placeholder="Nombre del proveedor" /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Notas</label><textarea style={{...I,height:60,resize:'vertical'}} value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={L}>Alérgenos que contiene</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginTop:4 }}>
                  {ALLERGEN_LIST.map(a => (
                    <button key={a} onClick={()=>toggleAllergen(a)} style={{ background:form.allergens.includes(a)?'rgba(212,114,106,0.25)':'rgba(10,6,20,0.5)', border:`1px solid ${form.allergens.includes(a)?'#D4726A':'rgba(200,134,10,0.2)'}`, color:form.allergens.includes(a)?'#D4726A':'#A89070', padding:'4px 11px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>
                <input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)} style={{ accentColor:'#C8860A' }} /> Activo
              </label>
            </div>
          )}

          {tab === 'nutricional' && (
            <div>
              <p style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070', marginBottom:16 }}>Valores nutricionales por cada 100g</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
                {[['calories_per_100g','Calorías (kcal)'],['protein_per_100g','Proteínas (g)'],['carbs_per_100g','Carbohidratos (g)'],['fat_per_100g','Grasas (g)']].map(([k,l])=>(
                  <div key={k}><label style={L}>{l}</label><input style={I} type="number" step="0.1" value={(form as any)[k]} onChange={e=>set(k,Number(e.target.value))} /></div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button onClick={save} disabled={saving} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'10px 24px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, fontWeight:700 }}>{saving?'Guardando...':'Guardar ✦'}</button>
            <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'10px 18px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ borderBottom:'1px solid rgba(200,134,10,0.18)' }}>
              {['Ingrediente','Categoría','Costo/unidad','Alérgenos','Estado',''].map(h=>(
                <th key={h} style={{ fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', padding:'11px 14px', textAlign:'left', fontFamily:'Georgia,serif' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ padding:'40px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Cargando...</td></tr>
            ) : filtered.map((item:any) => (
              <tr key={item.id} style={{ borderBottom:'1px solid rgba(200,134,10,0.07)', opacity:item.is_active?1:0.5 }}>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>{item.name}</div>
                  {item.supplier && <div style={{ fontSize:11, color:'#A89070', fontFamily:'Georgia,serif' }}>{item.supplier}</div>}
                </td>
                <td style={{ padding:'11px 14px', fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{item.category||'—'}</td>
                <td style={{ padding:'11px 14px', fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:'#E8B84B' }}>
                  {item.cost_per_unit>0 ? `$${Number(item.cost_per_unit).toLocaleString('es-CL')}/${item.unit}` : '—'}
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {item.allergens?.length > 0 ? item.allergens.map((a:string)=>(
                      <span key={a} style={{ background:'rgba(212,114,106,0.2)', color:'#D4726A', padding:'2px 7px', fontSize:10, fontFamily:'monospace' }}>{a}</span>
                    )) : <span style={{ color:'#A89070', fontSize:11, fontFamily:'Georgia,serif' }}>Ninguno</span>}
                  </div>
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <span style={{ background:item.is_active?'rgba(74,155,142,0.15)':'rgba(200,134,10,0.1)', color:item.is_active?'#4A9B8E':'#A89070', padding:'3px 9px', fontSize:10, fontFamily:'monospace' }}>{item.is_active?'Activo':'Inactivo'}</span>
                </td>
                <td style={{ padding:'11px 14px' }}>
                  <div style={{ display:'flex', gap:10 }}>
                    <button onClick={()=>openEdit(item)} style={{ background:'none', border:'none', color:'#C8860A', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Editar</button>
                    <button onClick={()=>del(item.id)} style={{ background:'none', border:'none', color:'#D4726A', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && !filtered.length && (
          <div style={{ padding:'50px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>
            {search ? 'Sin resultados.' : 'Aún no hay ingredientes.'} <button onClick={openNew} style={{ background:'none', border:'none', color:'#C8860A', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Crear el primero →</button>
          </div>
        )}
      </div>
    </div>
  )
}
