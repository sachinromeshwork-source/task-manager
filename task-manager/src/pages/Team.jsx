import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Plus, Trash2 } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { SUPABASE_KEY, SUPABASE_URL, supabase } from '../lib/supabase'
import { Modal } from '../components/ui'

export default function Team() {
  const { profiles, tasks, isAdmin, me, reload } = useApp()
  const [adding, setAdding] = useState(false)
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')
  const [f, setF] = useState({ name: '', position: '', email: '', password: '' })
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const add = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    // Separate client so the admin's own session is not replaced
    const temp = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'tm-temp' } })
    const { error } = await temp.auth.signUp({ email: f.email.trim(), password: f.password, options: { data: { name: f.name.trim(), position: f.position.trim() } } })
    setBusy(false)
    if (error) return setErr(error.message)
    setAdding(false); setF({ name: '', position: '', email: '', password: '' }); await reload()
  }

  const remove = async () => {
    const { error } = await supabase.rpc('delete_member', { uid: del.id })
    if (error) return setErr(error.message)
    setDel(null); await reload()
  }

  const stats = (id) => {
    const mine = tasks.filter((t) => t.assigned_to === id)
    return [mine.length, mine.filter((t) => t.status === 'Completed').length]
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Team</h1>
        {isAdmin && <button className="btn" onClick={() => { setErr(''); setAdding(true) }}><Plus size={16} /> Add team member</button>}
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr><th className="th">Name</th><th className="th">Position</th><th className="th">Email</th><th className="th">Assigned</th><th className="th">Completed</th>{isAdmin && <th className="th text-right">Actions</th>}</tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {profiles.map((p) => {
              const [a, c] = stats(p.id)
              return (
                <tr key={p.id}>
                  <td className="td font-medium">{p.name}{p.role === 'admin' && <span className="ml-2 rounded-full border border-neutral-300 px-2 py-0.5 text-xs font-normal">Admin</span>}</td>
                  <td className="td">{p.position || '—'}</td>
                  <td className="td">{p.email}</td>
                  <td className="td">{a}</td>
                  <td className="td">{c}</td>
                  {isAdmin && <td className="td text-right">
                    {p.id !== me.id && <button className="btn-icon" aria-label={`Remove ${p.name}`} onClick={() => { setErr(''); setDel(p) }}><Trash2 size={16} /></button>}
                  </td>}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {adding && (
        <Modal title="Add team member" onClose={() => setAdding(false)}>
          <form onSubmit={add} className="space-y-3">
            <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={set('name')} /></div>
            <div><label className="label">Position</label><input className="input" value={f.position} onChange={set('position')} /></div>
            <div><label className="label">Email</label><input type="email" required className="input" value={f.email} onChange={set('email')} /></div>
            <div><label className="label">Temporary password</label><input type="password" required minLength={6} className="input" value={f.password} onChange={set('password')} /></div>
            {err && <p className="text-sm">{err}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" className="btn-outline" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn" disabled={busy}>{busy ? 'Adding…' : 'Add member'}</button>
            </div>
          </form>
        </Modal>
      )}
      {del && (
        <Modal title="Remove team member?" onClose={() => setDel(null)}>
          <p className="mb-4 text-sm">{del.name} will lose access. Their tasks stay and become unassigned.</p>
          {err && <p className="mb-2 text-sm">{err}</p>}
          <div className="flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setDel(null)}>Cancel</button>
            <button className="btn" onClick={remove}>Remove member</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
