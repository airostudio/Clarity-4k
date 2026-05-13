export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { name, email, password, role } = await req.json()
  const hashed = await bcrypt.hash(password, 10)
  try {
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: role ?? 'MANAGER' },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
  }
}
