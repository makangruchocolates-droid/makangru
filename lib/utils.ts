export const fmt = (n:number) => new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',minimumFractionDigits:0}).format(n)
export const slug = (s:string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-')
export const wa = (msg?:string) => `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||'56951975639'}?text=${encodeURIComponent(msg||'Hola MAKANGRU ✦')}`
