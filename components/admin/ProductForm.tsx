'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }

function sl(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-') }

export default function ProductForm({ categories, product }: { categories: any[]; product?: any }) {
  const router = useRouter()
  const isEdit = !!product
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: product?.name||'', slug: product?.slug||'', tagline: product?.tagline||'',
    description: product?.description||'', story: product?.story||'', category_id: product?.category_id||'',
    price: product?.price||'', compare_price: product?.compare_price||'', cost_price: product?.cost_price||'',
    sku: product?.sku||'', stock: product?.stock??0, low_stock_alert: product?.low_stock_alert??5,
    images: (product?.images||[]) as string[], ingredients: product?.ingredients?.join(', ')||'',
    allergens: product?.allergens?.join(', ')||'', tags: product?.tags?.join(', ')||'',
    is_active: product?.is_active??true, is_featured: product?.is_featured??false, is_new: product?.is_new??false,
    meta_title: product?.meta_title||'', meta_description: product?.meta_description||'',
  })
  const [imgUrl, setImgUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<string|null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const [ok, setOk] = useState(false)
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))
  const addImg = () => { if (imgUrl.trim()) { set('images', [...form.images, imgUrl.trim()]); setImgUrl('') } }
  const rmImg = (i: number) => set('images', form.images.filter((_: any, x: number) => x !== i))
  const moveImg = (i: number, dir: -1|1) => {
    const imgs = [...form.images]
    const j = i + dir
    if (j < 0 || j >= imgs.length) return
    ;[imgs[i], imgs[j]] = [imgs[j], imgs[i]]
    set('images', imgs)
  }

  const uploadFiles = async (files: FileList) => {
    const allowed = ['image/jpeg','image/png','image/webp','image/gif','image/avif']
    const valid = Array.from(files).filter(f => allowed.includes(f.type))
    if (!valid.length) { setError('Solo se permiten imágenes JPG, PNG, WebP, GIF o AVIF'); return }
    setUploading(true)
    const urls: string[] = []
    for (let idx = 0; idx < valid.length; idx++) {
      const file = valid[idx]
      setUploadProgress(`Subiendo ${idx+1}/${valid.length}: ${file.name}`)
      const fd = new FormData()
      fd.append('file', file)
      fd.append('bucket', 'products')
      const r = await fetch('/api/admin/upload', { method:'POST', body:fd })
      const d = await r.json()
      if (d.url) urls.push(d.url)
      else setError(`Error subiendo ${file.name}: ${d.error}`)
    }
    set('images', [...form.images, ...urls])
    setUploading(false)
    setUploadProgress(null)
  }

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
    <div style={{ maxWidth:820 }}>
      {error && <div style={{ background:'rgba(212,114,106,0.1)', border:'1px solid rgba(212,114,106,0.4)', color:'#D4726A', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>⚠ {error}</div>}
      {ok && <div style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'11px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>✓ Guardado correctamente</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        {/* Info básica */}
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Nombre *</label><input value={form.name} onChange={e => { set('name', e.target.value); if (!isEdit) set('slug', sl(e.target.value)) }} style={I} placeholder="Nebula Volcánica" /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Slug (URL)</label><input value={form.slug} onChange={e => set('slug', e.target.value)} style={I} /><p style={{ fontSize:11, color:'#A89070', marginTop:4, fontFamily:'Georgia,serif' }}>makangru.cl/producto/{form.slug || 'nombre'}</p></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Tagline</label><input value={form.tagline} onChange={e => set('tagline', e.target.value)} style={I} placeholder="Cacao 72% · Frambuesa · Maracuyá" /></div>
        <div><label style={L}>Categoría</label><select value={form.category_id} onChange={e => set('category_id', e.target.value)} style={{ ...I, cursor:'pointer' }}><option value="">Sin categoría</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
        <div><label style={L}>SKU</label><input value={form.sku} onChange={e => set('sku', e.target.value)} style={I} placeholder="MKG-001" /></div>

        {/* Precios */}
        <div><label style={L}>Precio CLP *</label><input type="number" value={form.price} onChange={e => set('price', e.target.value)} style={I} placeholder="9800" /></div>
        <div><label style={L}>Precio anterior (tachado)</label><input type="number" value={form.compare_price} onChange={e => set('compare_price', e.target.value)} style={I} placeholder="12000" /></div>
        <div><label style={L}>Costo de producción (privado)</label><input type="number" value={form.cost_price} onChange={e => set('cost_price', e.target.value)} style={I} placeholder="4500" /></div>
        {form.cost_price && form.price && (
          <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', paddingBottom:10 }}>
            <div style={{ fontSize:10, letterSpacing:1, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:4 }}>Margen estimado</div>
            <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'1.1rem', color:'#4A9B8E' }}>
              {(((Number(form.price) - Number(form.cost_price)) / Number(form.price)) * 100).toFixed(1)}%
            </div>
          </div>
        )}

        {/* Stock */}
        <div><label style={L}>Stock</label><input type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={I} min="0" /></div>
        <div><label style={L}>Alerta stock bajo</label><input type="number" value={form.low_stock_alert} onChange={e => set('low_stock_alert', e.target.value)} style={I} min="0" /></div>

        {/* Descripciones */}
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Descripción *</label><textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4} style={{ ...I, resize:'vertical' }} placeholder="Descripción del producto..." /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Historia del Atelier</label><textarea value={form.story} onChange={e => set('story', e.target.value)} rows={3} style={{ ...I, resize:'vertical' }} placeholder="Historia o lore del producto..." /></div>
        <div style={{ gridColumn:'1/-1' }}><label style={L}>Ingredientes (separados por coma)</label><input value={form.ingredients} onChange={e => set('ingredients', e.target.value)} style={I} placeholder="Cacao 72%, Frambuesa, Maracuyá" /></div>
        <div><label style={L}>Alérgenos</label><input value={form.allergens} onChange={e => set('allergens', e.target.value)} style={I} placeholder="Leche, Frutos secos" /></div>
        <div><label style={L}>Tags</label><input value={form.tags} onChange={e => set('tags', e.target.value)} style={I} placeholder="intenso, artesanal" /></div>

        {/* IMÁGENES */}
        <div style={{ gridColumn:'1/-1', background:'rgba(10,6,20,0.6)', border:'1px solid rgba(200,134,10,0.2)', padding:20, marginTop:8 }}>
          <label style={{ ...L, fontSize:11, marginBottom:14 }}>Imágenes del Producto</label>

          {/* Upload desde dispositivo */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:10, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:10, letterSpacing:1, color:'#8B7CF8', fontFamily:'Georgia,serif', marginBottom:6 }}>★ Subir desde dispositivo (Supabase Storage)</div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                onChange={e => e.target.files && uploadFiles(e.target.files)}
                style={{ display:'none' }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                style={{ background:'rgba(139,124,248,0.12)', border:'1px solid rgba(139,124,248,0.4)', color:'#8B7CF8', padding:'9px 18px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, width:'100%', textAlign:'left' }}
              >
                {uploading ? uploadProgress || 'Subiendo...' : '📁 Seleccionar imágenes (múltiples)'}
              </button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
              <div style={{ fontSize:10, letterSpacing:1, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:6 }}>O pegar URL</div>
              <div style={{ display:'flex', gap:0 }}>
                <input value={imgUrl} onChange={e => setImgUrl(e.target.value)} onKeyDown={e => e.key==='Enter' && addImg()} style={{ ...I, width:260, borderRight:'none' }} placeholder="https://..." />
                <button onClick={addImg} style={{ background:'#C8860A', border:'none', color:'#02000A', padding:'0 16px', cursor:'pointer', fontWeight:700, fontSize:18 }}>+</button>
              </div>
            </div>
          </div>

          {/* Preview imágenes */}
          {form.images.length > 0 && (
            <>
              <div style={{ fontSize:10, color:'#A89070', fontFamily:'Georgia,serif', marginBottom:8, letterSpacing:1 }}>
                {form.images.length} imagen{form.images.length>1?'s':''} · La primera es la principal · Arrastra para reordenar
              </div>
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                {form.images.map((img: string, i: number) => (
                  <div key={i} style={{ position:'relative', width:90, height:90 }}>
                    {i === 0 && <div style={{ position:'absolute', top:-8, left:0, background:'#C8860A', color:'#02000A', fontSize:8, padding:'1px 5px', fontFamily:'monospace', zIndex:1 }}>PRINCIPAL</div>}
                    <div style={{ width:90, height:90, background:'#0A0614', border:`2px solid ${i===0?'#C8860A':'rgba(200,134,10,0.2)'}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>
                      {img.startsWith('http')
                        ? <img src={img} style={{ width:'100%', height:'100%', objectFit:'cover' }} alt="" />
                        : <span>{img}</span>
                      }
                    </div>
                    {/* Controles */}
                    <div style={{ position:'absolute', bottom:0, left:0, right:0, display:'flex', justifyContent:'space-between', background:'rgba(0,0,0,0.7)' }}>
                      <button onClick={() => moveImg(i,-1)} disabled={i===0} style={{ flex:1, background:'none', border:'none', color:'#C8860A', cursor:i===0?'default':'pointer', fontSize:12, opacity:i===0?0.3:1 }}>◀</button>
                      <button onClick={() => rmImg(i)} style={{ flex:1, background:'none', border:'none', color:'#D4726A', cursor:'pointer', fontSize:12 }}>✕</button>
                      <button onClick={() => moveImg(i,1)} disabled={i===form.images.length-1} style={{ flex:1, background:'none', border:'none', color:'#C8860A', cursor:i===form.images.length-1?'default':'pointer', fontSize:12, opacity:i===form.images.length-1?0.3:1 }}>▶</button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Estados */}
        <div style={{ gridColumn:'1/-1', display:'flex', gap:24, flexWrap:'wrap', paddingTop:16, borderTop:'1px solid rgba(200,134,10,0.18)', marginTop:8 }}>
          {[{k:'is_active',l:'✓ Activo (visible en tienda)'},{k:'is_featured',l:'⭐ Destacado en Home'},{k:'is_new',l:'★ Marcado como Nuevo'}].map(f => (
            <label key={f.k} style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, color:'#F5E6C8' }}>
              <input type="checkbox" checked={(form as any)[f.k]} onChange={e => set(f.k, e.target.checked)} style={{ width:16, height:16, accentColor:'#C8860A' }} />{f.l}
            </label>
          ))}
        </div>

        {/* SEO */}
        <div style={{ gridColumn:'1/-1', background:'rgba(10,6,20,0.5)', border:'1px solid rgba(200,134,10,0.12)', padding:'16px 18px', marginTop:8 }}>
          <div style={{ fontSize:10, letterSpacing:2, color:'#A89070', textTransform:'uppercase', marginBottom:12, fontFamily:'Georgia,serif' }}>SEO (opcional)</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={L}>Meta título</label><input value={form.meta_title} onChange={e => set('meta_title', e.target.value)} style={I} /></div>
            <div><label style={L}>Meta descripción</label><input value={form.meta_description} onChange={e => set('meta_description', e.target.value)} style={I} /></div>
          </div>
        </div>
      </div>

      <div style={{ display:'flex', gap:12, marginTop:28, paddingTop:22, borderTop:'1px solid rgba(200,134,10,0.18)' }}>
        <button onClick={save} disabled={loading} style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', border:'none', color:'#02000A', padding:'13px 32px', cursor:loading?'not-allowed':'pointer', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:2, fontWeight:700, opacity:loading?0.7:1 }}>
          {loading ? 'Guardando...' : isEdit ? 'Guardar Cambios ✦' : 'Crear Producto ✦'}
        </button>
        <a href="/admin/productos" style={{ border:'1px solid rgba(200,134,10,0.3)', color:'#A89070', padding:'13px 22px', fontFamily:'Georgia,serif', fontSize:13, textDecoration:'none', display:'flex', alignItems:'center' }}>Cancelar</a>
        {isEdit && <button onClick={del} style={{ marginLeft:'auto', background:'rgba(212,114,106,0.1)', border:'1px solid rgba(212,114,106,0.4)', color:'#D4726A', padding:'13px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13 }}>Eliminar producto</button>}
      </div>
    </div>
  )
}
