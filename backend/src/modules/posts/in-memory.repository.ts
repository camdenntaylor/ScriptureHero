import { randomUUID } from 'node:crypto'
import type { InMemoryDatabase, StoredPost } from '../../shared/in-memory-database.js'
import { sliceCursorPage, type PageRequest } from '../../shared/pagination.js'
import type { NewPost, PostRecord, PostRepository } from './model.js'

export function toPostRecord(db: InMemoryDatabase, post: StoredPost): PostRecord | null {
  const author = db.profiles.get(post.authorId)
  if (!author) return null
  return {
    id: post.id,
    author: { id: author.id, displayName: author.displayName },
    title: post.title,
    body: post.body,
    scriptureReference: post.scriptureReference,
    createdAt: post.createdAt,
  }
}

export class InMemoryPostRepository implements PostRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  async listGlobal(query: PageRequest & { authorId?: string }): Promise<PostRecord[]> {
    const records = this.db.posts
      .filter((post) => post.status === 'published' && (!query.authorId || post.authorId === query.authorId))
      .flatMap((post) => toPostRecord(this.db, post) ?? [])
    return sliceCursorPage(records, (r) => ({ createdAt: r.createdAt, id: r.id }), query, 'desc')
  }

  async createGlobal(authorId: string, post: NewPost): Promise<PostRecord | null> {
    if (!this.db.profiles.has(authorId)) return null
    const stored: StoredPost = {
      id: randomUUID(),
      authorId,
      ...post,
      status: 'published',
      createdAt: this.db.now(),
    }
    this.db.posts.push(stored)
    return toPostRecord(this.db, stored)
  }

  async findPublishedGlobal(id: string): Promise<PostRecord | null> {
    const stored = this.db.posts.find((post) => post.id === id && post.status === 'published')
    return stored ? toPostRecord(this.db, stored) : null
  }
}
