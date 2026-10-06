import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [session, setSession] = useState(undefined) // undefined = still loading
  const [me, setMe] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  const reload = useCallback(async () => {
    if (!session) return
    const [p, t] = await Promise.all([
      supabase.from('profiles').select('*').order('name'),
      supabase.from('tasks').select('*').order('created_at', { ascending: false }),
    ])
    setProfiles(p.data || [])
    setTasks(t.data || [])
    setMe((p.data || []).find((x) => x.id === session.user.id) || null)
  }, [session?.user?.id])

  useEffect(() => {
    if (session) { setLoading(true); reload().finally(() => setLoading(false)) }
    else { setMe(null); setProfiles([]); setTasks([]) }
  }, [session?.user?.id, reload])

  const value = { session, me, profiles, tasks, reload, loading, isAdmin: me?.role === 'admin' }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
