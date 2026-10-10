import { Icon } from './components/Icon'

export function BlockedAccountsPage() {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#settings-privacy">
        <Icon name="chevron" size={16} /> Account & privacy
      </a>
      <header className="page-heading">
        <h1>Blocked accounts.</h1>
      </header>
      <div className="empty-state">
        <Icon name="lock" size={32} />
        <h2>You haven't blocked anyone.</h2>
        <p>When you block someone, they can no longer message you or see your posts. You can unblock them here at any time.</p>
      </div>
    </div>
  )
}
