import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'

export function DeleteAccountPage({ app }: { app: PrototypeController }) {
  const [confirming, setConfirming] = useState(false)

  async function confirmDelete() {
    app.setNotice('Account deleted in this demo. You can sign back in to start fresh.')
    await app.signOut()
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#settings-privacy">
        <Icon name="chevron" size={16} /> Account & privacy
      </a>
      <header className="page-heading">
        <h1>Delete your account.</h1>
      </header>
      <section className="profile-card" aria-label="Delete account">
        <h2>{app.isGuest ? 'Clear your guest session' : "This can't be undone"}</h2>
        <p>
          {app.isGuest ? 'This clears your guest changes and starts again with the sample profile. Your guest posts, questions, and messages are never saved to a real account.' : <>Deleting your account removes your profile, Soul Questions, saved insights, and conversation
          history. Anything you've shared with Global or a Space stays visible, but is no longer attributed
          to your name.</>}
        </p>
        {!confirming ? (
          <button className="button button-outline" type="button" onClick={() => setConfirming(true)}>
            <Icon name="close" size={17} /> Delete my account
          </button>
        ) : (
          <>
            <p className="form-error" role="alert">
              {app.isGuest ? 'Clear your changes and start fresh?' : 'Are you sure? This is permanent.'}
            </p>
            <button className="button button-primary" type="button" onClick={() => void confirmDelete()}>
              <Icon name="check" size={17} /> Yes, delete my account
            </button>
            <button className="button-link" type="button" onClick={() => setConfirming(false)}>
              Cancel
            </button>
          </>
        )}
      </section>
    </div>
  )
}
