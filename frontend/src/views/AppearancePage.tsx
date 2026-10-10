import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

const OPTIONS = [
  ['system', 'Match my device'],
  ['day', 'Day — cream paper, brown ink'],
  ['evening', 'Evening — neutral gray, off-white text'],
] as const

export function AppearancePage({ app }: { app: PrototypeController }) {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#settings-privacy">
        <Icon name="chevron" size={16} /> Account & privacy
      </a>
      <header className="page-heading">
        <h1>Appearance.</h1>
      </header>
      <section className="profile-card" aria-label="Appearance settings">
        <h2>Theme</h2>
        <fieldset className="question-choices">
          {OPTIONS.map(([value, label]) => (
            <label key={value}>
              <input type="radio" name="theme" value={value} checked={app.theme === value} onChange={() => app.setTheme(value)} />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>
      </section>
    </div>
  )
}
