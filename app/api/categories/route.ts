import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CATEGORIES } from '@/lib/products'
export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  return NextResponse.json({ data: data?.length ? data : CATEGORIES.map((category, index) => ({ ...category, is_active:true, sort_order:index })) })
}
