import { Icon } from "./components/Icon";
import { Logo } from "./components/Logo";

export function LandingPage() {
  return (
    <main id="main-content" className="landing-main" tabIndex={-1}>
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <h1 id="landing-title">
            A dedicated platform for <em>spiritual</em> things
          </h1>
          <p className="landing-description">
            Share your spiritual experiences. Find answers to your questions.
            Grow closer to Jesus, and to each other.
          </p>
          <a className="button button-primary landing-cta" href="#home">
            Find your community <Icon name="arrow" />
          </a>
          <p className="welcome-note">
            <Icon name="globe" size={16} /> Every background. Every stage of
            faith. You belong here.
          </p>
          <p className="welcome-note">
            <Icon name="leaf" size={16} /> New here? Try browsing the feed
            and saving an insight that speaks to you — there's no single
            path to follow.
          </p>
        </div>
        <div className="connection-scene">
          <div
            className="community-photo"
            role="img"
            aria-label="Friends listening and sharing stories around a garden table"
          />
          <div className="scene-caption">
            <span>Different stories.</span>
            <span>The same need to feel connected.</span>
          </div>
          <div className="floating-insight">
            <div className="insight-mark">
              <Logo />
            </div>
            <p>
              “Someone else’s story was
              <br />
              the reminder I needed.”
            </p>
            <span>A small insight. A meaningful connection.</span>
          </div>
          <span className="scene-label">
            <Icon name="heart" size={15} /> A place to be understood
          </span>
        </div>
      </section>
      <section
        className="connection-principles"
        aria-label="Ways we grow together"
      >
        <div className="principle">
          <span className="principle-icon">
            <Icon name="book" size={23} />
          </span>
          <div>
            <h2>Share what’s on your heart</h2>
          </div>
        </div>
        <div className="principle">
          <span className="principle-icon">
            <Icon name="people" size={23} />
          </span>
          <div>
            <h2>See faith through fresh eyes</h2>
          </div>
        </div>
        <div className="principle">
          <span className="principle-icon">
            <Icon name="heart" size={23} />
          </span>
          <div>
            <h2>Let someone know they helped</h2>
          </div>
        </div>
      </section>
      <footer className="landing-footer">
        <nav className="footer-links" aria-label="More">
          <a href="#about">About</a>
          <a href="#help">Help</a>
          <a href="#terms">Terms</a>
          <a href="#privacy">Privacy</a>
        </nav>
        <span className="prototype-label">
          Early-stage prototype for a class project — not a real product or
          community.
        </span>
      </footer>
    </main>
  );
}
