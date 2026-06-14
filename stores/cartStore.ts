'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Item { id:string; product_id:string; name:string; slug:string; image:string; price:number; quantity:number; stock:number; sphere:string }
interface Coupon { code:string; type:string; value:number; discount:number }
interface Store {
  items:Item[]; coupon:Coupon|null
  addItem:(i:Omit<Item,'quantity'>)=>void
  removeItem:(id:string)=>void
  updateQty:(id:string,q:number)=>void
  clearCart:()=>void
  applyCoupon:(c:Coupon)=>void
  removeCoupon:()=>void
  subtotal:()=>number
  discount:()=>number
  total:()=>number
  count:()=>number
}

export const useCart = create<Store>()(persist((set,get)=>({
  items:[], coupon:null,
  addItem:(item)=>set(s=>{
    const ex=s.items.find(i=>i.product_id===item.product_id)
    if(ex) return {items:s.items.map(i=>i.product_id===item.product_id?{...i,quantity:Math.min(i.quantity+1,i.stock)}:i)}
    return {items:[...s.items,{...item,quantity:1}]}
  }),
  removeItem:(id)=>set(s=>({items:s.items.filter(i=>i.product_id!==id)})),
  updateQty:(id,q)=>set(s=>({items:q<=0?s.items.filter(i=>i.product_id!==id):s.items.map(i=>i.product_id===id?{...i,quantity:Math.min(q,i.stock)}:i)})),
  clearCart:()=>set({items:[],coupon:null}),
  applyCoupon:(c)=>set({coupon:c}),
  removeCoupon:()=>set({coupon:null}),
  subtotal:()=>get().items.reduce((s,i)=>s+i.price*i.quantity,0),
  discount:()=>{
    const {coupon,subtotal}=get(); if(!coupon) return 0
    if(coupon.type==='percentage') return Math.round(subtotal()*coupon.value/100)
    if(coupon.type==='fixed') return Math.min(coupon.value,subtotal())
    return 0
  },
  total:()=>get().subtotal()-get().discount(),
  count:()=>get().items.reduce((s,i)=>s+i.quantity,0),
}),{name:'makangru-cart',skipHydration:true}))
