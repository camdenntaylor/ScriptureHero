import { FeedView } from './FeedView'

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="Scripture Hero home">
          <span className="brand-mark" aria-hidden="true">SH</span>
          <span>Scripture Hero</span>
        </a>
        <button className="secondary-button" type="button">Sign in</button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">A worldwide community of faith</p>
          <h1>Teaching the world about Jesus, one verse at a time.</h1>
          <p className="hero-copy">
            Share scriptural insights, learn through testimony, and become the answer to someone’s soul question.
          </p>
          <button className="primary-button" type="button">Share an insight</button>
        </section>

        <FeedView />
      </main>
    </div>
  )
}
