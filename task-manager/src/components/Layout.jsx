import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Calendar, CheckSquare, LayoutDashboard, LogOut, Menu, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useApp } from '../lib/AppContext'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/team', label: 'Team', icon: Users },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { me } = useApp()
  const link = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-black text-white' : 'text-neutral-700 hover:bg-neutral-100'}`

  return (
    <div className="min-h-screen lg:flex">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 lg:hidden">
        <button className="btn-icon" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
        <img src="/logo.jpg" alt="Logo" className="h-8 mix-blend-multiply" />
      </header>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-neutral-200 bg-white p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <img src="/logo.jpg" alt="Logo" className="mb-6 h-14 self-start mix-blend-multiply" />
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={link} onClick={() => setOpen(false)}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-neutral-200 pt-4">
          <p className="truncate text-sm font-medium">{me.name}</p>
          <p className="mb-3 text-xs text-neutral-500">{me.role === 'admin' ? 'Admin' : 'Team Member'}</p>
          <button className="btn-outline w-full" onClick={() => supabase.auth.signOut()}><LogOut size={16} /> Logout</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
    </div>
  )
}
