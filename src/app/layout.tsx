import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

// Every page here is either auth-gated or reads live Supabase data, so there's
// no benefit to static prerendering — and next-auth's SessionProvider throws
// ("Invalid URL") when server-rendered at build time without a request context.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Clarity 4K — Talent Management',
  description: 'Professional talent management platform for content creators',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
