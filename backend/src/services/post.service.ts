import type { Post, PostRepository } from '../models/post.model.js'

export class PostService {
  constructor(private readonly posts: PostRepository) {}

  async getFeed(): Promise<Post[]> {
    return this.posts.findFeed()
  }
}
