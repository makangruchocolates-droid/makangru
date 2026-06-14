'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href:'/admin', label:'Dashboard', icon:'◈', exact:true },
  { href:'/admin/productos', label:'Productos', icon:'✦' },
  { href:'/admin/categorias', label:'Categorías', icon:'◇' },
  { href:'/admin/pedidos', label:'Pedidos', icon:'▣' },
  { href:'/admin/clientes', label:'Clientes', icon:'◉' },
  { href:'/admin/cupones', label:'Cupones', icon:'❋' },
  { href:'/admin/envios', label:'Zonas de Envío', icon:'◎' },
  { href:'/admin/entregas', label:'Días de Entrega', icon:'✧' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const p = usePathname()
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#02000A' }}>
      <aside style={{ width:240, background:'rgba(6,3,14,0.98)', borderRight:'1px solid rgba(200,134,10,0.15)', display:'flex', flexDirection:'column', position:'fixed', top:0, bottom:0, left:0, zIndex:50 }}>
        <div style={{ padding:'22px 20px 18px', borderBottom:'1px solid rgba(200,134,10,0.15)' }}>
          <div style={{ fontFamily:'Cinzel,Georgia,serif', fontSize:17, fontWeight:700, color:'#E8B84B', letterSpacing:3 }}>MAKANGRU</div>
          <div style={{ fontSize:8, color:'#A89070', letterSpacing:2, textTransform:'uppercase', marginTop:4 }}>Panel Administrativo</div>
        </div>
        <nav style={{ flex:1, padding:'10px 0', overflowY:'auto' }}>
          {NAV.map(item => {
            const active = item.exact ? p === item.href : p.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', textDecoration:'none', background:active?'rgba(200,134,10,0.12)':'transparent', borderLeft:active?'3px solid #C8860A':'3px solid transparent', color:active?'#E8B84B':'#A89070', fontSize:13, fontFamily:'Georgia,serif', letterSpacing:1, transition:'all 0.2s' }}>
                <span style={{ fontSize:15 }}>{item.icon}</span>{item.label}
              </Link>
            )
          })}
        </nav>
        <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(200,134,10,0.15)' }}>
          <Link href="/" style={{ display:'flex', alignItems:'center', gap:8, textDecoration:'none', color:'#A89070', fontSize:12, fontFamily:'Georgia,serif' }}>← Ver tienda</Link>
        </div>
      </aside>
      <main style={{ marginLeft:240, flex:1, padding:'32px 36px', minHeight:'100vh' }}>{children}</main>
    </div>
  )
}
