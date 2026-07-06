export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Access is controlled entirely by the ALLOWED_EMAILS env var (see src/lib/auth.ts).
// This endpoint just exposes that list read-only so Settings can display who has access.
export async function GET() {
  const allowed = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map(e => e.trim())
    .filter(Boolean)
  return NextResponse.json(allowed)
}
