import { LandingPage } from "./LandingPage";
import { Login } from "./Login";
import { ProfilePage } from "./ProfilePage";
import { SoulQuestionsPage } from "./SoulQuestionsPage";
import { Logo } from "./components/Logo";
import { Icon, type IconName } from "./components/Icon";
import { HomePage } from "./HomePage";
import { HeroesPage } from "./HeroesPage";
import { PrototypeModal } from "./components/PrototypeModal";
import { OnboardingModal } from "./components/OnboardingModal";
import { usePrototypeController } from "../controllers/usePrototypeController";
import type { Screen } from "../models/prototype";
import { avatarUrl } from "../services/supabase";

export function App() {
  const app = usePrototypeController();
  const welcome = app.screen === "welcome";
  const privateRoute = app.screen === "profile" || app.screen === "questions";
  const login =
    (app.screen === "login" && !app.profile) ||
    (privateRoute && !app.profile && !app.authLoading);
  const loading = privateRoute && !app.profile && app.authLoading;
  const navigation: { screen: Screen; label: string; icon: IconName }[] = [
    { screen: "welcome", label: "Welcome", icon: "globe" },
    { screen: "home", label: "Home", icon: "home" },
    { screen: "heroes", label: "Scripture Heroes", icon: "heart" },
    ...(app.profile
      ? [
          {
            screen: "profile" as const,
            label: "Profile",
            icon: "people" as const,
          },
        ]
      : []),
  ];
  const active = (screen: Screen) =>
    app.screen === screen ||
    (screen === "profile" && app.screen === "questions");
  const initials = app.profile?.name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`app-shell ${welcome ? "landing-shell" : login ? "account-shell" : "community-shell"}`}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <a
          className="brand"
          href="#welcome"
          aria-label="Scripture Hero welcome"
        >
          <Logo />
          <span>Scripture Hero</span>
        </a>
        {welcome ? (
          <>
            <nav className="landing-nav" aria-label="Main navigation">
              <a href="#home">The community</a>
              <a href="#heroes">Scripture Heroes</a>
            </nav>
            <a
              className="button button-outline"
              href={app.profile ? "#profile" : "#login"}
            >
              {app.profile ? "Your profile" : "Log in"}
            </a>
          </>
        ) : app.profile ? (
          <a
            className="demo-profile"
            href="#profile"
            aria-label="Open your profile"
          >
            <div>
              <strong>{app.profile.name}</strong>
              <span>Your account</span>
            </div>
            {avatarUrl(app.profile.avatarPath) ? (
              <img
                className="header-photo"
                src={avatarUrl(app.profile.avatarPath)!}
                alt=""
              />
            ) : (
              <span className="avatar avatar-gold" aria-hidden="true">
                {initials}
              </span>
            )}
          </a>
        ) : (
          <a className="button button-outline" href="#login">
            Log in
          </a>
        )}
      </header>

      {welcome ? (
        <LandingPage />
      ) : login ? (
        <Login app={app} />
      ) : loading ? (
        <main id="main-content" className="account-main" tabIndex={-1}>
          <p role="status">Loading your account…</p>
        </main>
      ) : (
        <div className="workspace">
          <aside className="workspace-sidebar">
            <p className="sidebar-label">YOUR LITTLE CORNER</p>
            <nav className="side-nav" aria-label="Main navigation">
              {navigation.map((item) => (
                <a
                  href={`#${item.screen}`}
                  key={item.screen}
                  aria-current={active(item.screen) ? "page" : undefined}
                >
                  <Icon name={item.icon} />
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          <main id="main-content" className="workspace-main" tabIndex={-1}>
            {app.screen === "home" ? (
              <HomePage app={app} />
            ) : app.screen === "heroes" ? (
              <HeroesPage app={app} />
            ) : app.screen === "questions" && app.profile ? (
              <SoulQuestionsPage app={app} />
            ) : app.profile ? (
              <ProfilePage app={app} />
            ) : (
              <HomePage app={app} />
            )}
          </main>
        </div>
      )}
      {!welcome && !login && !loading && (
        <nav
          className={`mobile-nav${app.profile ? " mobile-nav-four" : ""}`}
          aria-label="Mobile navigation"
        >
          {navigation.map((item) => (
            <a
              href={`#${item.screen}`}
              key={item.screen}
              aria-current={active(item.screen) ? "page" : undefined}
            >
              <Icon name={item.icon} size={21} />
              <span>{item.screen === "heroes" ? "Heroes" : item.label}</span>
            </a>
          ))}
        </nav>
      )}
      <OnboardingModal />
      {app.dialog && <PrototypeModal key={app.dialog.type} app={app} />}
      <div className="toast-region" aria-live="polite" aria-atomic="true">
        {app.notice && (
          <div className="toast">
            <Icon name="check" size={18} />
            <span>{app.notice}</span>
            <button
              className="icon-button"
              onClick={() => app.setNotice("")}
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={17} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
