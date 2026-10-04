import { AppError } from '../../shared/errors.js'
import { toPage, type Page, type PageRequest } from '../../shared/pagination.js'
import type { PostRecord, PostRepository } from './model.js'
import type { CreatePostInput } from './schemas.js'

export class PostService {
  constructor(private readonly posts: PostRepository) {}

  async listFeed(query: PageRequest & { authorId?: string }): Promise<Page<PostRecord>> {
    const rows = await this.posts.listGlobal(query)
    return toPage(rows, query.limit, (post) => ({ createdAt: post.createdAt, id: post.id }))
  }

  async publish(authorId: string, input: CreatePostInput): Promise<PostRecord> {
    const post = await this.posts.createGlobal(authorId, {
      title: input.title ?? null,
      body: input.body,
      scriptureReference: input.scriptureReference ?? null,
    })
    if (!post) throw new AppError(409, 'profile_required', 'Finish setting up your profile before sharing.')
    return post
  }
}
