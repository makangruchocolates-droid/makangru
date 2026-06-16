import { createAdminClient } from '@/lib/supabase/server'
import BlogForm from '@/components/admin/BlogForm'
import { notFound } from 'next/navigation'

export default async function EditarBlogPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const db = createAdminClient()
  const { data: post } = await db.from('blog_posts').select('*').eq('id', id).single()
  if (!post) notFound()
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Contenido</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:28 }}>Editar Post</h1>
      <BlogForm post={post} />
    </div>
  )
}
