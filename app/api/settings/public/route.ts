import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

// Endpoint público — solo expone los campos que el checkout necesita mostrar al cliente.
export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('site_settings')
    .select('whatsapp_number, whatsapp_message, transfer_bank_name, transfer_account_type, transfer_account_holder, transfer_account_rut, transfer_account_number, transfer_email, transfer_instructions')
    .eq('id', 1)
    .maybeSingle()
  if (error) return NextResponse.json({ data: null })
  return NextResponse.json({ data })
}
