export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Users are managed by OAuth — no local user deletion needed.
export async function DELETE() {
  return NextResponse.json({ message: 'Users are managed via OAuth provider.' })
}

export async function PUT() {
  return NextResponse.json({ message: 'Users are managed via OAuth provider.' })
}
