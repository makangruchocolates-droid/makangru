'use client'
import { useState } from 'react'
import { useCart } from '@/stores/cartStore'

export default function AddToCartBtn({ product }: { product: any }) {
  const [added, setAdded] = useState(false)
  const addItem = useCart(s => s.addItem)

  const handle = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ id: product.id, product_id: product.id, name: product.name, slug: product.slug, image: product.sphere || '', price: product.price, stock: product.stock, sphere: product.sphere })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button onClick={handle} style={{ border:'1px solid var(--amber)', color: added ? 'var(--obsidian)' : 'var(--amber)', background: added ? 'var(--amber)' : 'transparent', padding:'7px 15px', fontFamily:'var(--font-body)', fontSize:10, letterSpacing:2, textTransform:'uppercase', cursor:'pointer', transition:'all .25s' }}>
      {added ? '✓ Añadido' : 'Añadir ✦'}
    </button>
  )
}
