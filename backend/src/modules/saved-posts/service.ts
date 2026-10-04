import { notFound } from '../../shared/errors.js'
import { toPage, type Page, type PageRequest } from '../../shared/pagination.js'
import type { SavedPostRecord, SavedPostRepository } from './model.js'

export class SavedPostService {
  constructor(private readonly saves: SavedPostRepository) {}

  async save(userId: string, postId: string): Promise<SavedPostRecord> {
    const saved = await this.saves.save(userId, postId)
    if (!saved) throw notFound('We could not find that post.')
    return saved
  }

  unsave(userId: string, postId: string): Promise<void> {
    return this.saves.unsave(userId, postId)
  }

  async list(userId: string, query: PageRequest): Promise<Page<SavedPostRecord>> {
    const rows = await this.saves.list(userId, query)
    return toPage(rows, query.limit, (row) => ({ createdAt: row.savedAt, id: row.post.id }))
  }
}
