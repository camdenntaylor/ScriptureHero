import { useEffect, useRef, useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { conversationName, MESSAGE_LIMIT } from '../models/messaging'
import { messageTime } from '../services/prototypeMessages'
import { Avatar } from './components/Avatar'
import { Icon } from './components/Icon'

export function ConversationPage({ app }: { app: PrototypeController }) {
  const { messaging } = app
  const thread = messaging.selected
  const [error, setError] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)
  const body = thread ? messaging.state.drafts[thread.id] ?? '' : ''
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' }) }, [thread?.id, thread?.messages.length])

  if (!thread) return <div className="messages-page"><header className="page-heading"><h1>Choose a conversation.</h1></header><div className="empty-state"><Icon name="message" size={32} /><h2>A little connection is waiting.</h2><p>Open a conversation from your inbox. This preview resets on reload.</p><a className="button button-primary" href="#messages">Open messages <Icon name="arrow" size={18} /></a></div></div>
  return <div className="messages-page conversation-page">
    <a className="button-link topics-back" href="#messages"><Icon name="chevron" size={16} /> All conversations</a>
    <header className="page-heading conversation-heading">
      {thread.person ? <Avatar person={thread.person} large /> : <span className="avatar avatar-gold avatar-large"><Icon name="lock" size={26} /></span>}
      <div><h1>{conversationName(thread)}</h1><p>{thread.mode === 'named' ? 'A thoughtful conversation, just between you two.' : thread.mode === 'anonymous-sent' ? 'Your anonymous thank-you notes.' : 'A little kindness from someone in the community.'}</p></div>
    </header>
    <p className="messaging-demo-note"><Icon name="leaf" size={18} /> Mock conversation. Notes are simulated and never delivered.</p>
    <section className="conversation-panel" aria-label="Conversation">
      <p className="conversation-privacy"><Icon name="lock" size={16} />{thread.mode === 'named' ? 'In a named chat, your profile name appears as the sender. Your Soul Questions and helplist stay private.' : thread.mode === 'anonymous-sent' ? 'Your name stays hidden. Anonymous notes are separate from named chats and cannot receive replies.' : 'The sender chose to stay anonymous. Their identity stays private, and replies are unavailable.'}</p>
      <div className="message-history" role="log" aria-label="Message history" aria-relevant="additions" tabIndex={0}>
        {thread.messages.length === 0 && <div className="empty-state"><Icon name="message" size={28} /><h2>Begin with a kind word.</h2><p>Only what you choose to write goes into this conversation.</p></div>}
        {thread.messages.map(message => <article key={message.id} className={`chat-message chat-message-${message.direction}${message.kind === 'thanks' ? ' chat-thanks' : ''}`}>
          <span className="chat-message-label">{message.direction === 'outgoing' ? 'You' : thread.mode === 'anonymous-received' ? 'Someone in the community' : conversationName(thread)}{message.kind === 'thanks' && <span><Icon name="heart" size={13} /> Thank-you note</span>}</span>
          <p>{message.body}</p><time dateTime={message.createdAt}>{messageTime(message.createdAt)}</time>
        </article>)}
        <div ref={end} />
      </div>
      {thread.mode === 'named' ? <form className="message-composer" onSubmit={event => {
        event.preventDefault()
        if (messaging.send(body)) { setError(''); app.setNotice('Message saved in this demo.'); composer.current?.focus() }
        else setError(`Enter a message of 1–${MESSAGE_LIMIT} characters.`)
      }}>
        <label className="field-label" htmlFor="chat-body">Your message</label>
        <textarea ref={composer} id="chat-body" rows={3} maxLength={MESSAGE_LIMIT} value={body} onChange={event => { messaging.setDraft(thread.id, event.target.value); setError('') }} placeholder="Start with a kind word…" required aria-describedby="chat-hint" />
        <div className="message-composer-actions"><p className="field-hint" id="chat-hint">{body.length}/{MESSAGE_LIMIT} · Be kind. Be yourself.</p><button className="button button-primary" type="submit" disabled={!body.trim()}><Icon name="arrow" size={18} /> Send message</button></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="button-link" type="button" onClick={() => app.setDialog({ type: 'message', person: thread.person, thanks: true })}><Icon name="heart" size={16} /> Send a little thanks</button>
      </form> : thread.mode === 'anonymous-sent' ? <div className="anonymous-note-actions"><button className="button button-soft" onClick={() => app.setDialog({ type: 'message', person: thread.person, thanks: true })}><Icon name="heart" size={16} /> Send another thank-you</button></div> : null}
    </section>
  </div>
}
