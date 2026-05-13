export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { supabase, toCamel } from '@/lib/supabase'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const [
    { data: talent, error },
    { data: earnings },
    { data: expenses },
    { data: notes },
    { data: campaigns },
  ] = await Promise.all([
    supabase.from('talent').select('*').eq('id', params.id).single(),
    supabase.from('earnings').select('*').eq('talent_id', params.id).order('year', { ascending: false }).order('month', { ascending: false }),
    supabase.from('expenses').select('*').eq('talent_id', params.id).order('date', { ascending: false }),
    supabase.from('notes').select('*').eq('talent_id', params.id).order('created_at', { ascending: false }),
    supabase.from('campaign_talent').select('*, campaign:campaigns(id, title, status, type)').eq('talent_id', params.id),
  ])

  if (error || !talent) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(toCamel({
    ...talent,
    earnings:  earnings  ?? [],
    expenses:  expenses  ?? [],
    notes:     notes     ?? [],
    campaigns: campaigns ?? [],
  }))
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const row: any = {}
  if (body.name)          row.name          = body.name
  if (body.stageName)     row.stage_name    = body.stageName
  if (body.bio)           row.bio           = body.bio
  if (body.phone)         row.phone         = body.phone
  if (body.nationality)   row.nationality   = body.nationality
  if (body.status)        row.status        = body.status
  if (body.tier)          row.tier          = body.tier
  if (body.agencyFee)     row.agency_fee    = body.agencyFee
  if (body.tags)          row.tags          = body.tags
  if (body.platformLinks) row.platform_links = body.platformLinks
  if (body.socialLinks)   row.social_links   = body.socialLinks
  row.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from('talent').update(row).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(toCamel(data))
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from('talent').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
