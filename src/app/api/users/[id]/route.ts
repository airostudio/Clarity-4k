export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.user.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { role } = await req.json()
  const user = await prisma.user.update({
    where: { id: params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  })
  return NextResponse.json(user)
}
