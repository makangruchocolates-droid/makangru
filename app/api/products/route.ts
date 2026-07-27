import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PRODUCTS } from '@/lib/products'
import { fallbackProductForDatabase } from '@/lib/commerce/catalog'
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*, category:categories(*)').eq('is_active', true).order('created_at', { ascending: false })
  return NextResponse.json({ data: data?.length ? data : PRODUCTS.map(fallbackProductForDatabase) })
}
