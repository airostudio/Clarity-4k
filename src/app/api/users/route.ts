export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

// Users are now managed by OAuth (Google / GitHub).
// This endpoint returns a stub so the Settings UI doesn't error.
export async function GET() {
  return NextResponse.json([])
}
