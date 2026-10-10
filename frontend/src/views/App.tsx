import { LandingPage } from "./LandingPage";
import { Login } from "./Login";
import { ProfilePage } from "./ProfilePage";
import { ProfileEditPage } from "./ProfileEditPage";
import { SoulQuestionsPage } from "./SoulQuestionsPage";
import { SettingsPrivacyPage } from "./SettingsPrivacyPage";
import { NotificationsPage } from "./NotificationsPage";
import { NotificationSettingsPage } from "./NotificationSettingsPage";
import { PublicProfilePage } from "./PublicProfilePage";
import { AboutPage } from "./AboutPage";
import { HelpPage } from "./HelpPage";
import { TermsPage } from "./TermsPage";
import { PrivacyPage } from "./PrivacyPage";
import { BlockedAccountsPage } from "./BlockedAccountsPage";
import { DeleteAccountPage } from "./DeleteAccountPage";
import { AppearancePage } from "./AppearancePage";
import { PostDetailPage } from "./PostDetailPage";
import { ReportPostPage } from "./ReportPostPage";
import { SettingsAccountPage } from "./SettingsAccountPage";
import { InviteFriendsPage } from "./InviteFriendsPage";
import { MessagesPage } from "./MessagesPage";
import { Logo } from "./components/Logo";
import { Icon, type IconName } from "./components/Icon";
import { HomePage } from "./HomePage";
import { HeroesPage } from "./HeroesPage";
import { SpacesPage } from "./SpacesPage";
import { QuestionsLibraryPage } from "./QuestionsLibraryPage";
import { PrototypeModal } from "./components/PrototypeModal";
import { usePrototypeController } from "../controllers/usePrototypeController";
import type { Screen } from "../models/prototype";
import { avatarUrl } from "../services/supabase";

const PRIVATE_SCREENS: Screen[] = [
  "profile",
  "profile-edit",
  "questions",
  "settings-privacy",
  "notifications",
  "notification-settings",
  "blocked-accounts",
  "delete-account",
  "appearance",
  "settings-account",
  "invite",
  "messages",
];

export function App() {
  const app = usePrototypeController();
  const welcome = app.screen === "welcome";
  const privateRoute = PRIVATE_SCREENS.includes(app.screen);
  const login =
    (app.screen === "login" && !app.profile) ||
    (privateRoute && !app.profile && !app.authLoading);
  const loading = privateRoute && !app.profile && app.authLoading;
  const navigation: { screen: Screen; label: string; icon: IconName }[] = [
    { screen: "welcome", label: "Welcome", icon: "globe" },
    { screen: "home", label: "Home", icon: "home" },
    { screen: "spaces", label: "Spaces", icon: "grid" },
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
    (screen === "profile" && PRIVATE_SCREENS.includes(app.screen));
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
          <div className="header-actions">
          <a
            className="icon-button header-bell"
            href="#notifications"
            aria-label="Open notifications"
          >
            <Icon name="bell" size={20} />
          </a>
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
          </div>
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
            ) : app.screen === "spaces" ? (
              <SpacesPage app={app} />
            ) : app.screen === "heroes" ? (
              <HeroesPage app={app} />
            ) : app.screen === "library" ? (
              <QuestionsLibraryPage app={app} />
            ) : app.screen === "questions" && app.profile ? (
              <SoulQuestionsPage app={app} />
            ) : app.screen === "profile-edit" && app.profile ? (
              <ProfileEditPage app={app} />
            ) : app.screen === "settings-privacy" && app.profile ? (
              <SettingsPrivacyPage app={app} />
            ) : app.screen === "notifications" && app.profile ? (
              <NotificationsPage app={app} />
            ) : app.screen === "notification-settings" && app.profile ? (
              <NotificationSettingsPage app={app} />
            ) : app.screen === "blocked-accounts" && app.profile ? (
              <BlockedAccountsPage />
            ) : app.screen === "delete-account" && app.profile ? (
              <DeleteAccountPage app={app} />
            ) : app.screen === "appearance" && app.profile ? (
              <AppearancePage app={app} />
            ) : app.screen === "settings-account" && app.profile ? (
              <SettingsAccountPage app={app} />
            ) : app.screen === "invite" && app.profile ? (
              <InviteFriendsPage />
            ) : app.screen === "messages" && app.profile ? (
              <MessagesPage app={app} />
            ) : app.screen === "public-profile" ? (
              <PublicProfilePage app={app} />
            ) : app.screen === "post" ? (
              <PostDetailPage app={app} />
            ) : app.screen === "report" ? (
              <ReportPostPage app={app} />
            ) : app.screen === "about" ? (
              <AboutPage />
            ) : app.screen === "help" ? (
              <HelpPage />
            ) : app.screen === "terms" ? (
              <TermsPage />
            ) : app.screen === "privacy" ? (
              <PrivacyPage />
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
          className={`mobile-nav mobile-nav-${navigation.length}`}
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
