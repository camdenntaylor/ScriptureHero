export interface PostAuthor {
  id: string
  displayName: string
  location: string
}

export interface Post {
  id: string
  author: PostAuthor
  spaceName: string
  scriptureReference: string
  body: string
  createdAt: string
  heroCount: number
}

export interface PostRepository {
  findFeed(): Promise<Post[]>
}
