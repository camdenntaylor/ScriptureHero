import { useFeedController } from '../controllers/useFeedController'
import type { Post } from '../models/post'

function PostCard({ post }: { post: Post }) {
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(post.createdAt))

  return (
    <article className="post-card">
      <div className="post-meta">
        <div className="avatar" aria-hidden="true">{post.author.displayName.charAt(0)}</div>
        <div>
          <strong>{post.author.displayName}</strong>
          <p>{post.author.location} · {post.spaceName} · {date}</p>
        </div>
      </div>
      <p className="scripture-reference">{post.scriptureReference}</p>
      <p className="post-body">{post.body}</p>
      <button className="hero-action" type="button" aria-label={`Mark ${post.author.displayName}'s post as helpful`}>
        <span aria-hidden="true">♡</span> Helped {post.heroCount} people
      </button>
    </article>
  )
}

export function FeedView() {
  const { posts, loading, error } = useFeedController()

  return (
    <section className="feed" aria-labelledby="feed-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Global space</p>
          <h2 id="feed-title">Fresh insights</h2>
        </div>
        <button className="text-button" type="button">Explore spaces →</button>
      </div>
      {loading && <p className="status">Gathering insights…</p>}
      {error && <p className="status error" role="alert">{error}</p>}
      {!loading && !error && posts.length === 0 && <p className="status">Be the first to share an insight.</p>}
      <div className="post-grid">
        {posts.map((post) => <PostCard key={post.id} post={post} />)}
      </div>
    </section>
  )
}
