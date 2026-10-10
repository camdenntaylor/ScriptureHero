import type { PrototypeController } from '../controllers/usePrototypeController'
import { Icon } from './components/Icon'
import { Avatar } from './components/Avatar'

const threads = [
  {
    person: { id: 'priya', name: 'Priya Anand', initials: 'PA', color: 'lilac' as const, location: 'Chennai, India' },
    preview: 'Thank you again for sharing that — it really helped.',
    time: '2 hours ago',
  },
  {
    person: { id: 'marcus', name: 'Marcus Bell', initials: 'MB', color: 'clay' as const, location: 'Atlanta, USA' },
    preview: 'I appreciated hearing that from someone else going through it too.',
    time: 'Yesterday',
  },
]

export function MessagesPage({ app }: { app: PrototypeController }) {
  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#notifications">
        <Icon name="chevron" size={16} /> Notifications
      </a>
      <header className="page-heading">
        <h1>Messages.</h1>
      </header>
      <ul className="notification-list">
        {threads.map((thread) => (
          <li className="notification-item" key={thread.person.id}>
            <Avatar person={thread.person} />
            <p>
              <strong>{thread.person.name}</strong> — {thread.preview}
            </p>
            <span className="notification-time">{thread.time}</span>
          </li>
        ))}
      </ul>
      {threads.length === 0 && (
        <div className="empty-state">
          <Icon name="message" size={32} />
          <h2>No messages yet.</h2>
          <p>When you thank a Scripture Hero or they reply, you'll see it here.</p>
        </div>
      )}
      <p className="privacy-note">
        <Icon name="lock" size={14} /> Messages are only visible to you and {app.profile?.name ?? 'the other person'}.
      </p>
    </div>
  )
}
