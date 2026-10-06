import { useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { PRIORITIES, STATUSES, supabase } from '../lib/supabase'
import { Empty, Modal, PriorityTag, StatusBadge, fmtDate } from '../components/ui'
import { TaskDetails, TaskForm } from '../components/TaskModals'

export default function Tasks() {
  const { tasks, profiles, isAdmin, reload } = useApp()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [member, setMember] = useState('')
  const [view, setView] = useState(null)
  const [form, setForm] = useState(null) // {task?}
  const [del, setDel] = useState(null)
  const [err, setErr] = useState('')

  const nameOf = (id) => profiles.find((p) => p.id === id)?.name || 'Unassigned'
  const rows = tasks.filter((t) =>
    (!q || (t.name + ' ' + (t.description || '')).toLowerCase().includes(q.toLowerCase())) &&
    (!status || t.status === status) && (!priority || t.priority === priority) &&
    (!member || (member === 'none' ? !t.assigned_to : t.assigned_to === member)))

  const remove = async () => {
    const { error } = await supabase.from('tasks').delete().eq('id', del.id)
    if (error) return setErr(error.message)
    setDel(null); await reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{isAdmin ? 'Tasks' : 'My tasks'}</h1>
        {isAdmin && <button className="btn" onClick={() => setForm({})}><Plus size={16} /> Add task</button>}
      </div>

      <div className="card grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input className="input pl-9" placeholder="Search tasks" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status filter">
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority filter">
          <option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        {isAdmin && (
          <select className="input" value={member} onChange={(e) => setMember(e.target.value)} aria-label="Member filter">
            <option value="">All members</option><option value="none">Unassigned</option>
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-neutral-200 bg-neutral-50">
            <tr><th className="th">Task</th>{isAdmin && <th className="th">Assigned to</th>}<th className="th">Priority</th><th className="th">Due date</th><th className="th">Status</th><th className="th text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-neutral-50">
                <td className="td"><button className="text-left font-medium hover:underline" onClick={() => setView(t)}>{t.name}</button></td>
                {isAdmin && <td className="td">{nameOf(t.assigned_to)}</td>}
                <td className="td"><PriorityTag priority={t.priority} /></td>
                <td className="td whitespace-nowrap">{fmtDate(t.due_date)}</td>
                <td className="td"><StatusBadge status={t.status} /></td>
                <td className="td whitespace-nowrap text-right">
                  {isAdmin ? (<>
                    <button className="btn-icon" aria-label="Edit" onClick={() => setForm({ task: t })}><Pencil size={16} /></button>
                    <button className="btn-icon" aria-label="Delete" onClick={() => { setErr(''); setDel(t) }}><Trash2 size={16} /></button>
                  </>) : <button className="btn-outline !py-1" onClick={() => setView(t)}>View</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty>{tasks.length ? 'No tasks match your filters.' : isAdmin ? 'No tasks yet. Add your first task.' : 'No tasks are assigned to you yet.'}</Empty>}
      </div>

      {view && <TaskDetails task={view} onClose={() => setView(null)} onEdit={(t) => { setView(null); setForm({ task: t }) }} />}
      {form && <TaskForm task={form.task} onClose={() => setForm(null)} />}
      {del && (
        <Modal title="Delete task?" onClose={() => setDel(null)}>
          <p className="mb-4 text-sm">“{del.name}” will be permanently deleted.</p>
          {err && <p className="mb-2 text-sm">{err}</p>}
          <div className="flex justify-end gap-2">
            <button className="btn-outline" onClick={() => setDel(null)}>Cancel</button>
            <button className="btn" onClick={remove}>Delete task</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
