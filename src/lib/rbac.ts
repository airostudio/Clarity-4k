import { supabase } from '@/lib/supabase'

export type Role = 'ADMIN' | 'MANAGER' | 'VIEWER'

export const RANK: Record<Role, number> = { VIEWER: 0, MANAGER: 1, ADMIN: 2 }

export function hasRole(role: Role | null | undefined, min: Role): boolean {
  if (!role) return false
  return RANK[role] >= RANK[min]
}

async function getStaffRecord(email: string) {
  const { data } = await supabase
    .from('staff')
    .select('*')
    .ilike('email', email)
    .maybeSingle()
  return data
}

/**
 * Resolves whether an email may sign in, and with what role.
 *
 * ADMIN_EMAIL (env var) is a permanent break-glass admin, independent of the
 * staff table — this is what keeps a fresh install from locking everyone out
 * before anyone exists in `staff`. Everyone else must be an ACTIVE row there.
 */
export async function resolveAccess(
  email: string | null | undefined
): Promise<{ allowed: boolean; role: Role | null }> {
  if (!email) return { allowed: false, role: null }

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail && email.toLowerCase() === adminEmail.toLowerCase()) {
    return { allowed: true, role: 'ADMIN' }
  }

  const staff = await getStaffRecord(email)
  if (!staff || staff.status !== 'ACTIVE') return { allowed: false, role: null }
  return { allowed: true, role: staff.role as Role }
}
