import type { InMemoryDatabase } from '../../shared/in-memory-database.js'
import { sliceCursorPage, type PageRequest } from '../../shared/pagination.js'
import { toPostRecord } from '../posts/in-memory.repository.js'
import type { SavedPostRecord, SavedPostRepository } from './model.js'

export class InMemorySavedPostRepository implements SavedPostRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async save(userId: string, postId: string): Promise<SavedPostRecord | null> {
    const post = this.db.posts.find((p) => p.id === postId && p.status === 'published')
    const record = post ? toPostRecord(this.db, post) : null
    if (!record) return null

    let save = this.db.saves.find((s) => s.userId === userId && s.postId === postId)
    if (!save) {
      save = { userId, postId, createdAt: this.db.now() }
      this.db.saves.push(save)
    }
    return { post: record, savedAt: save.createdAt }
  }

  async unsave(userId: string, postId: string): Promise<void> {
    const index = this.db.saves.findIndex((s) => s.userId === userId && s.postId === postId)
    if (index >= 0) this.db.saves.splice(index, 1)
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    return this.db.saves.some((s) => s.userId === userId && s.postId === postId)
  }

  async list(userId: string, query: PageRequest): Promise<SavedPostRecord[]> {
    const rows = this.db.saves
      .filter((s) => s.userId === userId)
      .flatMap((s) => {
        const post = this.db.posts.find((p) => p.id === s.postId && p.status === 'published')
        const record = post ? toPostRecord(this.db, post) : null
        return record ? [{ post: record, savedAt: s.createdAt }] : []
      })
    return sliceCursorPage(rows, (r) => ({ createdAt: r.savedAt, id: r.post.id }), query, 'desc')
  }
}
