import type { PageRequest } from '../../shared/pagination.js'

// Only public profile fields ever travel with a post.
export interface PublicProfile {
  id: string
  displayName: string
}

export interface PostRecord {
  id: string
  author: PublicProfile
  title: string | null
  body: string
  scriptureReference: string | null
  createdAt: string
}

export interface NewPost {
  title: string | null
  body: string
  scriptureReference: string | null
}

export interface PostRepository {
  /** Published Global posts, newest first. Returns up to `limit + 1` rows. */
  listGlobal(query: PageRequest & { authorId?: string }): Promise<PostRecord[]>
  /** Publishes immediately (prototype exception). Null when the author has no profile. */
  createGlobal(authorId: string, post: NewPost): Promise<PostRecord | null>
  findPublishedGlobal(id: string): Promise<PostRecord | null>
}
