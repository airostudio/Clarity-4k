import { NextAuthOptions } from 'next-auth'
import type { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import EmailProvider from 'next-auth/providers/email'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import nodemailer from 'nodemailer'

function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = (process.env.ALLOWED_EMAILS ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  if (allowed.length === 0) return false
  return allowed.includes((email ?? '').toLowerCase())
}

// SupabaseAdapter() constructs its client eagerly, which throws at build time
// (and at every cold import) if the Supabase env vars aren't set yet — same
// class of bug as the plain Supabase client in src/lib/supabase.ts. Deferring
// construction until NextAuth actually calls an adapter method keeps module
// import side-effect-free.
let _adapter: Adapter | null = null
function getAdapter(): Adapter {
  if (!_adapter) {
    _adapter = SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    })
  }
  return _adapter
}

const lazyAdapter = new Proxy({} as Adapter, {
  get(_, prop) {
    return (getAdapter() as any)[prop]
  },
})

export const authOptions: NextAuthOptions = {
  adapter: lazyAdapter,
  session: { strategy: 'database' },
  pages: { signIn: '/auth/login' },
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Without this, signing in with a second provider under the same email
      // as an existing account (e.g. Google first, then GitHub later) throws
      // OAuthAccountNotLinked instead of just linking it. Since ALLOWED_EMAILS
      // is already the real access gate, trusting the email match here is safe
      // for this small, single-team app.
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from:   process.env.EMAIL_FROM,
      // Gate the actual send on the allow-list ourselves. NextAuth's default
      // flow would email anyone who types a request in, before it ever knows
      // whether that email will pass the signIn callback below — that's both
      // an open mail-relay (arbitrary inboxes get "sign in to Clarity 4K"
      // messages) and an oracle for probing which emails are allow-listed.
      // Silently no-op-ing for disallowed emails means the UI always shows
      // the same "check your inbox" response either way.
      async sendVerificationRequest({ identifier, url }) {
        if (!isAllowedEmail(identifier)) return

        const transport = nodemailer.createTransport(process.env.EMAIL_SERVER)
        await transport.sendMail({
          to: identifier,
          from: process.env.EMAIL_FROM,
          subject: 'Sign in to Clarity 4K',
          text: `Sign in to Clarity 4K\n\n${url}\n\nThis link expires in 24 hours. If you didn't request it, ignore this email.`,
          html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #1f2937;">Sign in to Clarity 4K</h2>
              <p style="color: #4b5563;">Click the button below to sign in. This link expires in 24 hours.</p>
              <a href="${url}" style="display: inline-block; background: #3b5bfd; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
                Sign in to Clarity 4K
              </a>
              <p style="color: #9ca3af; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        })
      },
    }),
  ],
  callbacks: {
    signIn({ user }) {
      return isAllowedEmail(user.email)
    },
    session({ session, user }) {
      if (session.user) (session.user as any).id = user.id
      return session
    },
  },
}
