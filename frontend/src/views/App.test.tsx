import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  usePrototypeController,
  type PrototypeController,
} from "../controllers/usePrototypeController";
import {
  messageNotifications,
  orderedConversations,
} from "../models/messaging";
import type { Screen } from "../models/prototype";
import {
  createDemoMessaging,
  messagingContacts,
} from "../services/prototypeMessages";
import { App } from "./App";

vi.mock("../controllers/usePrototypeController", () => ({
  usePrototypeController: vi.fn(),
}));
vi.mock("../services/supabase", () => ({
  supabase: null,
  avatarUrl: () => null,
}));

function renderAccount(screen: Screen, signedIn: boolean, authLoading = false) {
  const state = createDemoMessaging();
  // Deliberately include fixtures even for signed-out renders: the shell must
  // gate private content regardless of what a controller happens to return.
  vi.mocked(usePrototypeController).mockReturnValue({
    screen,
    profile: signedIn
      ? {
          id: "account",
          name: "Cooper",
          bio: "",
          location: "",
          avatarPath: null,
        }
      : null,
    authLoading,
    accountError: "",
    dialog: null,
    notice: "",
    heroes: [],
    saved: [],
    thanked: [],
    questions: [],
    postRevision: 0,
    lastPostSubmission: null,
    onPostSubmitted: vi.fn(),
    liked: [],
    comments: {},
    filter: "for-you",
    visiblePosts: [],
    favoriteVerse: "",
    appearance: { mode: "system", update: vi.fn() },
    viewedPersonId: "amara",
    viewedPostId: "small-kindness",
    messaging: {
      state,
      conversations: orderedConversations(state),
      notifications: messageNotifications(state),
      selected: state.conversations[0],
      unreadTotal: 2,
      contacts: messagingContacts,
    },
  } as unknown as PrototypeController);
  return renderToStaticMarkup(<App />);
}

beforeEach(() => vi.clearAllMocks());

describe("messaging account access", () => {
  it("provides Explore navigation and an accessible search form to visitors", () => {
    const html = renderAccount("explore", false);
    expect(html).toContain('href="#explore" aria-current="page"');
    expect(html).toContain('role="search"');
    expect(html).toContain('aria-label="Search the community"');
  });

  it("requires an account for Space creation and shows the form after sign-in", () => {
    expect(renderAccount("create-space", false)).toContain("Welcome back.");
    const html = renderAccount("create-space", true);
    expect(html).toContain("Space name");
    expect(html).toContain("Who can join?");
    expect(html).toContain('href="#spaces" aria-current="page"');
    expect(html).not.toContain('href="#profile" aria-current="page"');
  });

  it("shows a private own-posts section on the account profile", () => {
    const html = renderAccount("profile", true);
    expect(html).toContain('aria-label="Your posts"');
    expect(html).toContain("Unpublished posts are visible only to you.");
    expect(html).toContain("Loading…");
  });
  it("hides Messages and the notification bell from signed-out navigation", () => {
    const html = renderAccount("heroes", false);
    expect(html).not.toContain('href="#messages"');
    expect(html).not.toContain('href="#notifications"');
    expect(html).toContain("Log in to message");
    expect(html).toContain('href="#home"');
  });

  it.each(["messages", "chat", "notifications"] as const)(
    "requires sign-in for a direct #%s link",
    (screen) => {
      const html = renderAccount(screen, false);
      expect(html).toContain("Welcome back.");
      expect(html).not.toContain("Marcus Bell");
      expect(html).not.toContain("message-history");
      expect(html).not.toContain("mobile-nav");
    },
  );

  it.each(["messages", "chat", "notifications"] as const)(
    "keeps #%s private while account verification is pending",
    (screen) => {
      const html = renderAccount(screen, false, true);
      expect(html).toContain("Loading your account");
      expect(html).not.toContain("Marcus Bell");
      expect(html).not.toContain('href="#messages"');
    },
  );

  it.each(["messages", "chat", "notifications"] as const)(
    "shows seeded mock content to a signed-in account on #%s",
    (screen) => {
      const html = renderAccount(screen, true);
      expect(html).toContain("Marcus Bell");
      expect(html).toContain('href="#messages"');
      expect(html).not.toContain("Welcome back.");
      expect(html).toContain("Mock");
    },
  );

  it("marks Messages active without also marking Profile active in a chat", () => {
    const html = renderAccount("chat", true);
    expect(html).toContain('href="#messages" aria-current="page"');
    expect(html).not.toContain('href="#profile" aria-current="page"');
  });

  it("keeps the welcome page available to visitors", () => {
    const html = renderAccount("welcome", false);
    expect(html).toContain("landing-shell");
    expect(html).toContain("A dedicated platform for");
  });

  it("does not flash Welcome while an existing account is being verified", () => {
    const html = renderAccount("welcome", false, true);
    expect(html).toContain("Loading your account");
    expect(html).not.toContain("A dedicated platform for");
  });

  it.each(["welcome", "login"] as const)(
    "shows Home for a signed-in member visiting #%s",
    (screen) => {
      const html = renderAccount(screen, true);
      expect(html).toContain('class="composer-prompt"');
      expect(html).not.toContain('href="#welcome"');
      expect(html).toContain('aria-label="Scripture Hero home"');
      expect(html).not.toContain("landing-shell");
    },
  );

  it("requires sign-in for Appearance and makes it accessible from Profile", () => {
    expect(renderAccount("appearance", false)).toContain("Welcome back.");
    expect(renderAccount("appearance", true)).toContain(
      "Make yourself comfortable.",
    );
    expect(renderAccount("profile", true)).toContain('href="#appearance"');
  });

  it.each([
    "blocked-accounts",
    "delete-account",
    "settings-account",
    "invite",
  ] as const)("keeps the main branch’s private #%s route gated", (screen) => {
    const headings = {
      "blocked-accounts": "Blocked accounts.",
      "delete-account": "Delete your account.",
      "settings-account": "Account settings.",
      invite: "Invite friends.",
    };
    expect(renderAccount(screen, false)).toContain("Welcome back.");
    expect(renderAccount(screen, false, true)).toContain(
      "Loading your account",
    );
    expect(renderAccount(screen, true)).toContain(headings[screen]);
  });

  it.each(["about", "help", "terms", "privacy"] as const)(
    "preserves public #%s and sends members back Home",
    (screen) => {
      const visitor = renderAccount(screen, false);
      const member = renderAccount(screen, true);
      expect(visitor).not.toContain("Welcome back.");
      expect(visitor).toContain('href="#welcome"');
      expect(member).not.toContain('href="#welcome"');
      expect(member).toContain('aria-label="Information"');
      expect(member).toContain(`href="#${screen}"`);
    },
  );

  it.each(["public-profile", "post", "report"] as const)(
    "preserves the main branch’s #%s content route",
    (screen) => {
      const html = renderAccount(screen, false);
      expect(html).not.toContain("Welcome back.");
      const headings = {
        "public-profile": "Amara Okafor",
        post: "Sometimes, peace looks like a person.",
        report: "Report this post.",
      };
      expect(html).toContain(headings[screen]);
    },
  );
});
