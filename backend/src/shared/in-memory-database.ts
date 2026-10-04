// Stand-in for the Supabase tables in the Monday migration, shared by the
// in-memory repositories so saves, posts, and conversations see the same data.
// Every post here lives in the Global Space.

export interface StoredProfile {
  id: string
  displayName: string
}

export interface StoredPost {
  id: string
  authorId: string
  title: string | null
  body: string
  scriptureReference: string | null
  status: 'published' | 'hidden'
  createdAt: string
}

export interface StoredSave {
  userId: string
  postId: string
  createdAt: string
}

export interface StoredConversation {
  id: string
  initiatorId: string
  heroId: string
  originPostId: string
  createdAt: string
}

export interface StoredMessage {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export class InMemoryDatabase {
  readonly profiles = new Map<string, StoredProfile>()
  readonly posts: StoredPost[] = []
  readonly saves: StoredSave[] = []
  readonly conversations: StoredConversation[] = []
  readonly messages: StoredMessage[] = []

  constructor(private readonly clock: () => Date = () => new Date()) {}

  now(): string {
    return this.clock().toISOString()
  }

  addProfile(id: string, displayName: string): StoredProfile {
    const profile = { id, displayName }
    this.profiles.set(id, profile)
    return profile
  }
}
