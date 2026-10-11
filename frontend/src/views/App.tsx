import { LandingPage } from "./LandingPage";
import { Login } from "./Login";
import { ProfilePage } from "./ProfilePage";
import { ProfileEditPage } from "./ProfileEditPage";
import { SoulQuestionsPage } from "./SoulQuestionsPage";
import { SettingsPrivacyPage } from "./SettingsPrivacyPage";
import { NotificationsPage } from "./NotificationsPage";
import { NotificationSettingsPage } from "./NotificationSettingsPage";
import { AppearancePage } from "./AppearancePage";
import { MessagesPage } from "./MessagesPage";
import { ConversationPage } from "./ConversationPage";
import { PublicProfilePage } from "./PublicProfilePage";
import { AboutPage } from "./AboutPage";
import { HelpPage } from "./HelpPage";
import { TermsPage } from "./TermsPage";
import { PrivacyPage } from "./PrivacyPage";
import { BlockedAccountsPage } from "./BlockedAccountsPage";
import { DeleteAccountPage } from "./DeleteAccountPage";
import { PostDetailPage } from "./PostDetailPage";
import { ReportPostPage } from "./ReportPostPage";
import { SettingsAccountPage } from "./SettingsAccountPage";
import { InviteFriendsPage } from "./InviteFriendsPage";
import { Logo } from "./components/Logo";
import { Icon, type IconName } from "./components/Icon";
import { HomePage } from "./HomePage";
import { HeroesPage } from "./HeroesPage";
import { SpacesPage } from "./SpacesPage";
import { QuestionsLibraryPage } from "./QuestionsLibraryPage";
import { PrototypeModal } from "./components/PrototypeModal";
import { usePrototypeController } from "../controllers/usePrototypeController";
import { screenForAccount, type Screen } from "../models/prototype";
import { avatarUrl } from "../services/supabase";

const PRIVATE_SCREENS: Screen[] = [
  "profile",
  "profile-edit",
  "questions",
  "settings-privacy",
  "appearance",
  "messages",
  "chat",
  "notifications",
  "notification-settings",
  "blocked-accounts",
  "delete-account",
  "settings-account",
  "invite",
];

export function App() {
  const app = usePrototypeController();
  const screen = screenForAccount(app.screen, Boolean(app.profile));
  const welcome = screen === "welcome" && !app.authLoading;
  const privateRoute = PRIVATE_SCREENS.includes(screen);
  const login =
    (screen === "login" && !app.profile) ||
    (privateRoute && !app.profile && !app.authLoading);
  const loading = (privateRoute || screen === "welcome") && !app.profile && app.authLoading;
  const navigation: { screen: Screen; label: string; icon: IconName }[] = [
    ...(!app.profile && !app.authLoading ? [{ screen: "welcome" as const, label: "Welcome", icon: "globe" as const }] : []),
    { screen: "home", label: "Home", icon: "home" },
    { screen: "spaces", label: "Spaces", icon: "grid" },
    { screen: "heroes", label: "Scripture Heroes", icon: "heart" },
    ...(app.profile
      ? [
          {
            screen: "messages" as const,
            label: "Messages",
            icon: "message" as const,
          },
          {
            screen: "profile" as const,
            label: "Profile",
            icon: "people" as const,
          },
        ]
      : []),
  ];
  const active = (destination: Screen) =>
    screen === destination ||
    (destination === "profile" && PRIVATE_SCREENS.includes(screen) && !["messages", "chat", "notifications"].includes(screen)) ||
    (destination === "messages" && ["chat", "notifications"].includes(screen));
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
          href={app.profile ? '#home' : '#welcome'}
          aria-label={app.profile ? 'Scripture Hero home' : 'Scripture Hero welcome'}
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
            {app.messaging.unreadTotal > 0 && <span className="header-unread" aria-hidden="true" />}
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
          <a className="button button-outline" href="#login">Log in</a>
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
            {screen === "home" ? (
              <HomePage app={app} />
            ) : screen === "spaces" ? (
              <SpacesPage app={app} />
            ) : screen === "heroes" ? (
              <HeroesPage app={app} />
            ) : screen === "library" ? (
              <QuestionsLibraryPage app={app} />
            ) : screen === "questions" && app.profile ? (
              <SoulQuestionsPage app={app} />
            ) : screen === "profile-edit" && app.profile ? (
              <ProfileEditPage app={app} />
            ) : screen === "settings-privacy" && app.profile ? (
              <SettingsPrivacyPage app={app} />
            ) : screen === "appearance" && app.profile ? (
              <AppearancePage app={app} />
            ) : screen === "messages" ? (
              <MessagesPage app={app} />
            ) : screen === "chat" ? (
              <ConversationPage key={app.messaging.selected?.id ?? 'empty'} app={app} />
            ) : screen === "notifications" ? (
              <NotificationsPage app={app} />
            ) : screen === "notification-settings" && app.profile ? (
              <NotificationSettingsPage app={app} />
            ) : screen === "blocked-accounts" && app.profile ? (
              <BlockedAccountsPage />
            ) : screen === "delete-account" && app.profile ? (
              <DeleteAccountPage app={app} />
            ) : screen === "settings-account" && app.profile ? (
              <SettingsAccountPage app={app} />
            ) : screen === "invite" && app.profile ? (
              <InviteFriendsPage />
            ) : screen === "public-profile" ? (
              <PublicProfilePage app={app} />
            ) : screen === "post" ? (
              <PostDetailPage app={app} />
            ) : screen === "report" ? (
              <ReportPostPage app={app} />
            ) : screen === "about" ? (
              <AboutPage signedIn={Boolean(app.profile)} />
            ) : screen === "help" ? (
              <HelpPage signedIn={Boolean(app.profile)} />
            ) : screen === "terms" ? (
              <TermsPage signedIn={Boolean(app.profile)} />
            ) : screen === "privacy" ? (
              <PrivacyPage signedIn={Boolean(app.profile)} />
            ) : app.profile ? (
              <ProfilePage app={app} />
            ) : (
              <HomePage app={app} />
            )}
            {app.profile && <footer className="community-footer">
              <nav className="footer-links" aria-label="Information">
                <a href="#about">About</a>
                <a href="#help">Help</a>
                <a href="#terms">Terms</a>
                <a href="#privacy">Privacy</a>
              </nav>
            </footer>}
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
      {app.dialog && (app.dialog.type !== 'message' || app.profile) && <PrototypeModal key={app.dialog.type} app={app} />}
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
