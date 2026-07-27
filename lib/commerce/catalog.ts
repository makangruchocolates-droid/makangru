import { PRODUCTS } from '@/lib/products'

export const FALLBACK_SHIPPING_ZONES = [
  { id:'retiro-atelier', name:'Retiro en Atelier', regions:['Retiro'], price:0, free_above:0, min_days:0, max_days:0, is_active:true, sort_order:0 },
  { id:'santiago-centro', name:'Santiago Centro', regions:['Santiago','Estación Central','Quinta Normal','Cerro Navia','Lo Prado','Pudahuel'], price:2500, free_above:80000, min_days:1, max_days:1, is_active:true, sort_order:1 },
  { id:'santiago-oriente', name:'Santiago Oriente', regions:['Providencia','Ñuñoa','La Reina','Las Condes','Vitacura','Lo Barnechea'], price:3000, free_above:80000, min_days:1, max_days:2, is_active:true, sort_order:2 },
  { id:'santiago-sur', name:'Santiago Sur', regions:['San Miguel','La Cisterna','El Bosque','San Bernardo','Pedro Aguirre Cerda'], price:3000, free_above:80000, min_days:1, max_days:2, is_active:true, sort_order:3 },
  { id:'santiago-poniente', name:'Santiago Poniente', regions:['Maipú','Cerrillos','Padre Hurtado','Peñaflor','Talagante'], price:3500, free_above:90000, min_days:1, max_days:2, is_active:true, sort_order:4 },
  { id:'santiago-norte', name:'Santiago Norte', regions:['Huechuraba','Recoleta','Independencia','Conchalí','Quilicura','Renca'], price:3000, free_above:80000, min_days:1, max_days:2, is_active:true, sort_order:5 },
  { id:'gran-santiago', name:'Gran Santiago', regions:['Puente Alto','La Florida','Peñalolén','Macul','San Joaquín','La Granja'], price:3500, free_above:90000, min_days:1, max_days:2, is_active:true, sort_order:6 },
  { id:'valparaiso-vina', name:'Valparaíso / Viña', regions:['Valparaíso','Viña del Mar','Quilpué','Villa Alemana','Con Con'], price:5900, free_above:120000, min_days:2, max_days:3, is_active:true, sort_order:7 },
  { id:'regiones-norte', name:'Regiones Norte', regions:['Antofagasta','Calama','Iquique','Arica','Copiapó','La Serena','Coquimbo'], price:7900, free_above:150000, min_days:3, max_days:5, is_active:true, sort_order:8 },
  { id:'regiones-sur', name:'Regiones Sur', regions:['Concepción','Talca','Rancagua','Los Ángeles','Temuco','Valdivia','Puerto Montt'], price:7900, free_above:150000, min_days:3, max_days:5, is_active:true, sort_order:9 },
] as const

export function fallbackProductBySlug(slug: string) {
  return PRODUCTS.find(product => product.slug === slug) || null
}

export function fallbackProductByCartIdentity(identity: { id?: unknown; product_id?: unknown; slug?: unknown }) {
  const values = [identity.slug, identity.product_id, identity.id].map(String)
  return PRODUCTS.find(product => values.includes(product.slug) || values.includes(product.id)) || null
}

export function fallbackProductForDatabase(product: NonNullable<ReturnType<typeof fallbackProductBySlug>>) {
  return {
    ...product,
    category: { name: product.catName, slug: product.cat },
    category_id: null,
    compare_price: product.oldPrice,
    description: product.desc,
    images: [],
    is_active: true,
    is_featured: product.isNew || product.isSale,
    is_new: product.isNew,
  }
}

export function calculateFallbackDates() {
  const dates: string[] = []
  const current = new Date()
  current.setDate(current.getDate() + 2)
  current.setHours(12, 0, 0, 0)
  const end = new Date(current)
  end.setDate(end.getDate() + 21)
  while (current <= end) {
    if ([2, 4, 6].includes(current.getDay())) dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}
