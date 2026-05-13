export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') ?? ''

  const where: any = {}
  if (status) where.status = status

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      talents: {
        include: { talent: { select: { id: true, name: true, avatar: true } } },
      },
    },
  })
  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const { talentIds, ...data } = await req.json()
  const campaign = await prisma.campaign.create({
    data: {
      ...data,
      startDate: new Date(data.startDate),
      endDate:   data.endDate ? new Date(data.endDate) : undefined,
      talents: talentIds?.length
        ? { create: talentIds.map((id: string) => ({ talentId: id })) }
        : undefined,
    },
    include: { talents: { include: { talent: true } } },
  })
  return NextResponse.json(campaign, { status: 201 })
}
