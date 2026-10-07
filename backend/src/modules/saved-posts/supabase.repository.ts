import type { PageRequest } from '../../shared/pagination.js'
import { GLOBAL_SPACE_ID, keysetFilter, normalizeTimestamp, unwrap, type ClientSource } from '../../shared/supabase.js'
import { POST_COLUMNS, SupabasePostRepository, fromPostRow, type PostRow } from '../posts/supabase.repository.js'
import type { SavedPostRecord, SavedPostRepository } from './model.js'

interface SaveRow {
  created_at: string
  post_id: string
  posts: PostRow
}

export class SupabaseSavedPostRepository implements SavedPostRepository {
  private readonly posts: SupabasePostRepository

  constructor(private readonly source: ClientSource) {
    this.posts = new SupabasePostRepository(source)
  }

  private get client() {
    return this.source.current()
  }

  async save(userId: string, postId: string): Promise<SavedPostRecord | null> {
    const post = await this.posts.findPublishedGlobal(postId)
    if (!post) return null

    // Saving twice keeps the original row (and its savedAt).
    unwrap(
      await this.client
        .from('saved_posts')
        .upsert({ user_id: userId, post_id: postId }, { onConflict: 'user_id,post_id', ignoreDuplicates: true })
        .select(),
      'Save post',
    )
    const row = unwrap(
      await this.client.from('saved_posts').select('created_at').eq('user_id', userId).eq('post_id', postId).single(),
      'Read save',
    )
    return { post, savedAt: normalizeTimestamp((row as unknown as { created_at: string }).created_at) }
  }

  async unsave(userId: string, postId: string): Promise<void> {
    const { error } = await this.client.from('saved_posts').delete().eq('user_id', userId).eq('post_id', postId)
    if (error) throw new Error(`Unsave post failed (${error.code ?? 'unknown'})`)
  }

  async isSaved(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('saved_posts')
      .select('post_id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle()
    if (error) throw new Error(`Check save failed (${error.code ?? 'unknown'})`)
    return data !== null
  }

  async list(userId: string, query: PageRequest): Promise<SavedPostRecord[]> {
    let request = this.client
      .from('saved_posts')
      .select(`created_at, post_id, posts!inner(${POST_COLUMNS})`)
      .eq('user_id', userId)
      .eq('posts.space_id', GLOBAL_SPACE_ID)
      .eq('posts.status', 'published')
    if (query.cursor) request = request.or(keysetFilter(query.cursor, 'desc', 'created_at', 'post_id'))

    const rows = unwrap(
      await request.order('created_at', { ascending: false }).order('post_id', { ascending: false }).limit(query.limit + 1),
      'List saved posts',
    ) as unknown as SaveRow[]

    return rows.flatMap((row) => {
      const post = fromPostRow(row.posts)
      return post ? [{ post, savedAt: normalizeTimestamp(row.created_at) }] : []
    })
  }
}
