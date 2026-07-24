'use client'
import { useState, useEffect } from 'react'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'9px 12px', fontFamily:'Georgia,serif', fontSize:13, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }

const fmt = (n: number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(n)

export default function RecetasPage() {
  const [recipes, setRecipes] = useState<any[]>([])
  const [ingredients, setIngredients] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any|null>(null)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState<{text:string,ok:boolean}|null>(null)
  const [saving, setSaving] = useState(false)

  const EMPTY_RECIPE = { name:'', product_id:'', yield_units:1, yield_description:'', labor_minutes:0, overhead_percent:15, selling_price:0, notes:'' }
  const [form, setForm] = useState({...EMPTY_RECIPE})
  const [recipeIngredients, setRecipeIngredients] = useState<{ingredient_id:string,quantity:number,unit:string}[]>([])
  const [editing, setEditing] = useState<string|null>(null)

  const load = async () => {
    setLoading(true)
    const [r1, r2, r3] = await Promise.all([
      fetch('/api/admin/recetas').then(r=>r.json()),
      fetch('/api/admin/ingredientes').then(r=>r.json()),
      fetch('/api/admin/products').then(r=>r.json()),
    ])
    setRecipes(r1.data||[])
    setIngredients(r2.data||[])
    setProducts(r3.data||[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toast = (text: string, ok = true) => { setMsg({text,ok}); setTimeout(()=>setMsg(null),3000) }
  const setF = (k: string, v: any) => setForm(f=>({...f,[k]:v}))

  const calcCosts = () => {
    const ingredientCost = recipeIngredients.reduce((sum, ri) => {
      const ing = ingredients.find(i=>i.id===ri.ingredient_id)
      if (!ing || !ing.cost_per_unit) return sum
      return sum + (Number(ing.cost_per_unit) * Number(ri.quantity))
    }, 0)
    const laborCost = Number(form.labor_minutes) * 500 / 60
    const overhead = (ingredientCost + laborCost) * (Number(form.overhead_percent)/100)
    const totalCost = ingredientCost + laborCost + overhead
    const costPerUnit = form.yield_units > 0 ? totalCost / Number(form.yield_units) : totalCost
    const margin = form.selling_price > 0 ? ((Number(form.selling_price) - costPerUnit) / Number(form.selling_price) * 100) : 0
    return { ingredientCost, laborCost, overhead, totalCost, costPerUnit, margin }
  }

  const addIngredient = () => setRecipeIngredients(prev => [...prev, { ingredient_id:'', quantity:0, unit:'g' }])
  const updateIngredient = (idx: number, k: string, v: any) => setRecipeIngredients(prev => prev.map((ri,i)=>i===idx?{...ri,[k]:v}:ri))
  const removeIngredient = (idx: number) => setRecipeIngredients(prev => prev.filter((_,i)=>i!==idx))

  const openNew = () => { setForm({...EMPTY_RECIPE}); setRecipeIngredients([]); setEditing(null); setShowForm(true) }
  const openEdit = (r: any) => {
    setForm({ name:r.name, product_id:r.product_id||'', yield_units:r.yield_units||1, yield_description:r.yield_description||'', labor_minutes:r.labor_minutes||0, overhead_percent:r.overhead_percent||15, selling_price:r.selling_price||0, notes:r.notes||'' })
    setRecipeIngredients((r.recipe_ingredients||[]).map((ri:any)=>({ ingredient_id:ri.ingredient_id, quantity:ri.quantity, unit:ri.unit })))
    setEditing(r.id)
    setShowForm(true)
    setSelected(r)
  }

  const save = async () => {
    if (!form.name) return toast('El nombre es obligatorio', false)
    setSaving(true)
    const url = editing ? `/api/admin/recetas/${editing}` : '/api/admin/recetas'
    const method = editing ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...form, yield_units:Number(form.yield_units), labor_minutes:Number(form.labor_minutes), overhead_percent:Number(form.overhead_percent), selling_price:Number(form.selling_price), product_id:form.product_id||null, ingredients:recipeIngredients.filter(ri=>ri.ingredient_id).map(ri=>({...ri,quantity:Number(ri.quantity)})) }) })
    if (r.ok) { toast(editing?'✦ Receta actualizada':'✦ Receta creada'); setShowForm(false); load() }
    else { const d = await r.json(); toast(`Error: ${d.error}`, false) }
    setSaving(false)
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar receta?')) return
    await fetch(`/api/admin/recetas/${id}`, { method:'DELETE' })
    toast('Eliminada'); load(); setSelected(null)
  }

  const costs = calcCosts()

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:6, fontFamily:'Georgia,serif' }}>⚗ Gastronomía</p>
          <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8' }}>Recetas & Control de Costos</h1>
        </div>
        <button onClick={openNew} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'10px 20px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, fontWeight:700 }}>+ Nueva Receta</button>
      </div>

      {msg && <div style={{ background:msg.ok?'rgba(74,155,142,0.1)':'rgba(212,114,106,0.1)', border:`1px solid ${msg.ok?'rgba(74,155,142,0.4)':'rgba(212,114,106,0.4)'}`, color:msg.ok?'#4A9B8E':'#D4726A', padding:'10px 14px', marginBottom:16, fontFamily:'Georgia,serif', fontSize:13 }}>{msg.text}</div>}

      <div style={{ display:'grid', gridTemplateColumns: showForm ? '1fr 1.3fr' : '1fr', gap:20 }}>
        <div>
          {loading ? (
            <div style={{ padding:'60px 0', textAlign:'center', color:'#A89070', fontFamily:'Georgia,serif' }}>Cargando...</div>
          ) : recipes.length === 0 ? (
            <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:'60px 0', textAlign:'center' }}>
              <div style={{ fontSize:32, marginBottom:12 }}>⚗</div>
              <p style={{ fontFamily:'Georgia,serif', color:'#A89070', marginBottom:16 }}>Aún no hay recetas</p>
              <button onClick={openNew} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'10px 20px', border:'none', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, fontWeight:700 }}>Crear primera receta</button>
            </div>
          ) : recipes.map((r:any) => {
            const ingCost = (r.recipe_ingredients||[]).reduce((s:number,ri:any)=>s+(Number(ri.ingredient?.cost_per_unit||0)*Number(ri.quantity)),0)
            const labor = Number(r.labor_minutes||0)*500/60
            const oh = (ingCost+labor)*(Number(r.overhead_percent||15)/100)
            const total = ingCost+labor+oh
            const cpu = r.yield_units>0?total/r.yield_units:total
            const margin = r.selling_price>0?((r.selling_price-cpu)/r.selling_price*100):0
            return (
              <div key={r.id} style={{ background:'rgba(10,6,20,0.85)', border:`1px solid ${selected?.id===r.id?'rgba(200,134,10,0.5)':'rgba(200,134,10,0.18)'}`, padding:18, marginBottom:10, cursor:'pointer' }} onClick={()=>setSelected(r)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.95rem', color:'#F5E6C8', marginBottom:4 }}>{r.name}</div>
                    {r.product?.name && <div style={{ fontSize:11, color:'#C8860A', fontFamily:'Georgia,serif' }}>→ {r.product.name}</div>}
                    <div style={{ fontSize:11, color:'#A89070', fontFamily:'Georgia,serif', marginTop:4 }}>Rinde: {r.yield_units} {r.yield_description||'unidades'}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#E8B84B' }}>{fmt(cpu)}<span style={{ fontSize:10, color:'#A89070' }}>/u</span></div>
                    {r.selling_price>0 && <div style={{ fontSize:11, color:margin>50?'#4A9B8E':margin>30?'#E8B84B':'#D4726A', fontFamily:'Cinzel,Georgia,serif' }}>{margin.toFixed(0)}% margen</div>}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button onClick={e=>{e.stopPropagation();openEdit(r)}} style={{ background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.3)', color:'#C8860A', padding:'5px 14px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>Editar</button>
                  <button onClick={e=>{e.stopPropagation();del(r.id)}} style={{ background:'none', border:'1px solid rgba(212,114,106,0.3)', color:'#D4726A', padding:'5px 12px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>✕</button>
                </div>
              </div>
            )
          })}
        </div>

        {showForm && (
          <div style={{ background:'rgba(10,6,20,0.92)', border:'1px solid rgba(200,134,10,0.3)', padding:22 }}>
            <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1rem', color:'#E8B84B', marginBottom:18 }}>{editing?'Editar Receta':'Nueva Receta'}</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Nombre de la receta *</label><input style={I} value={form.name} onChange={e=>setF('name',e.target.value)} placeholder="Ganache de Maracuyá" /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Producto vinculado (opcional)</label>
                <select style={{...I,cursor:'pointer'}} value={form.product_id} onChange={e=>setF('product_id',e.target.value)}>
                  <option value="">Sin vincular</option>
                  {products.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div><label style={L}>Rendimiento (unidades)</label><input style={I} type="number" value={form.yield_units} onChange={e=>setF('yield_units',e.target.value)} /></div>
              <div><label style={L}>Descripción rendimiento</label><input style={I} value={form.yield_description} onChange={e=>setF('yield_description',e.target.value)} placeholder="bombones, porciones..." /></div>
              <div><label style={L}>Tiempo mano de obra (min)</label><input style={I} type="number" value={form.labor_minutes} onChange={e=>setF('labor_minutes',e.target.value)} /></div>
              <div><label style={L}>Gastos generales (%)</label><input style={I} type="number" value={form.overhead_percent} onChange={e=>setF('overhead_percent',e.target.value)} /></div>
              <div style={{ gridColumn:'1/-1' }}><label style={L}>Precio de venta (CLP)</label><input style={I} type="number" value={form.selling_price} onChange={e=>setF('selling_price',e.target.value)} /></div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <label style={L}>Ingredientes</label>
                <button onClick={addIngredient} style={{ background:'rgba(200,134,10,0.1)', border:'1px solid rgba(200,134,10,0.3)', color:'#C8860A', padding:'4px 12px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>+ Agregar</button>
              </div>
              {recipeIngredients.map((ri,idx)=>(
                <div key={idx} style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto', gap:6, marginBottom:6, alignItems:'center' }}>
                  <select style={{...I,cursor:'pointer'}} value={ri.ingredient_id} onChange={e=>updateIngredient(idx,'ingredient_id',e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {ingredients.map((ing:any)=><option key={ing.id} value={ing.id}>{ing.name}</option>)}
                  </select>
                  <input style={{...I,width:70}} type="number" step="0.1" value={ri.quantity} onChange={e=>updateIngredient(idx,'quantity',e.target.value)} placeholder="Cant." />
                  <input style={{...I,width:55}} value={ri.unit} onChange={e=>updateIngredient(idx,'unit',e.target.value)} placeholder="g" />
                  <button onClick={()=>removeIngredient(idx)} style={{ background:'none', border:'none', color:'#D4726A', cursor:'pointer', fontSize:16 }}>✕</button>
                </div>
              ))}
            </div>

            <div style={{ background:'rgba(200,134,10,0.06)', border:'1px solid rgba(200,134,10,0.2)', padding:16, marginBottom:16 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:12, fontFamily:'Georgia,serif' }}>Calculadora de costos</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  ['Ingredientes', fmt(costs.ingredientCost),'#F5E6C8'],
                  ['Mano de obra', fmt(costs.laborCost),'#F5E6C8'],
                  ['Gastos generales', fmt(costs.overhead),'#F5E6C8'],
                  ['Costo total', fmt(costs.totalCost),'#E8B84B'],
                  ['Costo por unidad', fmt(costs.costPerUnit),'#E8B84B'],
                  ['Margen', `${costs.margin.toFixed(1)}%`, costs.margin>50?'#4A9B8E':costs.margin>30?'#E8B84B':'#D4726A'],
                ].map(([label,value,color])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(200,134,10,0.08)' }}>
                    <span style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#A89070' }}>{label}</span>
                    <span style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:13, color:color as string, fontWeight:700 }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:14 }}><label style={L}>Notas</label><textarea style={{...I,height:56,resize:'vertical'}} value={form.notes} onChange={e=>setF('notes',e.target.value)} /></div>

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={save} disabled={saving} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'10px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, fontWeight:700 }}>{saving?'Guardando...':'Guardar ✦'}</button>
              <button onClick={()=>setShowForm(false)} style={{ background:'transparent', border:'1px solid rgba(200,134,10,0.28)', color:'#A89070', padding:'10px 16px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
