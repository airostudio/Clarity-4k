'use client'

import { useEffect, useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import {
  Building2, Users, Shield, Trash2, Plus, X, Save,
  CheckCircle,
} from 'lucide-react'

type Tab = 'agency' | 'users'

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('agency')

  return (
    <>
      <Topbar title="Settings" subtitle="Platform and agency configuration" />

      <div className="p-6 space-y-5 max-w-[900px]">
        <div className="border-b border-surface-border flex gap-1">
          {([
            { key: 'agency', label: 'Agency', icon: Building2 },
            { key: 'users',  label: 'Users',  icon: Users },
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
        {tab === 'users'  && <UserManagement />}
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

function UserManagement() {
  const [users,   setUsers]   = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState({ name: '', email: '', password: '', role: 'MANAGER' })
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState('')

  const load = () => {
    fetch('/api/users').then(r => r.json()).then(d => { setUsers(d); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  async function addUser(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { setShowAdd(false); setForm({ name: '', email: '', password: '', role: 'MANAGER' }); load() }
    else { const d = await res.json(); setError(d.error); setSaving(false) }
  }

  async function deleteUser(id: string) {
    if (!confirm('Remove this user?')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    load()
  }

  const ROLE_COLORS: Record<string, string> = {
    ADMIN:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
    MANAGER: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    VIEWER:  'text-slate-400 bg-slate-400/10 border-slate-400/30',
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <h3 className="section-title flex items-center gap-2 mb-0">
          <Shield className="w-4 h-4 text-brand-400" /> Team Members
        </h3>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 text-xs">
          <Plus className="w-3.5 h-3.5" /> Add User
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
              <div className="w-9 h-9 rounded-full bg-brand-600/20 flex items-center justify-center text-sm font-bold text-brand-400">
                {u.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm">{u.name}</div>
                <div className="text-xs text-slate-400">{u.email}</div>
              </div>
              <span className={`badge ${ROLE_COLORS[u.role] ?? ''}`}>{u.role}</span>
              <button onClick={() => deleteUser(u.id)} className="text-slate-500 hover:text-red-400 transition-colors p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add user inline form */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-surface-border">
              <h2 className="text-base font-semibold text-white">Add Team Member</h2>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-slate-400 hover:text-white" /></button>
            </div>
            <form onSubmit={addUser} className="p-5 space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Full Name *</label>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Email *</label>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password *</label>
                <input className="input" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Role</label>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {['ADMIN', 'MANAGER', 'VIEWER'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              {error && (
                <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Adding…' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
