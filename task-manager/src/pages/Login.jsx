import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setError('Incorrect email or password.')
    setBusy(false)
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-6">
        <img src="/logo.jpg" alt="Logo" className="mx-auto mb-4 h-20 mix-blend-multiply" />
        <h1 className="mb-6 text-center text-xl font-semibold">Sign in to Task Manager</h1>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" required className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
        <label className="label" htmlFor="pw">Password</label>
        <input id="pw" type="password" required className="input mb-4" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        {error && <p className="mb-3 text-sm font-medium">{error}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  )
}
