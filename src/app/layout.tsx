import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { getAgencyBranding } from '@/lib/agency'
import { getColorScheme, buildThemeCss } from '@/lib/colorSchemes'

// Every page here is either auth-gated or reads live Supabase data, so there's
// no benefit to static prerendering — and next-auth's SessionProvider throws
// ("Invalid URL") when server-rendered at build time without a request context.
export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const { agencyName } = await getAgencyBranding()
  return {
    title: `${agencyName} — Talent Management`,
    description: `Talent management platform for ${agencyName}`,
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { colorScheme } = await getAgencyBranding()
  const themeCss = buildThemeCss(getColorScheme(colorScheme))

  return (
    <html lang="en">
      <head>
        {/* Sets the CSS custom properties every brand-* Tailwind class reads
            from (see tailwind.config.js) — this is what makes the agency's
            chosen color scheme apply everywhere without a client-side flash
            of the wrong colors. */}
        <style dangerouslySetInnerHTML={{ __html: themeCss }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
