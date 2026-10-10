import { Icon } from './components/Icon'

const INVITE_TEXT = "I've been using Scripture Hero to share and find spiritual insight with people I'd never otherwise meet. Thought you might like it too."

export function InviteFriendsPage() {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#settings-privacy">
        <Icon name="chevron" size={16} /> Account & privacy
      </a>
      <header className="page-heading">
        <h1>Invite friends.</h1>
        <p>Share Scripture Hero with someone who might need a place like this.</p>
      </header>
      <section className="profile-card" aria-label="Invite friends">
        <h2>A message to share</h2>
        <label className="field-label" htmlFor="invite-text">
          Copy and send it however you like
        </label>
        <textarea id="invite-text" rows={4} readOnly value={INVITE_TEXT} onFocus={(event) => event.currentTarget.select()} />
      </section>
    </div>
  )
}
