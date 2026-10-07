import type { PageRequest } from '../../shared/pagination.js'
import type { PostRecord } from '../posts/model.js'

// A save is just (user, post). It never references a Soul Question and is never
// visible to the post's author.
export interface SavedPostRecord {
  post: PostRecord
  savedAt: string
}

export interface SavedPostRepository {
  /** Idempotent: saving twice keeps the original `savedAt`. */
  save(userId: string, postId: string): Promise<SavedPostRecord | null>
  unsave(userId: string, postId: string): Promise<void>
  isSaved(userId: string, postId: string): Promise<boolean>
  /** The caller's saves of currently published posts, newest save first. Up to `limit + 1` rows. */
  list(userId: string, query: PageRequest): Promise<SavedPostRecord[]>
}
