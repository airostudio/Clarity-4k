export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, toCamel } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('campaigns')
    .select('*, talents:campaign_talent(talent:talent(id, name, avatar))')
    .eq('id', params.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(toCamel(data))
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const row: any = {}
  if (body.title)       row.title      = body.title
  if (body.description) row.description = body.description
  if (body.type)        row.type       = body.type
  if (body.status)      row.status     = body.status
  if (body.startDate)   row.start_date = body.startDate
  if (body.endDate)     row.end_date   = body.endDate
  if (body.budget != null) row.budget  = body.budget
  if (body.spent  != null) row.spent   = body.spent
  if (body.goal)        row.goal       = body.goal
  if (body.platform)    row.platform   = body.platform
  if (body.metrics)     row.metrics    = body.metrics
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from('campaigns').update(row).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(toCamel(data))
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('campaigns').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
