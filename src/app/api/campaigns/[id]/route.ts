import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: params.id },
    include: { talents: { include: { talent: true } } },
  })
  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(campaign)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { talentIds, ...data } = await req.json()
  if (data.startDate) data.startDate = new Date(data.startDate)
  if (data.endDate)   data.endDate   = new Date(data.endDate)
  const campaign = await prisma.campaign.update({ where: { id: params.id }, data })
  return NextResponse.json(campaign)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.campaign.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
