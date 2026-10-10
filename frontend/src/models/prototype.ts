export type Screen =
  | "welcome"
  | "home"
  | "heroes"
  | "login"
  | "profile"
  | "questions"
  | "spaces"
  | "library"
  | "profile-edit"
  | "settings-privacy"
  | "notifications"
  | "notification-settings"
  | "public-profile"
  | "about"
  | "help"
  | "terms"
  | "privacy"
  | "blocked-accounts"
  | "delete-account"
  | "appearance";
export type FeedFilter = "for-you" | "saved" | "topics";
export interface Person {
  id: string;
  name: string;
  location: string;
  initials: string;
  color: "clay" | "sage" | "gold" | "lilac";
}
export interface Insight {
  id: string;
  author: Person;
  title: string;
  body: string;
  scripture: string;
  verse: string;
  time: string;
  likes: number;
  comments: { name: string; body: string }[];
  video?: string;
  topics: string[];
}
export interface Space {
  id: string;
  name: string;
  kind: string;
  description: string;
  memberCount: number;
  joinedByDefault: boolean;
}
export interface SoulQuestion {
  id: string;
  title: string;
  label: string;
}
export interface SavedInsight {
  postId: string;
  questionId: string;
}
export interface Appreciation {
  person: Person;
  quote: string;
  postTitle: string;
}

export function addToHelplist(
  saved: SavedInsight[],
  postId: string,
  questionId: string,
): SavedInsight[] {
  return saved.some(
    (item) => item.postId === postId && item.questionId === questionId,
  )
    ? saved
    : [...saved, { postId, questionId }];
}

export function getHeroes(posts: Insight[], saved: SavedInsight[]): Person[] {
  const savedIds = new Set(saved.map((item) => item.postId));
  return [
    ...new Map(
      posts
        .filter((post) => savedIds.has(post.id))
        .map((post) => [post.author.id, post.author]),
    ).values(),
  ];
}

/** No private question or matching fields belong in a share payload. */
export function publicShareText(post: Insight): string {
  return `${post.title}\n\n${post.body}\n\n${post.scripture}\n— ${post.author.name}, Scripture Hero`;
}

const HASH_SCREENS: Record<string, Screen> = {
  "#home": "home",
  "#heroes": "heroes",
  "#login": "login",
  "#profile": "profile",
  "#questions": "questions",
  "#spaces": "spaces",
  "#library": "library",
  "#profile-edit": "profile-edit",
  "#settings-privacy": "settings-privacy",
  "#notifications": "notifications",
  "#notification-settings": "notification-settings",
  "#public-profile": "public-profile",
  "#about": "about",
  "#help": "help",
  "#terms": "terms",
  "#privacy": "privacy",
  "#blocked-accounts": "blocked-accounts",
  "#delete-account": "delete-account",
  "#appearance": "appearance",
}

export function screenFromHash(hash: string): Screen {
  return HASH_SCREENS[hash] ?? "welcome"
}
