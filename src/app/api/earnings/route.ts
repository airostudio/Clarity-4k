export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const talentId = searchParams.get('talentId') ?? ''
  const year     = searchParams.get('year') ?? ''

  const where: any = {}
  if (talentId) where.talentId = talentId
  if (year)     where.year     = parseInt(year)

  const earnings = await prisma.earning.findMany({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: { talent: { select: { name: true, stageName: true } } },
  })
  return NextResponse.json(earnings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const earning = await prisma.earning.create({ data: body })
  return NextResponse.json(earning, { status: 201 })
}
