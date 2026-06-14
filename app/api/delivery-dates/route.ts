import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET() {
  const supabase = await createClient()
  const [{ data: settings }, { data: blocked }] = await Promise.all([
    supabase.from('delivery_settings').select('*').single(),
    supabase.from('blocked_delivery_dates').select('date').gte('date', new Date().toISOString().split('T')[0]),
  ])
  if (!settings) return NextResponse.json({ dates: [] })
  const blockedSet = new Set((blocked || []).map((b: any) => b.date))
  const now = new Date()
  const extra = now.getHours() >= (settings.cutoff_hour || 12) ? 1 : 0
  const minDate = new Date(now); minDate.setDate(now.getDate() + (settings.min_advance_days || 2) + extra); minDate.setHours(0,0,0,0)
  const maxDate = new Date(now); maxDate.setDate(now.getDate() + (settings.max_advance_days || 21) + extra)
  const enabled: number[] = settings.enabled_weekdays || [2,4,6]
  const available: string[] = []
  const cur = new Date(minDate)
  while (cur <= maxDate) {
    const ds = cur.toISOString().split('T')[0]
    if (enabled.includes(cur.getDay()) && !blockedSet.has(ds)) available.push(ds)
    cur.setDate(cur.getDate() + 1)
  }
  return NextResponse.json({ dates: available, message: settings.delivery_message })
}
