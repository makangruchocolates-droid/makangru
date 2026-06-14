export interface Category {
  id: string; name: string; slug: string; description: string | null
  image_url: string | null; icon: string | null; is_active: boolean
  sort_order: number; created_at: string; updated_at: string
}
export interface Product {
  id: string; category_id: string | null; name: string; slug: string
  tagline: string | null; description: string; story: string | null
  price: number; compare_price: number | null; cost_price: number | null
  sku: string | null; stock: number; low_stock_alert: number
  weight_grams: number | null; images: string[]; ingredients: string[] | null
  allergens: string[] | null; is_active: boolean; is_featured: boolean
  is_new: boolean; tags: string[] | null; meta_title: string | null
  meta_description: string | null; points_reward: number
  is_subscription: boolean; created_at: string; updated_at: string
  category?: Category
}
export interface Customer {
  id: string; user_id: string | null; email: string
  first_name: string | null; last_name: string | null; phone: string | null
  address_line1: string | null; city: string | null; state: string | null
  region: string | null; country: string; total_orders: number
  total_spent: number; points: number; created_at: string; updated_at: string
}
export interface Order {
  id: string; order_number: string; customer_id: string | null
  status: string; payment_status: string; subtotal: number
  discount_amount: number; shipping_amount: number; total: number
  coupon_code: string | null; payment_reference: string | null
  mp_preference_id: string | null; tracking_number: string | null
  shipping_address: any; shipping_zone_name: string | null
  delivery_date: string | null; customer_email: string | null
  customer_phone: string | null; customer_name: string | null
  notes: string | null; admin_notes: string | null
  paid_at: string | null; created_at: string; updated_at: string
  order_items?: OrderItem[]
}
export interface OrderItem {
  id: string; order_id: string; product_id: string | null
  product_name: string; product_image: string | null
  unit_price: number; quantity: number; subtotal: number
}
export interface Coupon {
  id: string; code: string; description: string | null
  type: 'percentage' | 'fixed' | 'free_shipping'; value: number
  min_order_amount: number; max_discount: number | null
  usage_limit: number | null; usage_count: number; is_active: boolean
  expires_at: string | null; created_at: string
}
export interface ShippingZone {
  id: string; name: string; regions: string[]; price: number
  free_above: number | null; min_days: number; max_days: number
  is_active: boolean; sort_order: number
}
export interface BlogPost {
  id: string; title: string; slug: string; excerpt: string | null
  content: string; cover_image: string | null; author_name: string
  category: string | null; is_published: boolean
  published_at: string | null; read_time_minutes: number | null
  views: number; created_at: string
}
export interface CartItem {
  id: string; product_id: string; name: string; slug: string
  image: string; price: number; quantity: number; stock: number
}
export interface CartCoupon {
  code: string; type: string; value: number; discount: number
}
export interface CheckoutFormData {
  first_name: string; last_name: string; email: string; phone: string
  address_line1: string; city: string; state: string
  postal_code: string; notes: string
}
