import { Navigate, Route, Routes } from 'react-router-dom'
import { useApp } from './lib/AppContext'
import { configured, supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Team from './pages/Team'

const Screen = ({ children }) => <div className="grid min-h-screen place-items-center p-6">{children}</div>

export default function App() {
  const { session, me, loading } = useApp()

  if (!configured)
    return (
      <Screen>
        <div className="card max-w-md p-6 text-sm">
          <h1 className="mb-2 text-lg font-semibold">Supabase is not configured</h1>
          <p>Copy <code>.env.example</code> to <code>.env</code>, add your Supabase URL and anon key, then restart <code>npm run dev</code>.</p>
        </div>
      </Screen>
    )
  if (session === undefined || (session && loading)) return <Screen><p className="text-sm text-neutral-500">Loading…</p></Screen>
  if (!session) return <Login />
  if (!me)
    return (
      <Screen>
        <div className="card max-w-md p-6 text-sm">
          <h1 className="mb-2 text-lg font-semibold">Account not found</h1>
          <p className="mb-4">This account has no team profile. It may have been removed by an admin.</p>
          <button className="btn" onClick={() => supabase.auth.signOut()}>Log out</button>
        </div>
      </Screen>
    )

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/team" element={<Team />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
