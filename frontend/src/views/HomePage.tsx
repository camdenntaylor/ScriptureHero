import { useRef, useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import type { Insight } from '../models/prototype'
import { questions } from '../services/prototypeData'
import { Icon } from './components/Icon'
import { Avatar } from './components/Avatar'

function ReflectionVideo({ post }: { post: Insight }) {
  const player = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(false)
  async function play() {
    setError(false)
    setStarted(true)
    try { await player.current?.play() } catch { setError(true); setStarted(false) }
  }
  return <figure className="reflection-video">
    <div className="video-frame"><video ref={player} src={post.video} controls={started} playsInline preload="metadata" aria-label={`Video reflection: ${post.title}`} onError={() => setError(true)} />
      {!started && <button className="video-cover" onClick={() => void play()} aria-label={`Play ${post.title}`}><span className="play-circle"><Icon name="play" size={25} /></span><span>Pause. Breathe. Trust.</span><small>A moment of reflection</small></button>}
    </div>
    <figcaption>{error ? <span role="alert">The video couldn’t load. <button className="button-link" onClick={() => { player.current?.load(); void play() }}>Try again</button></span> : 'A quiet moment in nature · no spoken audio'}</figcaption>
  </figure>
}

function InsightCard({ post, app }: { post: Insight; app: PrototypeController }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const liked = app.liked.includes(post.id)
  const saved = app.saved.some(item => item.postId === post.id)
  const extraComments = app.comments[post.id] ?? []
  return <article className="insight-card" aria-labelledby={`title-${post.id}`}>
    <header className="post-header"><Avatar person={post.author} /><div className="person-meta"><strong>{post.author.name}</strong><span>{post.author.location} <span aria-hidden="true">·</span> {post.time}</span></div><span className="global-label"><Icon name="globe" size={14} /> Global</span></header>
    <div className="post-copy"><h2 id={`title-${post.id}`}>{post.title}</h2><p className="post-body">{post.body}</p></div>
    {post.video ? <ReflectionVideo post={post} /> : <blockquote className="scripture-quote"><Icon name="book" size={20} /><div><p>{post.verse}</p><cite>{post.scripture}</cite></div></blockquote>}
    {post.video && <p className="video-scripture"><Icon name="book" size={16} /> {post.scripture}</p>}
    <div className="post-actions">
      <button className={liked ? 'post-action is-liked' : 'post-action'} onClick={() => app.toggleLike(post.id)} aria-pressed={liked} aria-label={`${liked ? 'Unlike' : 'Like'} ${post.author.name}’s insight`}><Icon name="heart" /><span>{post.likes + (liked ? 1 : 0)}</span></button>
      <button className="post-action" onClick={() => setShowComments(!showComments)} aria-expanded={showComments} aria-controls={`comments-${post.id}`} aria-label={`Comment on ${post.author.name}’s insight`}><Icon name="message" /><span>{post.comments.length + extraComments.length}</span></button>
      <button className="post-action share-action" onClick={() => void app.share(post)} aria-label={`Share ${post.author.name}’s insight`}><Icon name="share" /><span>Share</span></button>
      <button className={`post-action save-action${saved ? ' is-saved' : ''}`} onClick={() => app.setDialog({ type: 'save', post })} aria-label={`${saved ? 'Manage saved' : 'Add'} ${post.author.name}’s insight ${saved ? '' : 'to soul question helplist'}`}><Icon name={saved ? 'check' : 'bookmark'} size={18} /><span>{saved ? 'In your helplist' : 'Add to helplist'}</span></button>
    </div>
    {showComments && <section id={`comments-${post.id}`} className="comments-panel" aria-label="Comments">
      <p className="comments-intro">A little encouragement goes a long way.</p>
      {[...post.comments, ...extraComments.map(body => ({ name: 'You', body }))].map((item, index) => <div className="comment" key={`${post.id}-${index}`}><strong>{item.name}</strong><p>{item.body}</p></div>)}
      {post.comments.length + extraComments.length === 0 && <p className="muted">Be the first to leave a kind word.</p>}
      <form className="comment-form" onSubmit={event => { event.preventDefault(); app.addComment(post.id, comment); setComment('') }}><label className="sr-only" htmlFor={`comment-${post.id}`}>Your comment</label><input id={`comment-${post.id}`} placeholder="Leave a thoughtful comment…" value={comment} maxLength={500} onChange={event => setComment(event.target.value)} required /><button className="icon-button" type="submit" disabled={!comment.trim()} aria-label="Post comment"><Icon name="arrow" /></button></form>
    </section>}
  </article>
}

export function HomePage({ app }: { app: PrototypeController }) {
  return <div className="home-columns">
    <div className="feed-column">
      <header className="page-heading"><p className="eyebrow">YOUR DAILY DOSE OF CONNECTION</p><h1>A little wisdom. A little closer.</h1><p>Different lives, shared faith. Find something that speaks to you.</p></header>
      <button className="composer-prompt" onClick={() => app.setDialog({ type: 'compose' })}><span className="avatar avatar-gold" aria-hidden="true">AV</span><span>What’s on your heart, Avery?</span><span className="compose-icon"><Icon name="plus" /></span></button>
      {app.drafts.length > 0 && <div className="pending-note" role="status"><Icon name="leaf" size={18} /> {app.drafts.length} {app.drafts.length === 1 ? 'insight is' : 'insights are'} awaiting review in this demo.</div>}
      <div className="feed-tabs" aria-label="Choose insights"><button aria-pressed={app.filter === 'for-you'} className={app.filter === 'for-you' ? 'active' : ''} onClick={() => app.setFilter('for-you')}><Icon name="sun" size={17} /> For you</button><button aria-pressed={app.filter === 'saved'} className={app.filter === 'saved' ? 'active' : ''} onClick={() => app.setFilter('saved')}><Icon name="bookmark" size={17} /> Your helplist <span className="count-pill">{new Set(app.saved.map(item => item.postId)).size}</span></button><span className="feed-caption">{app.filter === 'for-you' ? 'Inspired by your soul questions' : 'A little wisdom to return to'}</span></div>
      <div className="insight-list">{app.visiblePosts.map(post => <InsightCard key={post.id} post={post} app={app} />)}</div>
      {app.visiblePosts.length === 0 && <div className="empty-state"><Icon name="bookmark" size={32} /><h2>A place for words that stay with you.</h2><p>Save an insight to a Soul Question and you’ll find it here.</p><button className="button button-soft" onClick={() => app.setFilter('for-you')}>Find an insight <Icon name="arrow" /></button></div>}
      {app.visiblePosts.length > 0 && <p className="end-of-feed"><Icon name="sun" size={18} /> You’re all caught up. Take a little light with you.</p>}
    </div>
    <aside className="feed-aside" aria-label="Your private reflections">
      <section className="questions-card"><div className="aside-heading"><Icon name="book" size={20} /><h2>Your soul questions</h2><Icon name="lock" size={14} /></div><p className="aside-description">The things you’re holding in your heart.</p><ul>{questions.map(question => <li key={question.id}><span className="question-dot" /><div><p>{question.title}</p><span>{app.saved.filter(item => item.questionId === question.id).length} saved insights</span></div></li>)}</ul><p className="privacy-note"><Icon name="lock" size={13} /> Just for you. Always private.</p></section>
      <section className="small-hero-card"><span className="round-icon"><Icon name="heart" size={24} /></span><h2>Someone made a difference.</h2><p>A simple “thank you” can be the beginning of a beautiful connection.</p><a className="button-link" href="#heroes">Meet your Scripture Heroes <Icon name="arrow" size={17} /></a></section>
      <p className="aside-footer">A little more understanding.<br />A little less alone.</p>
    </aside>
  </div>
}
