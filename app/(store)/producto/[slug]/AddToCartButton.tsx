'use client'
import { useState } from 'react'
import { useCart } from '@/stores/cartStore'

export default function AddToCartButton({ product }: { product: any }) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCart(s => s.addItem)

  const handle = () => {
    for (let i = 0; i < qty; i++) addItem({ id: product.id, product_id: product.id, name: product.name, slug: product.slug, image: product.sphere || '', price: product.price, stock: product.stock, sphere: product.sphere })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
      <div style={{ display:'flex', alignItems:'center', border:'1px solid rgba(200,134,10,0.4)' }}>
        <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--starlight)', padding:'12px 16px', fontSize:18 }}>−</button>
        <span style={{ fontFamily:'var(--font-display)', fontSize:'1.1rem', color:'var(--cream)', padding:'0 16px', minWidth:40, textAlign:'center' }}>{qty}</span>
        <button onClick={() => setQty(q => Math.min(product.stock, q+1))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--starlight)', padding:'12px 16px', fontSize:18 }}>+</button>
      </div>
      <button onClick={handle} style={{ flex:1, background: added ? 'var(--teal)' : 'linear-gradient(135deg,var(--amber),var(--gold))', border:'none', color:'var(--obsidian)', cursor:'pointer', padding:'14px 28px', fontFamily:'var(--font-body)', fontSize:14, letterSpacing:3, textTransform:'uppercase', fontWeight:600, transition:'all 0.3s' }}>
        {added ? '✓ Añadido' : 'Añadir al Carrito ✦'}
      </button>
    </div>
  )
}
