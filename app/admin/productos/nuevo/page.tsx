import { createAdminClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'
export default async function NuevoProducto() {
  const db = createAdminClient()
  const { data: cats } = await db.from('categories').select('*').eq('is_active', true).order('sort_order')
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Catálogo</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:32 }}>Nuevo Producto</h1>
      <ProductForm categories={cats||[]} />
    </div>
  )
}
