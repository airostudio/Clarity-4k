export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const talent = await prisma.talent.findUnique({
    where: { id: params.id },
    include: {
      earnings: { orderBy: [{ year: 'desc' }, { month: 'desc' }] },
      expenses: { orderBy: { date: 'desc' } },
      notes:    { orderBy: { createdAt: 'desc' } },
      campaigns: {
        include: { campaign: { select: { id: true, title: true, status: true, type: true } } },
      },
    },
  })
  if (!talent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(talent)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json()
  const talent = await prisma.talent.update({ where: { id: params.id }, data: body })
  return NextResponse.json(talent)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.talent.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
