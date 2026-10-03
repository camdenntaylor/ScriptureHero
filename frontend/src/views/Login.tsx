import { useState, type FormEvent } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { supabase } from '../services/supabase'
import { Icon } from './components/Icon'

export function Login({ app }: { app: PrototypeController }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [checkEmail, setCheckEmail] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await app.signIn(email.trim(), password)
      else { setCheckEmail((await app.signUp(email.trim(), password)) === 'check-email'); setPassword('') }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to continue. Try again.') }
    finally { setBusy(false) }
  }

  return <main id="main-content" className="account-main" tabIndex={-1}>
    <section className="account-card" aria-labelledby="login-heading">
      <span className="account-mark"><Icon name="people" size={25} /></span>
      <p className="eyebrow">YOUR LITTLE CORNER</p>
      <h1 id="login-heading">{mode === 'login' ? 'Welcome back.' : 'You belong here.'}</h1>
      <p>{mode === 'login' ? 'Sign in to your account to continue your reflections.' : 'Create an account to keep your reflections close.'}</p>
      {!supabase && <p className="form-error" role="alert">Supabase is not configured for this site. Add the project URL and publishable key to frontend/.env.</p>}
      {app.accountError && <p className="form-error" role="alert">{app.accountError} <button className="button-link" type="button" onClick={() => void app.refreshAccount()}>Try again</button></p>}
      {checkEmail ? <p className="form-success" role="status">Check your email for a confirmation link, then return to sign in.</p> : <form onSubmit={event => void submit(event)}>
        <label className="field-label" htmlFor="login-email">Email</label><input id="login-email" type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required />
        <label className="field-label" htmlFor="login-password">Password</label><input id="login-password" type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button button-primary full-width" type="submit" disabled={!supabase || busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'} <Icon name="arrow" size={18} /></button>
      </form>}
      <button className="button-link" type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setCheckEmail(false) }}>{mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}</button>
      <a className="button-link" href="#home">Explore the community <Icon name="arrow" size={17} /></a>
    </section>
  </main>
}
