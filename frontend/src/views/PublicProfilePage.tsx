import type { PrototypeController } from '../controllers/usePrototypeController'
import { insights } from '../services/prototypeData'
import { Icon } from './components/Icon'
import { Avatar } from './components/Avatar'
import { InsightCard } from './components/InsightCard'

export function PublicProfilePage({ app }: { app: PrototypeController }) {
  const person = insights.find((post) => post.author.id === app.viewedPersonId)?.author
  const posts = insights.filter((post) => post.author.id === app.viewedPersonId)

  if (!person) {
    return (
      <div className="profile-page">
        <a className="button-link topics-back" href="#home">
          <Icon name="chevron" size={16} /> Home
        </a>
        <header className="page-heading">
          <h1>Member not found.</h1>
        </header>
        <div className="empty-state">
          <Icon name="people" size={32} />
          <h2>We couldn't find this profile.</h2>
          <p>They may have only shared insights in a Space you haven't joined.</p>
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
        <h1>{person.name}</h1>
      </header>
      <section className="profile-card" aria-label="Member profile">
        <div className="photo-row">
          <Avatar person={person} large />
          <p className="person-location">
            <Icon name="globe" size={13} /> {person.location}
          </p>
        </div>
        <p className="muted">
          A member of the Scripture Hero community. Only their public Global insights are shown here —
          nothing private is ever visible on another member's profile.
        </p>
      </section>

      <div className="section-intro">
        <h2>Insights shared with Global</h2>
      </div>
      <div className="insight-list">
        {posts.map((post) => (
          <InsightCard key={post.id} post={post} app={app} />
        ))}
      </div>
      {posts.length === 0 && (
        <div className="empty-state">
          <Icon name="leaf" size={32} />
          <h2>Nothing shared with Global yet.</h2>
        </div>
      )}
    </div>
  )
}
