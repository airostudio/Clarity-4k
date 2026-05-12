import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const settings = await prisma.agencySettings.findFirst()
  return NextResponse.json(settings)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const existing = await prisma.agencySettings.findFirst()
  const settings = existing
    ? await prisma.agencySettings.update({ where: { id: existing.id }, data: body })
    : await prisma.agencySettings.create({ data: { ...body, id: 'default' } })
  return NextResponse.json(settings)
}
