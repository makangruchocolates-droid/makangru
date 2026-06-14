'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }

function sl(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') }

export default function ProductForm({ categories, product }: { categories: any[]; product?: any }) {
  const router = useRouter()
  const isEdit = !!product
  const [form, setForm] = useState({
    name: product?.name||'', slug: product?.slug||'', tagline: product?.tagline||'',
    description: product?.description||'', story: product?.story||'', category_id: product?.category_id||'',
    price: product?.price||'', compare_price: product?.compare_price||'', cost_price: product?.cost_price||'',
    sku: product?.sku||'', stock: product?.stock??0, low_stock_alert: product?.low_stock_alert??5,
    images: product?.images||[], ingredients: product?.ingredients?.join(', ')||'',
    allergens: product?.allergens?.join(', ')||'', tags: product?.tags?.join(', ')||'',
    is_active: product?.is_active??true, is_featured: product?.is_featured??false, is_new: product?.is_new??false,
    meta_title: product?.meta_title||'', meta_description: product?.meta_description||'',
  })
  const [imgUrl, setImgUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [ok, setOk] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const addImg = () => { if (imgUrl.trim()) { set('images', [...form.images, imgUrl.trim()]); setImgUrl('') } }
  const rmImg = (i: number) => set('images', form.images.filter((_: any, x: number) => x !== i))

  const save = async () => {
    if (!form.name || !form.description || !form.price) { setError('Nombre, descripción y precio son obligatorios'); return }
    setLoading(true); setError(null)
    const payload = { ...form, slug: form.slug || sl(form.name), price: Number(form.price),
      compare_price: form.compare_price ? Number(form.compare_price) : null,
      cost_price: form.cost_price ? Number(form.cost_price) : null,
      stock: Number(form.stock), low_stock_alert: Number(form.low_stock_alert),
      category_id: form.category_id || null,
      ingredients: form.ingredients ? form.ingredients.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
      allergens: form.allergens ? form.allergens.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
      tags: form.tags ? form.tags.split(',').map((s: string) => s.trim()).filter(Boolean) : null,
    }
    try {
      const url = isEdit ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const r = await fetch(url, { method: isEdit ? 'PUT' : 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setOk(true); setTimeout(() => router.push('/admin/productos'), 800)
    } catch(e: any) { setError(e.message) }
    setLoading(false)
  }

  const del = async () => {
    if (!confirm('¿Eliminar este producto?')) return
    await fetch(`/api/admin/products/${product.id}`, { method:'DELETE' })
    router.push('/admin/productos')
  }

  return (
    <div style={{ maxWidth:800 }}>
      {error && <div style={{ background:'rgba(212,114,106,0.1)', border:'1px solid rgba(212,114,106,0.4)', color:'#D4726A', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>⚠ {error}</div>}
      {ok && <div style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>✓ Guardado</div>}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Nombre *</label><input value={form.name} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', sl(e.target.value)) }} style={I} placeholder="Nebula Volcánica" /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Slug (URL)</label><input value={form.slug} onChange={e => set('slug', e.target.value)} style={I} /><p style={{ fontSize:11, color:'#A89070', marginTop:4, fontFamily:'Georgia,serif' }}>makangru.cl/producto/{form.slug || 'nombre'}</p></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Tagline</label><input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={I} placeholder="Cacao 72% · Frambuesa · Maracuyá" /></div>
        <div><label style={L}>Categoría</label><select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...I, cursor:'pointer' }}><option value="">Sin categoría</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label style={L}>SKU</label><input value={form.sku} onChange={e => set('sku', e.target.value)} style={I} placeholder="MKG-001" /></div>
        <div><label style={L}>Precio CLP *</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={I} placeholder="9800" /></div>
        <div><label style={L}>Precio anterior (tachado)</label><input type="number" value={form.compare_price} onChange={e => set('compare_price', e.target.value)} style={I} placeholder="12000" /></div>
        <div><label style={L}>Stock</label><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={I} min="0" /></div>
        <div><label style={L}>Alerta stock bajo</label><input type="number" value={form.low_stock_alert} onChange={e => set('low_stock_alert', e.target.value)} style={I} min="0" /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Descripción *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...I, resize:'vertical' }} placeholder="Descripción del producto..." /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Historia del Atelier</label><textarea value={form.story} onChange={e => set('story', e.target.value)} rows={3} style={{ ...I, resize:'vertical' }} placeholder="Historia o lore del producto..." /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Ingredientes (separados por coma)</label><input value={form.ingredients} onChange={e => set('ingredients', e.target.value)} style={I} placeholder="Cacao 72%, Frambuesa, Maracuyá" /></div>
        <div><label style={L}>Alérgenos</label><input value={form.allergens} onChange={e => set('allergens', e.target.value)} style={I} placeholder="Leche, Frutos secos" /></div>
        <div><label style={L}>Tags</label><input value={form.tags} onChange={e => set('tags', e.target.value)} style={I} placeholder="intenso, artesanal" /></div>
        <div style={{ gridColumn:'1/-1' }}>
          <label style={L}>Imágenes (URLs de Supabase Storage)</label>
          <div style={{ display:'flex', gap:0, marginBottom:10 }}>
            <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && addImg()} style={{ ...I, flex:1, borderRight:'none' }} placeholder="https://... o emoji: 🌑" />
            <button onClick={addImg} style={{ background:'#C8860A', border:'none', color:'#02000A', padding:'0 18px', cursor:'pointer', fontFamily:'Georgia,serif', fontWeight:700, fontSize:18 }}>+</button>
          </div>
          <p style={{ fontSize:11, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:8 }}>Sube imágenes en Supabase → Storage → products → copia la URL pública</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {form.images.map((img: string, i: number) => (
              <div key={i} style={{ position:'relative', width:72, height:72, background:'#0A0614', border:'1px solid rgba(200,134,10,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
                {img.startsWith('http') ? <img src={img} style={{ width:72, height:72, objectFit:'cover' }} alt="" /> : img}
                <button onClick={() => rmImg(i)} style={{ position:'absolute', top:-8, right:-8, width:18, height:18, borderRadius:'50%', background:'#D4726A', border:'none', color:'white', cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
              </div>
            ))}
          </div>
        </div>
        <div style={{ gridColumn:'1/-1', display:'flex', gap:24, flexWrap:'wrap', paddingTop:16, borderTop:'1px solid rgba(200,134,10,0.18)', marginTop:8 }}>
          {[{k:'is_active',l:'✓ Activo (visible)'},{k:'is_featured',l:'✦ Destacado en Home'},{k:'is_new',l:'★ Nuevo'}].map(f => (
            <label key={f.k} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>
              <input type="checkbox" checked={(form as any)[f.k]} onChange={e => set(f.k, e.target.checked)} style={{ width:16, height:16, accentColor:'#C8860A' }} />{f.l}
            </label>
          ))}
        </div>
      </div>
      <div style={{ display:'flex', gap:12, marginTop:28, paddingTop:22, borderTop:'1px solid rgba(200,134,10,0.18)' }}>
        <button onClick={save} disabled={loading} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'13px 32px', cursor:loading?'not-allowed':'pointer', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:2, fontWeight:700 }}>
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios ✦' : 'Crear Producto ✦'}
        </button>
        <a href="/admin/productos" style={{ border:'1px solid rgba(200,134,10,0.3)', color:'#A89070', padding:'13px 22px', fontFamily:'Georgia,serif', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center' }}>Cancelar</a>
        {isEdit && <button onClick={del} style={{ marginLeft:'auto', background:'rgba(212,114,106,0.1)', border:'1px solid rgba(212,114,106,0.4)', color:'#D4726A', padding:'13px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Eliminar</button>}
      </div>
    </div>
  )
}
