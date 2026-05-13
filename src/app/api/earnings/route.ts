export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, toCamel } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const talentId = searchParams.get('talentId') ?? ''
  const year     = searchParams.get('year') ?? ''

  let query = supabase
    .from('earnings')
    .select('*, talent:talent(name, stage_name)')
    .order('year',  { ascending: false })
    .order('month', { ascending: false })

  if (talentId) query = query.eq('talent_id', talentId)
  if (year)     query = query.eq('year', parseInt(year))

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toCamel(data ?? []))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('earnings')
    .insert({
      talent_id:   body.talentId,
      platform:    body.platform,
      amount:      parseFloat(body.amount),
      currency:    body.currency ?? 'USD',
      month:       parseInt(body.month),
      year:        parseInt(body.year),
      description: body.description,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(toCamel(data), { status: 201 })
}
