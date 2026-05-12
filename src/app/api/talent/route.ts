import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const tier   = searchParams.get('tier') ?? ''

  const where: any = {}
  if (search) where.OR = [
    { name:      { contains: search } },
    { stageName: { contains: search } },
    { tags:      { contains: search } },
  ]
  if (status) where.status = status
  if (tier)   where.tier   = tier

  const talents = await prisma.talent.findMany({
    where,
    orderBy: { joinedAt: 'desc' },
    include: {
      _count: { select: { earnings: true, campaigns: true } },
      earnings: { select: { amount: true } },
    },
  })

  return NextResponse.json(
    talents.map(t => ({
      ...t,
      totalEarnings: t.earnings.reduce((s, e) => s + e.amount, 0),
      earnings: undefined,
    }))
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const talent = await prisma.talent.create({ data: body })
  return NextResponse.json(talent, { status: 201 })
}
