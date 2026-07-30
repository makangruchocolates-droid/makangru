import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function configuredAdminEmails() {
  return (process.env.ADMIN_EMAILS || 'makangruchocolates@gmail.com')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false
  const allowed = configuredAdminEmails()
  return allowed.includes(email.toLowerCase())
}

export async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user || !isAllowedAdminEmail(user.email)) return null
  return user
}

export async function requireAdminPage() {
  const user = await getAdminUser()
  if (!user) redirect('/login?next=/admin')
  return user
}

export async function requireAdminApi() {
  const user = await getAdminUser()
  if (!user) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    )
  }
  return null
}
