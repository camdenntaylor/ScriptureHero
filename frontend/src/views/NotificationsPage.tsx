import type { PrototypeController } from '../controllers/usePrototypeController'
import { messageTime } from '../services/prototypeMessages'
import { Icon } from './components/Icon'

export function NotificationsPage({ app }: { app: PrototypeController }) {
  const { messaging } = app
  return <div className="profile-page">
    <a className="button-link topics-back" href="#messages"><Icon name="chevron" size={16} /> Your conversations</a>
    <header className="page-heading"><h1>Notifications.</h1><p>Little thank-yous and thoughtful messages from the community.</p></header>
    <p className="messaging-demo-note"><Icon name="leaf" size={18} /> Mock activity for your account. Your saved insights never notify their authors.</p>
    <button className="button button-soft" disabled={messaging.unreadTotal === 0} onClick={messaging.markAllRead}><Icon name="check" size={17} /> Mark all as read</button>
    <ul className="notification-list" aria-label="Message notifications">
      {messaging.notifications.map(item => <li key={item.id}>
        <button className={`notification-item notification-link${item.unread ? ' notification-unread' : ''}`} onClick={() => messaging.openThread(item.conversationId)}>
          <span className="round-icon"><Icon name="mail" size={18} /></span>
          <span className="notification-copy"><span>{item.text}</span><span className="notification-time"><time dateTime={item.createdAt}>{messageTime(item.createdAt)}</time>{item.unread ? ' · Unread' : ''}</span></span>
          <span className="notification-open">Open <Icon name="chevron" size={16} /></span>
        </button>
      </li>)}
    </ul>
    <ul className="notification-list" aria-label="Space activity">
      <li className="notification-item"><span className="round-icon"><Icon name="people" size={18} /></span><p>3 new insights were shared in Oakwood Ward.</p><span className="notification-time">2 days ago</span></li>
      <li className="notification-item"><span className="round-icon"><Icon name="people" size={18} /></span><p>New activity in The Garcia Family.</p><span className="notification-time">5 days ago</span></li>
    </ul>
    {messaging.notifications.length === 0 && <div className="empty-state"><Icon name="bell" size={32} /><h2>A quiet moment.</h2><p>Thank-you notes and new messages will appear here.</p></div>}
    <a className="button-link" href="#notification-settings"><Icon name="bell" size={16} /> Notification preferences</a>
  </div>
}
