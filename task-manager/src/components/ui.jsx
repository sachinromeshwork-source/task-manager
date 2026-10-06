import { X } from 'lucide-react'
import { useEffect } from 'react'

export const fmtDate = (d) =>
  d ? new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
export const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const statusStyle = {
  Pending: 'border-neutral-300 bg-white text-neutral-700',
  'In Progress': 'border-neutral-500 bg-neutral-200 text-black',
  Completed: 'border-black bg-black text-white',
}
export const StatusBadge = ({ status }) => (
  <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle[status]}`}>{status}</span>
)

const prioStyle = { Low: 'text-neutral-500', Medium: 'text-neutral-800', High: 'font-bold text-black' }
export const PriorityTag = ({ priority }) => (
  <span className={`inline-flex items-center gap-1.5 text-sm ${prioStyle[priority]}`}>
    <span className={`h-2 w-2 rounded-full ${priority === 'High' ? 'bg-black' : priority === 'Medium' ? 'bg-neutral-500' : 'border border-neutral-400'}`} />
    {priority}
  </span>
)

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" onMouseDown={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl bg-white p-5 sm:rounded-xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const Empty = ({ children }) => <p className="px-4 py-8 text-center text-sm text-neutral-500">{children}</p>
