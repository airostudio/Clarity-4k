'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import {
  Building2, Shield, Save, CheckCircle, Mail, Info,
} from 'lucide-react'

type Tab = 'agency' | 'access'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('agency')

  return (
    <>
      <Topbar title="Settings" subtitle="Platform and agency configuration" />

      <div className="p-6 space-y-5 max-w-[900px]">
        <div className="border-b border-surface-border flex gap-1">
          {([
            { key: 'agency', label: 'Agency', icon: Building2 },
            { key: 'access', label: 'Access', icon: Shield },
          ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key ? 'text-white border-brand-500' : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'agency' && <AgencySettings />}
        {tab === 'access' && <AccessControl />}
      </div>
    </>
  )
}

function AgencySettings() {
  const [form, setForm]     = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setForm(d ?? {
        agencyName: 'Clarity 4K', currency: 'USD', defaultFee: 20,
        contactEmail: '', contactPhone: '', address: '', taxId: '',
      })
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!form) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  return (
    <form onSubmit={save} className="card space-y-5">
      <h3 className="section-title flex items-center gap-2">
        <Building2 className="w-4 h-4 text-brand-400" /> Agency Information
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Agency Name</label>
          <input className="input" value={form.agencyName ?? ''} onChange={e => set('agencyName', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Default Currency</label>
          <select className="input" value={form.currency ?? 'USD'} onChange={e => set('currency', e.target.value)}>
            {['USD', 'EUR', 'GBP', 'CAD', 'AUD'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Default Agency Fee (%)</label>
          <input className="input" type="number" min="0" max="100" value={form.defaultFee ?? 20}
            onChange={e => set('defaultFee', +e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Tax ID / VAT Number</label>
          <input className="input" value={form.taxId ?? ''} onChange={e => set('taxId', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Contact Email</label>
          <input className="input" type="email" value={form.contactEmail ?? ''} onChange={e => set('contactEmail', e.target.value)} />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Contact Phone</label>
          <input className="input" value={form.contactPhone ?? ''} onChange={e => set('contactPhone', e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm text-slate-400 mb-1.5">Address</label>
        <textarea className="input resize-none" rows={2} value={form.address ?? ''}
          onChange={e => set('address', e.target.value)} />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-emerald-400">
            <CheckCircle className="w-4 h-4" /> Saved
          </div>
        )}
      </div>
    </form>
  )
}

function AccessControl() {
  const [emails,  setEmails]  = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => { setEmails(d); setLoading(false) })
  }, [])

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="section-title flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" /> Who can sign in
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {emails.map(email => (
              <div key={email} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-brand-400" />
                </div>
                <div className="text-sm text-white">{email}</div>
              </div>
            ))}
            {emails.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-6">
                No allowed emails configured — no one can currently sign in.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="card bg-surface flex gap-3 items-start">
        <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400 leading-relaxed">
          Sign-in is restricted by the <code className="text-slate-300">ALLOWED_EMAILS</code> environment
          variable (comma-separated), checked against each Google/GitHub account on login. To add or remove
          a team member, update that variable in your hosting provider's environment settings and redeploy —
          there's no in-app way to change it, since access control shouldn't depend on the app's own database.
        </p>
      </div>
    </div>
  )
}
