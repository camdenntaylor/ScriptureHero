import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { conversationName, unreadCount } from '../models/messaging'
import { messageTime } from '../services/prototypeMessages'
import { Avatar } from './components/Avatar'
import { Icon } from './components/Icon'

export function MessagesPage({ app }: { app: PrototypeController }) {
  const [choosing, setChoosing] = useState(false)
  const [query, setQuery] = useState('')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const messaging = app.messaging
  const threads = messaging.conversations.filter(thread => !onlyUnread || unreadCount(messaging.state, thread) > 0)
  const contacts = messaging.contacts.filter(person => person.name.toLowerCase().includes(query.trim().toLowerCase()))

  return <div className="messages-page">
    <header className="page-heading">
      <p className="eyebrow"><Icon name="message" size={16} /> A LITTLE CONNECTION</p>
      <h1>{choosing ? 'Start with a hello.' : 'Your conversations.'}</h1>
      <p>{choosing ? 'Choose someone from the fictional community.' : 'A place for thoughtful hellos and little thank-yous.'}</p>
    </header>
    <p className="messaging-demo-note"><Icon name="leaf" size={18} /> Preview as Avery. All people are fictional; notes stay in this tab and reset on reload.</p>
    {choosing ? <>
      <button className="button-link topics-back" onClick={() => setChoosing(false)}><Icon name="chevron" size={16} /> Back to conversations</button>
      <label className="sr-only" htmlFor="contact-search">Search fictional people</label>
      <div className="topics-search"><Icon name="search" size={18} /><input id="contact-search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Find someone by name…" /></div>
      <ul className="conversation-list" aria-label="Fictional people">
        {contacts.map(person => <li key={person.id}><button className="conversation-row" onClick={() => messaging.startChat(person)}><Avatar person={person} /><span className="conversation-copy"><strong>{person.name}</strong><span>{person.location}</span></span><Icon name="chevron" size={18} /></button></li>)}
      </ul>
      {contacts.length === 0 && <div className="empty-state"><Icon name="search" size={28} /><h2>No one by that name.</h2><p>Try another name or browse the community.</p><button className="button button-soft" onClick={() => setQuery('')}>Show everyone</button></div>}
    </> : <>
      <div className="messages-toolbar">
        <div className="feed-tabs" aria-label="Filter conversations"><button className={!onlyUnread ? 'active' : ''} aria-pressed={!onlyUnread} onClick={() => setOnlyUnread(false)}>All</button><button className={onlyUnread ? 'active' : ''} aria-pressed={onlyUnread} onClick={() => setOnlyUnread(true)}>Unread <span className="count-pill">{messaging.unreadTotal}</span></button></div>
        <button className="button button-primary" onClick={() => setChoosing(true)}><Icon name="plus" size={18} /> New message</button>
      </div>
      <ul className="conversation-list" aria-label="Conversations">
        {threads.map(thread => {
          const last = thread.messages.at(-1)
          const draft = messaging.state.drafts[thread.id]
          const unread = unreadCount(messaging.state, thread)
          return <li key={thread.id}><button className={`conversation-row${unread ? ' conversation-unread' : ''}`} onClick={() => messaging.openThread(thread.id)}>
            {thread.person ? <Avatar person={thread.person} /> : <span className="avatar avatar-gold"><Icon name="lock" size={20} /></span>}
            <span className="conversation-copy"><strong>{conversationName(thread)}</strong><span className="conversation-mode">{thread.mode === 'named' ? 'Named conversation' : thread.mode === 'anonymous-sent' ? 'Anonymous thanks · sent by you' : 'Anonymous thanks · no replies'}</span><span className="conversation-preview">{draft?.trim() ? `Draft: ${draft}` : last ? `${last.direction === 'outgoing' ? 'You: ' : ''}${last.body}` : 'Say a thoughtful hello.'}</span></span>
            <span className="conversation-meta">{last && <time dateTime={last.createdAt}>{messageTime(last.createdAt)}</time>}{unread > 0 && <span className="count-pill" aria-label={`${unread} unread ${unread === 1 ? 'note' : 'notes'}`}>{unread}</span>}<Icon name="chevron" size={18} /></span>
          </button></li>
        })}
      </ul>
      {threads.length === 0 && <div className="empty-state"><Icon name="message" size={32} /><h2>{onlyUnread ? 'All caught up.' : 'A conversation starts with a kind word.'}</h2><p>{onlyUnread ? 'Your notes are still here in All conversations.' : 'Start a message or send a little thanks to a Scripture Hero.'}</p>{onlyUnread && <button className="button button-soft" onClick={() => setOnlyUnread(false)}>View all conversations</button>}</div>}
      <a className="button-link" href="#notifications"><Icon name="bell" size={17} /> Open notification center</a>
    </>}
    <p className="privacy-note messaging-privacy"><Icon name="lock" size={16} /> Soul Questions and saved connections are never added to a message.</p>
  </div>
}
