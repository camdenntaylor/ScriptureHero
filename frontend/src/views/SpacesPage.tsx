import { useState } from 'react'
import type { PrototypeController } from '../controllers/usePrototypeController'
import { spaces, spacePosts } from '../services/prototypeData'
import type { Space } from '../models/prototype'
import { Icon } from './components/Icon'
import { InsightCard } from './components/InsightCard'

function SpaceCard({ space, joined, onToggle, onView }: { space: Space; joined: boolean; onToggle: () => void; onView: () => void }) {
  return (
    <article className="space-card">
      <div className="space-card-top">
        <span className="space-kind">{space.kind}</span>
        <span className="space-members">
          <Icon name="people" size={14} /> {space.memberCount}
        </span>
      </div>
      <h3>{space.name}</h3>
      <p>{space.description}</p>
      {joined ? (
        <button className="button button-soft" onClick={onView}>
          View feed <Icon name="arrow" size={17} />
        </button>
      ) : (
        <button className="button button-outline" onClick={onToggle}>
          Join <Icon name="plus" size={16} />
        </button>
      )}
    </article>
  )
}

export function SpacesPage({ app }: { app: PrototypeController }) {
  const [joined, setJoined] = useState<Set<string>>(() => new Set(spaces.filter((space) => space.joinedByDefault).map((space) => space.id)))
  const [selected, setSelected] = useState<string | null>(null)

  function toggleJoined(spaceId: string) {
    setJoined((current) => {
      const next = new Set(current)
      next.has(spaceId) ? next.delete(spaceId) : next.add(spaceId)
      return next
    })
  }

  if (selected) {
    const space = spaces.find((item) => item.id === selected)!
    const posts = spacePosts[selected] ?? []
    return (
      <div className="spaces-page">
        <button className="button-link topics-back" onClick={() => setSelected(null)}>
          <Icon name="chevron" size={16} /> All spaces
        </button>
        <header className="page-heading">
          <h1>{space.name}.</h1>
        </header>
        <p className="muted">{space.description}</p>
        <div className="insight-list">
          {posts.map((post) => (
            <InsightCard key={post.id} post={post} app={app} />
          ))}
        </div>
        {posts.length === 0 && (
          <div className="empty-state">
            <Icon name="people" size={32} />
            <h2>Nothing shared here yet.</h2>
            <p>When someone in {space.name} shares an insight, it will show up here.</p>
          </div>
        )}
      </div>
    )
  }

  const yours = spaces.filter((space) => joined.has(space.id))
  const discover = spaces.filter((space) => !joined.has(space.id))

  return (
    <div className="spaces-page">
      <header className="page-heading">
        <h1>Your spaces.</h1>
      </header>
      <p className="muted">
        A space is a smaller circle within Scripture Hero — a congregation, a family, a group of friends. Posts in a
        space are only shared with its members.
      </p>
      <section aria-label="Spaces you've joined">
        <div className="section-intro">
          <h2>Your spaces</h2>
        </div>
        <div className="space-grid">
          {yours.map((space) => (
            <SpaceCard key={space.id} space={space} joined onToggle={() => toggleJoined(space.id)} onView={() => setSelected(space.id)} />
          ))}
        </div>
        {yours.length === 0 && <p className="muted">You haven't joined a space yet.</p>}
      </section>
      <section aria-label="Discover more spaces">
        <div className="section-intro">
          <h2>Discover</h2>
        </div>
        <div className="space-grid">
          {discover.map((space) => (
            <SpaceCard key={space.id} space={space} joined={false} onToggle={() => toggleJoined(space.id)} onView={() => setSelected(space.id)} />
          ))}
        </div>
        {discover.length === 0 && <p className="muted">You've joined every space in this demo.</p>}
      </section>
    </div>
  )
}
