'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const I: React.CSSProperties = { width:'100%', background:'#0A0614', border:'1px solid rgba(200,134,10,0.28)', color:'#F5E6C8', padding:'10px 13px', fontFamily:'Georgia,serif', fontSize:14, outline:'none', boxSizing:'border-box' }
const L: React.CSSProperties = { display:'block', fontSize:10, letterSpacing:2, color:'#C8860A', textTransform:'uppercase', marginBottom:7, fontFamily:'Georgia,serif' }
const G: React.CSSProperties = { marginBottom:20 }

const slug = (s:string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-')

export default function BlogForm({ post }: { post?: any }) {
  const router = useRouter()
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    cover_image: post?.cover_image || '',
    author_name: post?.author_name || 'MAKANGRU',
    category: post?.category || '',
    tags: post?.tags?.join(', ') || '',
    is_published: post?.is_published || false,
    read_time_minutes: post?.read_time_minutes || '',
    meta_title: post?.meta_title || '',
    meta_description: post?.meta_description || '',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<string|null>(null)
  const [imgFile, setImgFile] = useState<File|null>(null)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toast = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3000) }

  const uploadImage = async (): Promise<string|null> => {
    if (!imgFile) return null
    const fd = new FormData()
    fd.append('file', imgFile)
    fd.append('bucket', 'blog')
    const r = await fetch('/api/admin/upload', { method:'POST', body:fd })
    const d = await r.json()
    return d.url || null
  }

  const save = async (publish?: boolean) => {
    if (!form.title || !form.content) return toast('✦ Título y contenido son requeridos')
    setSaving(true)
    let cover_image = form.cover_image
    if (imgFile) {
      const url = await uploadImage()
      if (url) cover_image = url
    }
    const body = {
      ...form,
      slug: form.slug || slug(form.title),
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      cover_image,
      read_time_minutes: form.read_time_minutes ? Number(form.read_time_minutes) : null,
      is_published: publish !== undefined ? publish : form.is_published,
      published_at: (publish || form.is_published) ? new Date().toISOString() : null,
    }
    const url = post ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
    const method = post ? 'PUT' : 'POST'
    const r = await fetch(url, { method, headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) })
    if (r.ok) {
      toast(publish ? '✦ Post publicado' : '✦ Guardado como borrador')
      setTimeout(() => router.push('/admin/blog'), 1200)
    } else {
      const d = await r.json()
      toast(`Error: ${d.error}`)
    }
    setSaving(false)
  }

  const deletePost = async () => {
    if (!post || !confirm('¿Eliminar este post?')) return
    await fetch(`/api/admin/blog/${post.id}`, { method:'DELETE' })
    router.push('/admin/blog')
  }

  return (
    <div style={{ maxWidth:860 }}>
      {msg && <div style={{ background:'rgba(74,155,142,0.1)', border:'1px solid rgba(74,155,142,0.4)', color:'#4A9B8E', padding:'10px 14px', marginBottom:18, fontFamily:'Georgia,serif', fontSize:13 }}>{msg}</div>}

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:20 }}>
        <div style={{ ...G, marginBottom:0 }}>
          <label style={L}>Título *</label>
          <input style={I} value={form.title} onChange={e => { set('title',e.target.value); if(!post) set('slug', slug(e.target.value)) }} />
        </div>
        <div style={{ ...G, marginBottom:0 }}>
          <label style={L}>Slug (URL)</label>
          <input style={I} value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generado desde título" />
        </div>
      </div>

      <div style={G}>
        <label style={L}>Extracto / Resumen</label>
        <textarea style={{ ...I, height:72, resize:'vertical' }} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} />
      </div>

      <div style={G}>
        <label style={L}>Contenido *</label>
        <textarea style={{ ...I, height:320, resize:'vertical', lineHeight:1.7 }} value={form.content} onChange={e => set('content', e.target.value)} placeholder="Puedes usar Markdown..." />
      </div>

      {/* Imagen portada */}
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:18, marginBottom:20 }}>
        <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.9rem', color:'#E8B84B', marginBottom:14 }}>Imagen de Portada</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div>
            <label style={L}>Subir desde dispositivo</label>
            <input type="file" accept="image/*" onChange={e => setImgFile(e.target.files?.[0]||null)}
              style={{ ...I, padding:'7px 10px', fontSize:12 }} />
            {imgFile && <p style={{ fontFamily:'Georgia,serif', fontSize:11, color:'#4A9B8E', marginTop:5 }}>✦ {imgFile.name}</p>}
          </div>
          <div>
            <label style={L}>O pegar URL de imagen</label>
            <input style={I} value={form.cover_image} onChange={e => set('cover_image', e.target.value)} placeholder="https://..." />
          </div>
        </div>
        {(form.cover_image || imgFile) && !imgFile && (
          <img src={form.cover_image} style={{ marginTop:12, maxHeight:120, border:'1px solid rgba(200,134,10,0.2)' }} alt="preview" />
        )}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <div>
          <label style={L}>Autor</label>
          <input style={I} value={form.author_name} onChange={e => set('author_name', e.target.value)} />
        </div>
        <div>
          <label style={L}>Categoría</label>
          <input style={I} value={form.category} onChange={e => set('category', e.target.value)} placeholder="Chocolatería, Recetas..." />
        </div>
        <div>
          <label style={L}>Tiempo de lectura (min)</label>
          <input style={I} type="number" value={form.read_time_minutes} onChange={e => set('read_time_minutes', e.target.value)} />
        </div>
      </div>

      <div style={G}>
        <label style={L}>Tags (separados por coma)</label>
        <input style={I} value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="chocolate, cacao, receta" />
      </div>

      {/* SEO */}
      <div style={{ background:'rgba(10,6,20,0.85)', border:'1px solid rgba(200,134,10,0.18)', padding:18, marginBottom:24 }}>
        <h3 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'0.9rem', color:'#8B7CF8', marginBottom:14 }}>SEO</h3>
        <div style={G}>
          <label style={L}>Meta título</label>
          <input style={I} value={form.meta_title} onChange={e => set('meta_title', e.target.value)} />
        </div>
        <div style={{ marginBottom:0 }}>
          <label style={L}>Meta descripción</label>
          <textarea style={{ ...I, height:60, resize:'vertical' }} value={form.meta_description} onChange={e => set('meta_description', e.target.value)} />
        </div>
      </div>

      {/* Acciones */}
      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
        <button onClick={() => save(false)} disabled={saving}
          style={{ background:'rgba(200,134,10,0.12)', border:'1px solid rgba(200,134,10,0.4)', color:'#C8860A', padding:'11px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:1 }}>
          {saving ? 'Guardando...' : '◎ Guardar borrador'}
        </button>
        <button onClick={() => save(true)} disabled={saving}
          style={{ background:'linear-gradient(135deg,#C8860A,#E8B84B)', color:'#02000A', padding:'11px 22px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:13, letterSpacing:1, fontWeight:700, border:'none' }}>
          {saving ? '...' : '✦ Publicar'}
        </button>
        {post && (
          <button onClick={deletePost}
            style={{ marginLeft:'auto', background:'none', border:'1px solid rgba(212,114,106,0.4)', color:'#D4726A', padding:'11px 18px', cursor:'pointer', fontFamily:'Georgia,serif', fontSize:12 }}>
            Eliminar post
          </button>
        )}
      </div>
    </div>
  )
}
