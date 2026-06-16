import BlogForm from '@/components/admin/BlogForm'

export default function NuevoBlogPost() {
  return (
    <div>
      <p style={{ fontSize:11, letterSpacing:4, color:'#C8860A', textTransform:'uppercase', marginBottom:8, fontFamily:'Georgia,serif' }}>✦ Contenido</p>
      <h1 style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:'2rem', color:'#FDF6E8', marginBottom:28 }}>Nuevo Post</h1>
      <BlogForm />
    </div>
  )
}
