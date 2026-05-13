export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, toCamel } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabase.from('agency_settings').select('*').eq('id', 'default').single()
  return NextResponse.json(toCamel(data))
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const row: any = {}
  if (body.agencyName   != null) row.agency_name   = body.agencyName
  if (body.currency     != null) row.currency      = body.currency
  if (body.defaultFee   != null) row.default_fee   = body.defaultFee
  if (body.contactEmail != null) row.contact_email = body.contactEmail
  if (body.contactPhone != null) row.contact_phone = body.contactPhone
  if (body.address      != null) row.address       = body.address
  if (body.taxId        != null) row.tax_id        = body.taxId

  const { data, error } = await supabase
    .from('agency_settings')
    .upsert({ id: 'default', ...row })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(toCamel(data))
}
