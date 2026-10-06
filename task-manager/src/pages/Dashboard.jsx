import { useState } from 'react'
import { useApp } from '../lib/AppContext'
import { STATUSES } from '../lib/supabase'
import { Empty, StatusBadge, fmtDate, todayStr } from '../components/ui'
import { TaskDetails } from '../components/TaskModals'

export default function Dashboard() {
  const { tasks, profiles, me, isAdmin } = useApp()
  const [open, setOpen] = useState(null)
  const count = (s) => tasks.filter((t) => t.status === s).length
  const done = count('Completed')
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0
  const recent = tasks.slice(0, 5)
  const today = todayStr()
  const upcoming = tasks.filter((t) => t.status !== 'Completed' && t.due_date)
    .sort((a, b) => a.due_date.localeCompare(b.due_date)).slice(0, 5)
  const nameOf = (id) => profiles.find((p) => p.id === id)?.name || 'Unassigned'

  const cards = [
    ['Total tasks', tasks.length], ['Pending', count('Pending')],
    ['In progress', count('In Progress')], ['Completed', done],
  ]
  const List = ({ items, showDue }) =>
    items.length === 0 ? <Empty>Nothing here yet.</Empty> : (
      <ul className="divide-y divide-neutral-100">
        {items.map((t) => (
          <li key={t.id}>
            <button onClick={() => setOpen(t)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-neutral-50">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{t.name}</span>
                <span className="block text-xs text-neutral-500">
                  {isAdmin ? nameOf(t.assigned_to) + ' · ' : ''}{showDue ? `Due ${fmtDate(t.due_date)}${t.due_date < today ? ' (overdue)' : ''}` : fmtDate(t.due_date)}
                </span>
              </span>
              <StatusBadge status={t.status} />
            </button>
          </li>
        ))}
      </ul>
    )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Hello, {me.name.split(' ')[0]}</h1>
        <p className="text-sm text-neutral-500">{isAdmin ? 'Overview of all team tasks.' : 'Your assigned tasks.'}</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, n]) => (
          <div key={label} className="card p-4">
            <p className="text-3xl font-bold">{n}</p>
            <p className="text-sm text-neutral-500">{label}</p>
          </div>
        ))}
      </div>
      <div className="card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-semibold">Progress</h2>
          <span className="text-sm text-neutral-500">{pct}% completed</span>
        </div>
        <div className="flex h-3 overflow-hidden rounded-full bg-neutral-100">
          <div className="bg-black" style={{ width: `${tasks.length ? (done / tasks.length) * 100 : 0}%` }} />
          <div className="bg-neutral-400" style={{ width: `${tasks.length ? (count('In Progress') / tasks.length) * 100 : 0}%` }} />
        </div>
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-600">
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-black" />Completed</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-neutral-400" />In progress</span>
          <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-neutral-100 ring-1 ring-neutral-300" />Pending</span>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card"><h2 className="border-b border-neutral-100 px-4 py-3 font-semibold">Recent tasks</h2><List items={recent} /></section>
        <section className="card"><h2 className="border-b border-neutral-100 px-4 py-3 font-semibold">Upcoming due dates</h2><List items={upcoming} showDue /></section>
      </div>
      {open && <TaskDetails task={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
