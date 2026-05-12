import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [
    totalTalent,
    activeTalent,
    activeCampaigns,
    allEarnings,
    recentTalent,
    recentCampaigns,
    monthlyEarnings,
  ] = await Promise.all([
    prisma.talent.count(),
    prisma.talent.count({ where: { status: 'ACTIVE' } }),
    prisma.campaign.count({ where: { status: 'ACTIVE' } }),
    prisma.earning.aggregate({ _sum: { amount: true } }),
    prisma.talent.findMany({
      take: 5,
      orderBy: { joinedAt: 'desc' },
      select: { id: true, name: true, stageName: true, avatar: true, tier: true, status: true },
    }),
    prisma.campaign.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      where: { status: { in: ['ACTIVE', 'DRAFT'] } },
      select: { id: true, title: true, type: true, status: true, budget: true, spent: true, platform: true },
    }),
    prisma.earning.groupBy({
      by: ['year', 'month'],
      _sum: { amount: true },
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
      take: 6,
    }),
  ])

  const totalRevenue    = allEarnings._sum.amount ?? 0
  const agencyRevenue   = totalRevenue * 0.2
  const avgEarnings     = activeTalent > 0 ? totalRevenue / activeTalent : 0

  // Top earners this month
  const now = new Date()
  const topEarners = await prisma.earning.groupBy({
    by: ['talentId'],
    where: { month: now.getMonth() + 1, year: now.getFullYear() },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 5,
  })

  const topEarnerDetails = await Promise.all(
    topEarners.map(async (e) => {
      const talent = await prisma.talent.findUnique({
        where: { id: e.talentId },
        select: { id: true, name: true, stageName: true, avatar: true, tier: true },
      })
      return { ...talent, amount: e._sum.amount ?? 0 }
    })
  )

  return NextResponse.json({
    kpi: { totalTalent, activeTalent, totalRevenue, agencyRevenue, activeCampaigns, avgEarnings },
    recentTalent,
    recentCampaigns,
    monthlyEarnings: monthlyEarnings.map(m => ({
      label: `${m.month}/${m.year}`,
      revenue: m._sum.amount ?? 0,
    })),
    topEarners: topEarnerDetails,
  })
}
