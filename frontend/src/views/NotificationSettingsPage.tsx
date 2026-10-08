import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

export function NotificationSettingsPage({ app }: { app: PrototypeController }) {
  const [push, setPush] = useState(true)
  const [email, setEmail] = useState(false)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    app.setNotice('Notification preferences saved in this demo.')
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#notifications">
        <Icon name="chevron" size={16} /> Notifications
      </a>
      <header className="page-heading">
        <h1>Notification preferences.</h1>
      </header>
      <section className="profile-card" aria-label="Notification preferences">
        <h2>How you're notified</h2>
        <fieldset className="question-choices">
          <label>
            <input type="checkbox" checked={push} onChange={(event) => { setPush(event.target.checked); setSaved(false) }} />
            <span>Push notifications — saves, thank-yous, and space activity</span>
          </label>
          <label>
            <input type="checkbox" checked={email} onChange={(event) => { setEmail(event.target.checked); setSaved(false) }} />
            <span>Email notifications — a quiet weekly summary instead</span>
          </label>
        </fieldset>
        <button className="button button-primary" type="button" onClick={save}>
          <Icon name="check" size={17} /> {saved ? 'Saved' : 'Save changes'}
        </button>
      </section>
    </div>
  )
}
