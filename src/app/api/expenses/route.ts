import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const talentId = searchParams.get('talentId') ?? ''

  const where: any = {}
  if (talentId) where.talentId = talentId

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' },
    include: { talent: { select: { name: true, stageName: true } } },
  })
  return NextResponse.json(expenses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.date) body.date = new Date(body.date)
  const expense = await prisma.expense.create({ data: body })
  return NextResponse.json(expense, { status: 201 })
}
