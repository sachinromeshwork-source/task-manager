import { useState } from 'react'
import { supabase, PRIORITIES, STATUSES } from '../lib/supabase'
import { useApp } from '../lib/AppContext'
import { Modal, PriorityTag, StatusBadge, fmtDate } from './ui'

// Task details. Admin or the assignee can change the status.
export function TaskDetails({ task, onClose, onEdit }) {
  const { profiles, reload, isAdmin, me } = useApp()
  const [err, setErr] = useState('')
  const who = profiles.find((p) => p.id === task.assigned_to)
  const canChange = isAdmin || task.assigned_to === me.id

  const setStatus = async (status) => {
    const { error } = await supabase.from('tasks').update({ status }).eq('id', task.id)
    if (error) return setErr(error.message)
    await reload(); onClose()
  }

  return (
    <Modal title={task.name} onClose={onClose}>
      <p className="mb-4 whitespace-pre-wrap text-sm text-neutral-700">{task.description || 'No description.'}</p>
      <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
        <div><dt className="text-neutral-500">Assigned to</dt><dd className="font-medium">{who?.name || 'Unassigned'}</dd></div>
        <div><dt className="text-neutral-500">Due date</dt><dd className="font-medium">{fmtDate(task.due_date)}</dd></div>
        <div><dt className="text-neutral-500">Priority</dt><dd><PriorityTag priority={task.priority} /></dd></div>
        <div><dt className="text-neutral-500">Status</dt><dd><StatusBadge status={task.status} /></dd></div>
      </dl>
      {canChange && (
        <div className="mb-2">
          <label className="label">Update status</label>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button key={s} disabled={s === task.status} className={s === task.status ? 'btn' : 'btn-outline'} onClick={() => setStatus(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}
      {err && <p className="mt-2 text-sm">{err}</p>}
      {isAdmin && onEdit && <button className="btn-outline mt-4" onClick={() => onEdit(task)}>Edit task</button>}
    </Modal>
  )
}

// Create / edit form (admin only)
export function TaskForm({ task, onClose }) {
  const { profiles, reload } = useApp()
  const [f, setF] = useState({
    name: task?.name || '', description: task?.description || '', assigned_to: task?.assigned_to || '',
    priority: task?.priority || 'Medium', due_date: task?.due_date || '', status: task?.status || 'Pending',
  })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  const save = async (e) => {
    e.preventDefault()
    setBusy(true); setErr('')
    const row = { ...f, assigned_to: f.assigned_to || null, due_date: f.due_date || null }
    const { error } = task ? await supabase.from('tasks').update(row).eq('id', task.id) : await supabase.from('tasks').insert(row)
    setBusy(false)
    if (error) return setErr(error.message)
    await reload(); onClose()
  }

  return (
    <Modal title={task ? 'Edit task' : 'Add task'} onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div><label className="label">Task name</label><input required className="input" value={f.name} onChange={set('name')} /></div>
        <div><label className="label">Description</label><textarea rows={3} className="input" value={f.description} onChange={set('description')} /></div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div><label className="label">Assigned to</label>
            <select className="input" value={f.assigned_to} onChange={set('assigned_to')}>
              <option value="">Unassigned</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select></div>
          <div><label className="label">Due date</label><input type="date" className="input" value={f.due_date} onChange={set('due_date')} /></div>
          <div><label className="label">Priority</label>
            <select className="input" value={f.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></div>
          <div><label className="label">Status</label>
            <select className="input" value={f.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
        </div>
        {err && <p className="text-sm">{err}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save task'}</button>
        </div>
      </form>
    </Modal>
  )
}
