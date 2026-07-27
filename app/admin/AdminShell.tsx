'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href:'/admin', label:'Dashboard', icon:'◈', exact:true },
  { section:'Catálogo' },
  { href:'/admin/productos', label:'Productos', icon:'✦' },
  { href:'/admin/destacados', label:'Destacados', icon:'⭐' },
  { href:'/admin/categorias', label:'Categorías', icon:'◇' },
  { href:'/admin/temporadas', label:'Temporadas', icon:'🌿' },
  { section:'Gastronomía' },
  { href:'/admin/ingredientes', label:'Ingredientes', icon:'🍫' },
  { href:'/admin/recetas', label:'Recetas & Costos', icon:'⚗' },
  { section:'Comercio' },
  { href:'/admin/pedidos', label:'Pedidos', icon:'▣' },
  { href:'/admin/reservas', label:'Reservas & Retiro', icon:'📅' },
  { href:'/admin/clientes', label:'Clientes', icon:'◉' },
  { href:'/admin/cupones', label:'Cupones', icon:'❋' },
  { href:'/admin/envios', label:'Zonas de Envío', icon:'◎' },
  { href:'/admin/entregas', label:'Días de Entrega', icon:'✧' },
  { section:'Contenido' },
  { href:'/admin/blog', label:'Blog', icon:'✒' },
  { href:'/admin/mensajes', label:'Mensajes', icon:'✉' },
  { section:'Sistema' },
  { href:'/admin/metricas', label:'Métricas', icon:'▲' },
  { href:'/admin/ajustes', label:'Ajustes', icon:'⚙' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    await createClient().auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#02000A' }}>
      <aside style={{ width:220, background:'rgba(6,3,14,0.98)', borderRight:'1px solid rgba(200,134,10,0.15)', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0, zIndex:50, overflowY:'auto' }}>
        <div style={{ padding:'20px 18px 16px', borderBottom:'1px solid rgba(200,134,10,0.15)' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:16, fontWeight:700, color:'#E8B84B', letterSpacing:3 }}>MAKANGRU</div>
          <div style={{ fontSize:8, color:'#A89070', letterSpacing:2, textTransform:'uppercase', marginTop:3 }}>Panel Administrativo</div>
        </div>
        <nav style={{ flex:1, padding:'8px 0' }}>
          {NAV.map((item, index) => {
            if ('section' in item) return <div key={`section-${index}`} style={{ fontSize:8, letterSpacing:3, color:'rgba(168,144,112,0.5)', textTransform:'uppercase', padding:'14px 18px 5px', fontFamily:'Georgia,serif' }}>{item.section}</div>
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href!)
            return <Link key={item.href} href={item.href!} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 18px', textDecoration:'none', background:active?'rgba(200,134,10,0.12)':'transparent', borderLeft:active?'2px solid #C8860A':'2px solid transparent', color:active?'#E8B84B':'#A89070', fontSize:12, fontFamily:'Georgia,serif', letterSpacing:0.5 }}><span>{item.icon}</span>{item.label}</Link>
          })}
        </nav>
        <div style={{ padding:'12px 18px', borderTop:'1px solid rgba(200,134,10,0.15)', display:'grid', gap:10 }}>
          <Link href="/" style={{ textDecoration:'none', color:'#A89070', fontSize:11, fontFamily:'Georgia,serif' }}>← Ver tienda</Link>
          <button type="button" onClick={signOut} style={{ textAlign:'left', border:0, padding:0, background:'transparent', color:'#D4726A', fontSize:11, cursor:'pointer' }}>Cerrar sesión</button>
        </div>
      </aside>
      <main style={{ marginLeft:220, flex:1, padding:'28px 32px', minHeight:'100vh' }}>{children}</main>
    </div>
  )
}
