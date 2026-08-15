import type { Post, PostRepository } from '../models/post.model.js'

const seedPosts: Post[] = [
  {
    id: 'post-1',
    author: { id: 'user-1', displayName: 'Amara', location: 'Accra, Ghana' },
    spaceName: 'Global',
    scriptureReference: 'John 14:27',
    body: 'Peace did not arrive when every question was answered. It arrived when I trusted that Christ was present with me inside the questions.',
    createdAt: '2026-08-14T16:30:00.000Z',
    heroCount: 18,
  },
  {
    id: 'post-2',
    author: { id: 'user-2', displayName: 'Mateo', location: 'Lima, Peru' },
    spaceName: 'Global',
    scriptureReference: 'Mosiah 18:9',
    body: 'This verse reminded me that faith becomes visible when we carry one another’s burdens. Today that looked like listening without rushing to fix anything.',
    createdAt: '2026-08-13T21:10:00.000Z',
    heroCount: 31,
  },
]

export class InMemoryPostRepository implements PostRepository {
  async findFeed(): Promise<Post[]> {
    return structuredClone(seedPosts)
  }
}
