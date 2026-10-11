import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

const modes = [
  { value: 'system', label: 'System', description: 'Follow your device’s light or dark setting.' },
  { value: 'day', label: 'Day', description: 'Warm cream surfaces and olive accents.' },
  { value: 'evening', label: 'Evening', description: 'Soft gray surfaces for quieter light.' },
] as const

export function AppearancePage({ app }: { app: PrototypeController }) {
  const [mode, setMode] = useState(app.appearance.mode)
  return <div className="profile-page">
    <a className="button-link topics-back" href="#profile"><Icon name="chevron" size={16} /> Your profile</a>
    <header className="page-heading"><h1>Make yourself comfortable.</h1><p>Choose how Scripture Hero looks on this device.</p></header>
    <form className="profile-card settings-card" onSubmit={event => {
      event.preventDefault()
      app.appearance.update(mode)
      app.setNotice('Appearance updated.')
    }}>
      <h2>Appearance</h2>
      <fieldset className="question-choices">
        <legend>Color theme</legend>
        {modes.map(choice => <label key={choice.value}>
          <input type="radio" name="appearance-mode" checked={mode === choice.value} onChange={() => setMode(choice.value)} />
          <span className="setting-choice-copy"><strong>{choice.label}</strong><span>{choice.description}</span></span>
        </label>)}
      </fieldset>
      <button className="button button-primary" type="submit"><Icon name="check" size={17} /> Save appearance</button>
    </form>
  </div>
}
