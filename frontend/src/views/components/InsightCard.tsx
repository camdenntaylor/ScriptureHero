import { useRef, useState } from 'react'
import type { PrototypeController } from '../../controllers/usePrototypeController'
import type { Insight } from '../../models/prototype'
import { Icon } from './Icon'
import { Avatar } from './Avatar'

function ReflectionVideo({ post }: { post: Insight }) {
  const player = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState(false)
  async function play() {
    setError(false)
    setStarted(true)
    try {
      await player.current?.play()
    } catch {
      setError(true)
      setStarted(false)
    }
  }
  return (
    <figure className="reflection-video">
      <div className="video-frame">
        <video
          ref={player}
          src={post.video}
          controls={started}
          playsInline
          preload="metadata"
          aria-label={`Video reflection: ${post.title}`}
          onError={() => setError(true)}
        />
        {!started && (
          <button className="video-cover" onClick={() => void play()} aria-label={`Play ${post.title}`}>
            <span className="play-circle">
              <Icon name="play" size={25} />
            </span>
            <span>Pause. Breathe. Trust.</span>
            <small>A moment of reflection</small>
          </button>
        )}
      </div>
      <figcaption>
        {error ? (
          <span role="alert">
            The video couldn’t load.{' '}
            <button
              className="button-link"
              onClick={() => {
                player.current?.load()
                void play()
              }}
            >
              Try again
            </button>
          </span>
        ) : (
          'A quiet moment in nature · no spoken audio'
        )}
      </figcaption>
    </figure>
  )
}

export function InsightCard({ post, app }: { post: Insight; app: PrototypeController }) {
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')
  const liked = app.liked.includes(post.id)
  const saved = app.saved.some((item) => item.postId === post.id)
  const extraComments = app.comments[post.id] ?? []
  return (
    <article className="insight-card" aria-labelledby={`title-${post.id}`}>
      <header className="post-header">
        <a
          className="post-author-link"
          href="#public-profile"
          onClick={() => app.setViewedPersonId(post.author.id)}
          aria-label={`View ${post.author.name}'s profile`}
        >
          <Avatar person={post.author} />
          <div className="person-meta">
            <strong>{post.author.name}</strong>
            <span>
              {post.author.location} <span aria-hidden="true">·</span> {post.time}
            </span>
          </div>
        </a>
        <span className="global-label">
          <Icon name="globe" size={14} /> Global
        </span>
      </header>
      <div className="post-copy">
        <h2 id={`title-${post.id}`}>{post.title}</h2>
        <p className="post-body">{post.body}</p>
      </div>
      {post.video ? (
        <ReflectionVideo post={post} />
      ) : (
        <blockquote className="scripture-quote">
          <Icon name="book" size={20} />
          <div>
            <p>{post.verse}</p>
            <cite>{post.scripture}</cite>
          </div>
        </blockquote>
      )}
      {post.video && (
        <p className="video-scripture">
          <Icon name="book" size={16} /> {post.scripture}
        </p>
      )}
      <div className="post-actions">
        <button
          className={liked ? 'post-action is-liked' : 'post-action'}
          onClick={() => app.toggleLike(post.id)}
          aria-pressed={liked}
          aria-label={`${liked ? 'Unlike' : 'Like'} ${post.author.name}’s insight`}
        >
          <Icon name="heart" />
          <span>{post.likes + (liked ? 1 : 0)}</span>
        </button>
        <button
          className="post-action"
          onClick={() => setShowComments(!showComments)}
          aria-expanded={showComments}
          aria-controls={`comments-${post.id}`}
          aria-label={`Comment on ${post.author.name}’s insight`}
        >
          <Icon name="message" />
          <span>{post.comments.length + extraComments.length}</span>
        </button>
        <button
          className="post-action share-action"
          onClick={() => void app.share(post)}
          aria-label={`Share ${post.author.name}’s insight`}
        >
          <Icon name="share" />
          <span>Share</span>
        </button>
        <button
          className={`post-action save-action${saved ? ' is-saved' : ''}`}
          onClick={() => (app.profile ? app.setDialog({ type: 'save', post }) : (window.location.hash = '#login'))}
          aria-label={`${saved ? 'Manage saved' : 'Add'} ${post.author.name}’s insight ${saved ? '' : 'to soul question helplist'}`}
        >
          <Icon name={saved ? 'check' : 'bookmark'} size={18} />
          <span>{saved ? 'In your helplist' : 'Add to helplist'}</span>
        </button>
      </div>
      {showComments && (
        <section id={`comments-${post.id}`} className="comments-panel" aria-label="Comments">
          <p className="comments-intro">A little encouragement goes a long way.</p>
          {[...post.comments, ...extraComments.map((body) => ({ name: 'You', body }))].map((item, index) => (
            <div className="comment" key={`${post.id}-${index}`}>
              <strong>{item.name}</strong>
              <p>{item.body}</p>
            </div>
          ))}
          {post.comments.length + extraComments.length === 0 && <p className="muted">Be the first to leave a kind word.</p>}
          <form
            className="comment-form"
            onSubmit={(event) => {
              event.preventDefault()
              app.addComment(post.id, comment)
              setComment('')
            }}
          >
            <label className="sr-only" htmlFor={`comment-${post.id}`}>
              Your comment
            </label>
            <input
              id={`comment-${post.id}`}
              placeholder="Leave a thoughtful comment…"
              value={comment}
              maxLength={500}
              onChange={(event) => setComment(event.target.value)}
              required
            />
            <button className="icon-button" type="submit" disabled={!comment.trim()} aria-label="Post comment">
              <Icon name="arrow" />
            </button>
          </form>
        </section>
      )}
    </article>
  )
}
