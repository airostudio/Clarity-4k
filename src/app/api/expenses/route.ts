export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, toCamel } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const talentId = searchParams.get('talentId') ?? ''

  let query = supabase
    .from('expenses')
    .select('*, talent:talent(name, stage_name)')
    .order('date', { ascending: false })

  if (talentId) query = query.eq('talent_id', talentId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(toCamel(data ?? []))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      talent_id:   body.talentId,
      category:    body.category,
      amount:      parseFloat(body.amount),
      currency:    body.currency ?? 'USD',
      date:        body.date,
      description: body.description,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(toCamel(data), { status: 201 })
}
