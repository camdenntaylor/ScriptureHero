import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

type MessagePermission = 'everyone' | 'helped' | 'nobody'

export function SettingsPrivacyPage({ app }: { app: PrototypeController }) {
  const [anonymous, setAnonymous] = useState(false)
  const [messagePermission, setMessagePermission] = useState<MessagePermission>('everyone')
  const [spaceVisible, setSpaceVisible] = useState(true)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    app.setNotice('Privacy settings saved in this demo.')
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#profile">
        <Icon name="chevron" size={16} /> Your profile
      </a>
      <header className="page-heading">
        <h1>Account &amp; privacy.</h1>
      </header>
      <section className="profile-card" aria-label="Privacy settings">
        <h2>Posting</h2>
        <fieldset className="question-choices">
          <label>
            <input type="checkbox" checked={anonymous} onChange={(event) => { setAnonymous(event.target.checked); setSaved(false) }} />
            <span>Post anonymously by default — your name is hidden on new Global posts</span>
          </label>
        </fieldset>

        <h2>Messages</h2>
        <fieldset className="question-choices">
          <legend>Who can message you</legend>
          {(
            [
              ['everyone', 'Everyone'],
              ['helped', 'Only people whose insight you saved'],
              ['nobody', 'No one'],
            ] as const
          ).map(([value, label]) => (
            <label key={value}>
              <input
                type="radio"
                name="message-permission"
                value={value}
                checked={messagePermission === value}
                onChange={() => { setMessagePermission(value); setSaved(false) }}
              />
              <span>{label}</span>
            </label>
          ))}
        </fieldset>

        <h2>Spaces</h2>
        <fieldset className="question-choices">
          <label>
            <input type="checkbox" checked={spaceVisible} onChange={(event) => { setSpaceVisible(event.target.checked); setSaved(false) }} />
            <span>Show my activity to space members</span>
          </label>
        </fieldset>

        <button className="button button-primary" type="button" onClick={save}>
          <Icon name="check" size={17} /> {saved ? 'Saved' : 'Save changes'}
        </button>
      </section>
    </div>
  )
}
