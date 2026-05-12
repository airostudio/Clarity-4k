import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const year  = parseInt(searchParams.get('year')  ?? String(new Date().getFullYear()))
  const month = searchParams.get('month') ?? ''

  const earningWhere: any  = { year }
  const expenseWhere: any  = {
    date: {
      gte: new Date(`${year}-01-01`),
      lte: new Date(`${year}-12-31`),
    },
  }
  if (month) {
    earningWhere.month = parseInt(month)
    const m = parseInt(month)
    expenseWhere.date = {
      gte: new Date(year, m - 1, 1),
      lte: new Date(year, m, 0),
    }
  }

  const [earnings, expenses, talents] = await Promise.all([
    prisma.earning.findMany({
      where: earningWhere,
      include: { talent: { select: { id: true, name: true, stageName: true, agencyFee: true, tier: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    }),
    prisma.expense.findMany({
      where: expenseWhere,
      include: { talent: { select: { id: true, name: true, stageName: true } } },
      orderBy: { date: 'desc' },
    }),
    prisma.talent.findMany({
      select: {
        id: true, name: true, stageName: true, tier: true, agencyFee: true,
        earnings: { select: { amount: true }, where: earningWhere },
        expenses: { select: { amount: true }, where: expenseWhere },
      },
      orderBy: { name: 'asc' },
    }),
  ])

  const totalRevenue  = earnings.reduce((s, e) => s + e.amount, 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  const talentSummary = talents.map(t => ({
    id:            t.id,
    name:          t.name,
    stageName:     t.stageName,
    tier:          t.tier,
    agencyFee:     t.agencyFee,
    grossEarnings: t.earnings.reduce((s, e) => s + e.amount, 0),
    expenses:      t.expenses.reduce((s, e) => s + e.amount, 0),
    agencyRevenue: t.earnings.reduce((s, e) => s + e.amount, 0) * (t.agencyFee / 100),
  }))

  // Monthly breakdown
  const monthlyMap: Record<number, { earnings: number; expenses: number }> = {}
  for (let i = 1; i <= 12; i++) monthlyMap[i] = { earnings: 0, expenses: 0 }
  for (const e of earnings)  monthlyMap[e.month].earnings  += e.amount
  for (const e of expenses) {
    const m = new Date(e.date).getMonth() + 1
    monthlyMap[m].expenses += e.amount
  }
  const monthly = Object.entries(monthlyMap).map(([m, v]) => ({
    month: parseInt(m),
    label: new Date(year, parseInt(m) - 1).toLocaleString('default', { month: 'short' }),
    earnings: v.earnings,
    expenses: v.expenses,
    net: v.earnings - v.expenses,
  }))

  return NextResponse.json({
    summary: {
      totalRevenue,
      totalExpenses,
      netRevenue:    totalRevenue - totalExpenses,
      agencyRevenue: talentSummary.reduce((s, t) => s + t.agencyRevenue, 0),
    },
    talentSummary,
    monthly,
    recentEarnings:  earnings.slice(0, 15),
    recentExpenses:  expenses.slice(0, 15),
  })
}
