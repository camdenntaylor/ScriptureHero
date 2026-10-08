import { useState } from "react";
import type { PrototypeController } from "../controllers/usePrototypeController";
import { insights } from "../services/prototypeData";
import { Icon } from "./components/Icon";
import { InsightCard } from "./components/InsightCard";

function TopicsBrowser({ app }: { app: PrototypeController }) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const allTopics = [...new Set(insights.flatMap((post) => post.topics))].sort();
  const matchingTopics = allTopics.filter((topic) =>
    topic.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const results = selected ? insights.filter((post) => post.topics.includes(selected)) : [];

  if (selected) {
    return (
      <div className="topics-browser">
        <button className="button-link topics-back" onClick={() => setSelected(null)}>
          <Icon name="chevron" size={16} /> All topics
        </button>
        <h2 className="topics-selected-heading">{selected}</h2>
        <div className="insight-list">
          {results.map((post) => (
            <InsightCard key={post.id} post={post} app={app} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="topics-browser">
      <label className="sr-only" htmlFor="topics-search">
        Search topics
      </label>
      <div className="topics-search">
        <Icon name="search" size={18} />
        <input
          id="topics-search"
          placeholder="What are you needing today? Try “patience” or “hope”…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="topic-chip-grid">
        {matchingTopics.map((topic) => (
          <button className="topic-chip" key={topic} onClick={() => setSelected(topic)}>
            {topic}
          </button>
        ))}
      </div>
      {matchingTopics.length === 0 && (
        <p className="muted">No topics match “{query}” yet. Try a different word.</p>
      )}
    </div>
  );
}

export function HomePage({ app }: { app: PrototypeController }) {
  return (
    <div className="home-columns">
      <div className="feed-column">
        {!app.profile && <div className="home-login-note"><div><strong>A place for your own reflections.</strong><p>Log in to keep a private question list and edit your profile.</p></div><a className="button button-soft" href="#login">Log in <Icon name="arrow" size={17} /></a></div>}
        <header className="page-heading"><h1>Your daily dose of connection.</h1></header>
        <button
          className="composer-prompt"
          onClick={() => app.setDialog({ type: "compose" })}
        >
          <span className="avatar avatar-gold" aria-hidden="true">
            {app.profile?.name.slice(0, 2).toUpperCase() ?? 'AV'}
          </span>
          <span>What’s on your heart{app.profile ? `, ${app.profile.name.split(' ')[0]}` : ''}?</span>
          <span className="compose-icon">
            <Icon name="plus" />
          </span>
        </button>
        {app.drafts.length > 0 && (
          <div className="pending-note" role="status">
            <Icon name="leaf" size={18} /> {app.drafts.length}{" "}
            {app.drafts.length === 1 ? "insight is" : "insights are"} awaiting
            review in this demo.
          </div>
        )}
        <div className="feed-tabs" aria-label="Choose insights">
          <button
            aria-pressed={app.filter === "for-you"}
            className={app.filter === "for-you" ? "active" : ""}
            onClick={() => app.setFilter("for-you")}
          >
            <Icon name="sun" size={17} /> For you
          </button>
          <button
            aria-pressed={app.filter === "saved"}
            className={app.filter === "saved" ? "active" : ""}
            onClick={() => app.setFilter("saved")}
          >
            <Icon name="bookmark" size={17} /> Your helplist{" "}
            <span className="count-pill">
              {new Set(app.saved.map((item) => item.postId)).size}
            </span>
          </button>
          <button
            aria-pressed={app.filter === "topics"}
            className={app.filter === "topics" ? "active" : ""}
            onClick={() => app.setFilter("topics")}
          >
            <Icon name="search" size={17} /> Topics
          </button>
          <span className="feed-caption">
            {app.filter === "for-you"
              ? "Stories from the community"
              : app.filter === "saved"
                ? "A little wisdom to return to"
                : "Find what you're needing today"}
          </span>
        </div>
        {app.filter === "topics" ? (
          <TopicsBrowser app={app} />
        ) : (
          <>
            <div className="insight-list">
              {app.visiblePosts.map((post) => (
                <InsightCard key={post.id} post={post} app={app} />
              ))}
            </div>
            {app.visiblePosts.length === 0 && (
              <div className="empty-state">
                <Icon name="bookmark" size={32} />
                <h2>A place for words that stay with you.</h2>
                <p>Save an insight to a Soul Question and you’ll find it here.</p>
                <button
                  className="button button-soft"
                  onClick={() => app.setFilter("for-you")}
                >
                  Find an insight <Icon name="arrow" />
                </button>
              </div>
            )}
            {app.visiblePosts.length > 0 && (
              <p className="end-of-feed">
                <Icon name="sun" size={18} /> You’re all caught up. Take a little
                light with you.
              </p>
            )}
          </>
        )}
      </div>
      <aside className="feed-aside" aria-label="Your private reflections">
        <section className="questions-card">
          <div className="aside-heading">
            <Icon name="book" size={20} />
            <h2>Your soul questions</h2>
            <Icon name="lock" size={14} />
          </div>
          <p className="aside-description">
            The things you’re holding in your heart.
          </p>
          <p className="aside-description">{app.profile ? 'Open your private space to record or revisit a question.' : 'Log in to open your private space.'}</p>
          <p className="privacy-note">
            <Icon name="lock" size={13} /> Just for you. Always private.
          </p>
          <a className="button-link questions-heroes-link" href={app.profile ? '#questions' : '#login'}>
            {app.profile ? 'Open your private questions' : 'Log in'} <Icon name="arrow" size={17} />
          </a>
          <a className="button-link questions-heroes-link" href="#library">
            Not sure where to start? <Icon name="arrow" size={17} />
          </a>
        </section>
      </aside>
    </div>
  );
}
