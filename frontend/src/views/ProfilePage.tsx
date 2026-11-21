import type { PrototypeController } from "../controllers/usePrototypeController";
import { avatarUrl } from "../services/supabase";
import { Icon, type IconName } from "./components/Icon";
import { OwnPosts } from "./components/OwnPosts";
import { ImpactDashboard, ScriptureHeroes } from "./components/ScriptureHeroes";

export function ProfilePage({ app }: { app: PrototypeController }) {
  const profile = app.profile!;
  const photoUrl = avatarUrl(profile.avatarPath);
  const initials = profile.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const savedCount = new Set(app.saved.map((item) => item.postId)).size;
  const possibleBadges: ({ icon: IconName; label: string } | false)[] = [
    savedCount >= 1 && { icon: "bookmark", label: "First save" },
    app.heroes.length >= 1 && {
      icon: "heart",
      label: "Found a Scripture Hero",
    },
    app.questions.length >= 1 && { icon: "book", label: "Reflective heart" },
  ];
  const badges = possibleBadges.filter(
    (badge): badge is { icon: IconName; label: string } => Boolean(badge),
  );

  return (
    <div className="profile-page">
      <header className="page-heading">
        <h1>Your little corner.</h1>
        <p>Your story, the words you keep, and the good you share.</p>
      </header>

      <section className="profile-card" aria-label="Profile summary">
        <div className="photo-row">
          {photoUrl ? (
            <img className="profile-photo" src={photoUrl} alt="Your profile" />
          ) : (
            <span
              className="avatar avatar-gold avatar-large"
              aria-hidden="true"
            >
              {initials}
            </span>
          )}
          <div>
            <h2>{profile.name}</h2>
            {profile.location && (
              <p className="person-location">
                <Icon name="globe" size={13} /> {profile.location}
              </p>
            )}
          </div>
        </div>
        {profile.bio && <p>{profile.bio}</p>}
        {app.favoriteVerse && (
          <blockquote className="scripture-quote">
            <Icon name="book" size={18} />
            <div>
              <cite>{app.favoriteVerse}</cite>
            </div>
          </blockquote>
        )}
        <a className="button button-soft" href="#profile-edit">
          Edit profile <Icon name="arrow" size={17} />
        </a>
      </section>

      <ImpactDashboard app={app} />
      <ScriptureHeroes app={app} />

      {badges.length > 0 && (
        <section aria-label="Badges">
          <div className="section-intro">
            <h2>Badges</h2>
          </div>
          <div className="badge-row">
            {badges.map((badge) => (
              <span className="hero-badge" key={badge.label}>
                <Icon name={badge.icon} size={13} /> {badge.label}
              </span>
            ))}
          </div>
        </section>
      )}

      <OwnPosts app={app} />

      <div className="profile-links-grid">
        <section className="profile-card soul-card">
          <div className="aside-heading">
            <Icon name="book" size={20} />
            <h2>Soul Questions</h2>
            <Icon name="lock" size={15} />
          </div>
          <p>Record and revisit what you're carrying, privately.</p>
          <a className="button button-soft" href="#questions">
            Open <Icon name="arrow" size={17} />
          </a>
        </section>
        <section className="profile-card soul-card">
          <div className="aside-heading">
            <Icon name="lock" size={20} />
            <h2>Account & Privacy</h2>
          </div>
          <p>Control anonymous posting, messages, and circle visibility.</p>
          <a className="button button-soft" href="#settings-privacy">
            Open <Icon name="arrow" size={17} />
          </a>
        </section>
        <section className="profile-card soul-card">
          <div className="aside-heading">
            <Icon name="bell" size={20} />
            <h2>Notifications</h2>
          </div>
          <p>See what's happened since you've been away.</p>
          <a className="button button-soft" href="#notifications">
            Open <Icon name="arrow" size={17} />
          </a>
        </section>
        <section className="profile-card">
          <div className="aside-heading">
            <Icon name="sun" size={20} />
            <h2>Appearance</h2>
          </div>
          <p>Choose Day, Evening, or follow your device.</p>
          <a className="button button-soft" href="#appearance">
            Open <Icon name="arrow" size={17} />
          </a>
        </section>
      </div>

      <button
        className="button-link"
        type="button"
        onClick={() => void app.signOut()}
      >
        {app.isGuest ? 'Reset guest session' : 'Sign out'}
      </button>
    </div>
  );
}
