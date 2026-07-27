import { requireAdminApi } from '@/lib/auth/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET() {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const { data, error } = await db.from('recipes').select('*, product:products(name), recipe_ingredients(*, ingredient:ingredients(name,unit,cost_per_unit))').order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}
export async function POST(req: NextRequest) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const db = createAdminClient()
  const body = await req.json()
  const { ingredients, ...recipe } = body
  const { data: rec, error } = await db.from('recipes').insert(recipe).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (ingredients?.length) {
    const rows = ingredients.map((i: any) => ({ ...i, recipe_id: rec.id }))
    await db.from('recipe_ingredients').insert(rows)
  }
  return NextResponse.json({ data: rec }, { status: 201 })
}
