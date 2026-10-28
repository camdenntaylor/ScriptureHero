// Stand-in for the Supabase tables in the Monday migration, shared by the
// in-memory repositories so saves, posts, and conversations see the same data.
// Every post here lives in the Global Space.

import type { Space } from "@scripture-hero/contracts";
import { GLOBAL_SPACE_ID } from "./supabase.js";

export interface StoredProfile {
  id: string;
  displayName: string;
  createdAt?: string;
}

export interface StoredPost {
  id: string;
  authorId: string;
  title: string | null;
  body: string;
  scriptureReference: string | null;
  status:
    | "draft"
    | "pending_moderation"
    | "needs_review"
    | "published"
    | "rejected"
    | "hidden";
  spaceId?: string;
  createdAt: string;
}

export interface StoredSave {
  userId: string;
  postId: string;
  createdAt: string;
}

export interface StoredConversation {
  id: string;
  initiatorId: string;
  heroId: string;
  originPostId: string;
  createdAt: string;
}

export interface StoredMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export class InMemoryDatabase {
  readonly spaces = new Map<string, Space>([
    [
      GLOBAL_SPACE_ID,
      {
        id: GLOBAL_SPACE_ID,
        name: "Global",
        description: "A place for everyone to share uplifting insights.",
        visibility: "public",
        ownerId: null,
        createdAt: "2026-10-01T00:00:00Z",
        membership: "none",
      },
    ],
  ]);
  readonly memberships = new Map<
    string,
    {
      spaceId: string;
      userId: string;
      status: "active" | "requested" | "invited";
      createdAt: string;
    }
  >();
  readonly profiles = new Map<string, StoredProfile>();
  readonly posts: StoredPost[] = [];
  readonly saves: StoredSave[] = [];
  readonly conversations: StoredConversation[] = [];
  readonly messages: StoredMessage[] = [];

  constructor(private readonly clock: () => Date = () => new Date()) {}

  now(): string {
    return this.clock().toISOString();
  }

  addProfile(id: string, displayName: string): StoredProfile {
    const profile = { id, displayName, createdAt: this.now() };
    this.profiles.set(id, profile);
    return profile;
  }
}
