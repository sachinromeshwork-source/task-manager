import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../lib/AppContext'
import { todayStr } from '../components/ui'
import { TaskDetails, TaskForm } from '../components/TaskModals'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Calendar() {
  const { tasks } = useApp()
  const [cur, setCur] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1) })
  const [view, setView] = useState(null)
  const [edit, setEdit] = useState(null)
  const y = cur.getFullYear(), m = cur.getMonth()
  const first = new Date(y, m, 1).getDay()
  const total = new Date(y, m + 1, 0).getDate()
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const key = (d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const today = todayStr()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{cur.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h1>
        <div className="flex gap-2">
          <button className="btn-outline" aria-label="Previous month" onClick={() => setCur(new Date(y, m - 1, 1))}><ChevronLeft size={16} /></button>
          <button className="btn-outline" onClick={() => { const d = new Date(); setCur(new Date(d.getFullYear(), d.getMonth(), 1)) }}>Today</button>
          <button className="btn-outline" aria-label="Next month" onClick={() => setCur(new Date(y, m + 1, 1))}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-200 bg-neutral-50">
          {DAYS.map((d) => <div key={d} className="py-2 text-center text-xs font-semibold text-neutral-500">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            const items = d ? tasks.filter((t) => t.due_date === key(d)) : []
            return (
              <div key={i} className={`min-h-[72px] border-b border-r border-neutral-100 p-1 sm:min-h-[104px] sm:p-2 ${d ? '' : 'bg-neutral-50'}`}>
                {d && <span className={`mb-1 inline-grid h-6 w-6 place-items-center rounded-full text-xs ${key(d) === today ? 'bg-black font-semibold text-white' : 'text-neutral-600'}`}>{d}</span>}
                <div className="space-y-1">
                  {items.slice(0, 3).map((t) => (
                    <button key={t.id} onClick={() => setView(t)} title={t.name}
                      className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] sm:text-xs ${t.status === 'Completed' ? 'bg-neutral-100 text-neutral-500 line-through' : 'bg-black text-white'}`}>
                      {t.name}
                    </button>
                  ))}
                  {items.length > 3 && <p className="text-[10px] text-neutral-500">+{items.length - 3} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {view && <TaskDetails task={view} onClose={() => setView(null)} onEdit={(t) => { setView(null); setEdit(t) }} />}
      {edit && <TaskForm task={edit} onClose={() => setEdit(null)} />}
    </div>
  )
}
