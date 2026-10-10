import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon, type IconName } from './components/Icon'

const notifications: { icon: IconName; text: string; time: string }[] = [
  { icon: 'bookmark', text: 'Priya Anand saved your insight.', time: '2 hours ago' },
  { icon: 'mail', text: 'Marcus Bell sent you a thank-you note.', time: 'Yesterday' },
  { icon: 'people', text: '3 new insights were shared in Oakwood Ward.', time: '2 days ago' },
  { icon: 'bookmark', text: 'Noah Whitfield saved your insight.', time: '3 days ago' },
  { icon: 'mail', text: 'Ruth Castillo sent you a thank-you note.', time: '4 days ago' },
  { icon: 'people', text: 'New activity in The Garcia Family.', time: '5 days ago' },
]

export function NotificationsPage({ app }: { app: PrototypeController }) {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#profile">
        <Icon name="chevron" size={16} /> Your profile
      </a>
      <header className="page-heading">
        <h1>Notifications.</h1>
        <p>Here's what's happened since you were last here, {app.profile!.name.split(' ')[0]}.</p>
      </header>
      <ul className="notification-list">
        {notifications.map((item, index) => (
          <li className="notification-item" key={index}>
            <span className="round-icon">
              <Icon name={item.icon} size={18} />
            </span>
            <p>{item.text}</p>
            <span className="notification-time">{item.time}</span>
          </li>
        ))}
      </ul>
      <a className="button-link settings-link" href="#messages">
        <Icon name="message" size={16} /> View all messages
      </a>
      <a className="button-link settings-link" href="#notification-settings">
        <Icon name="bell" size={16} /> Notification preferences
      </a>
    </div>
  )
}
