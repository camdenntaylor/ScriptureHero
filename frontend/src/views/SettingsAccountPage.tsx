import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

export function SettingsAccountPage({ app }: { app: PrototypeController }) {
  const [sent, setSent] = useState(false)

  function sendReset() {
    setSent(true)
    app.setNotice('Password reset link sent in this demo.')
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#settings-privacy">
        <Icon name="chevron" size={16} /> Account & privacy
      </a>
      <header className="page-heading">
        <h1>Account settings.</h1>
      </header>
      <section className="profile-card" aria-label="Account settings">
        <h2>Sign-in method</h2>
        <p className="muted">You're signed in with email and password through Supabase Auth.</p>
        <button className="button button-primary" type="button" onClick={sendReset}>
          <Icon name="mail" size={17} /> {sent ? 'Reset link sent' : 'Send password reset link'}
        </button>
      </section>
    </div>
  )
}
