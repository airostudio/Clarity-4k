'use client'

import { useSession } from 'next-auth/react'
import { Bell, Search } from 'lucide-react'

interface Props { title: string; subtitle?: string }

export default function Topbar({ title, subtitle }: Props) {
  const { data: session } = useSession()
  const initials = session?.user?.name
    ?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U'

  return (
    <header className="border-b border-surface-border bg-surface-card/60 backdrop-blur sticky top-0 z-10 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-white leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-surface-muted rounded-lg transition-colors">
          <Search className="w-4 h-4" />
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-200 hover:bg-surface-muted rounded-lg transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-brand-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-xs font-bold text-white">
            {initials}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-white leading-tight">{session?.user?.name}</div>
            <div className="text-xs text-slate-400">{(session?.user as any)?.role}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
