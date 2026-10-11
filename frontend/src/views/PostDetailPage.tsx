import type { PrototypeController } from '../controllers/usePrototypeController'
import { insights } from '../services/prototypeData'
import { Icon } from './components/Icon'
import { InsightCard } from './components/InsightCard'

export function PostDetailPage({ app }: { app: PrototypeController }) {
  const post = insights.find((item) => item.id === app.viewedPostId)

  if (!post) {
    return (
      <div className="profile-page">
        <a className="button-link topics-back" href="#home">
          <Icon name="chevron" size={16} /> Home
        </a>
        <header className="page-heading">
          <h1>Insight not found.</h1>
        </header>
        <div className="empty-state">
          <Icon name="leaf" size={32} />
          <h2>This insight may have only been shared in a Space you haven't joined.</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <a className="button-link topics-back" href="#home">
        <Icon name="chevron" size={16} /> Home
      </a>
      <header className="page-heading">
        <p className="eyebrow">AN INSIGHT FROM {post.author.name.toUpperCase()}</p>
        <h1>{post.title}</h1>
      </header>
      <div className="insight-list">
        <InsightCard post={post} app={app} />
      </div>
      <a className="button-link" href="#report" onClick={() => app.setViewedPostId(post.id)}>
        <Icon name="flag" size={16} /> Report this post
      </a>
    </div>
  )
}
