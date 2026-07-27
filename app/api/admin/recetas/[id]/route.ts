import { requireAdminApi } from '@/lib/auth/admin'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const { id } = await params
  const db = createAdminClient()
  const { data, error } = await db.from('recipes').select('*, product:products(name), recipe_ingredients(*, ingredient:ingredients(name,unit,cost_per_unit))').eq('id', id).single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ data })
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const { id } = await params
  const db = createAdminClient()
  const body = await req.json()
  const { ingredients, ...recipe } = body
  const { data, error } = await db.from('recipes').update({ ...recipe, updated_at: new Date().toISOString() }).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  if (ingredients !== undefined) {
    await db.from('recipe_ingredients').delete().eq('recipe_id', id)
    if (ingredients.length) await db.from('recipe_ingredients').insert(ingredients.map((i: any) => ({ ...i, recipe_id: id })))
  }
  return NextResponse.json({ data })
}
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = await requireAdminApi()
  if (unauthorized) return unauthorized
  const { id } = await params
  const db = createAdminClient()
  await db.from('recipe_ingredients').delete().eq('recipe_id', id)
  const { error } = await db.from('recipes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
