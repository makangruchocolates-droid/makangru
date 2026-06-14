import { createAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
import { notFound } from 'next/navigation'
export default async function EditarProducto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const [{ data: product }, { data: cats }] = await Promise.all([
    db.from('products').select('*').eq('id', id).single(),
    db.from('categories').select('*').eq('is_active', true).order('sort_order'),
  ])
  if (!product) notFound()
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Catálogo</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:8 }}>Editar Producto</h1>
      <p style={{ color:'#A89070', fontFamily:'Georgia,serif', marginBottom:32 }}>{product.name}</p>
      <ProductForm categories={cats||[]} product={product} />
    </div>
  )
}
