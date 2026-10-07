import type { PageRequest } from '../../shared/pagination.js'
import { GLOBAL_SPACE_ID, keysetFilter, normalizeTimestamp, unwrap, type ClientSource } from '../../shared/supabase.js'
import type { NewPost, PostRecord, PostRepository } from './model.js'

export const POST_COLUMNS =
  'id, title, body, scripture_reference, created_at, author:profiles!posts_author_id_fkey(id, display_name)'

export interface PostRow {
  id: string
  title: string | null
  body: string
  scripture_reference: string | null
  created_at: string
  author: { id: string; display_name: string } | null
}

export function fromPostRow(row: PostRow): PostRecord | null {
  if (!row.author) return null
  return {
    id: row.id,
    author: { id: row.author.id, displayName: row.author.display_name },
    title: row.title,
    body: row.body,
    scriptureReference: row.scripture_reference,
    createdAt: normalizeTimestamp(row.created_at),
  }
}

export class SupabasePostRepository implements PostRepository {
  constructor(private readonly source: ClientSource) {}

  private get client() {
    return this.source.current()
  }

  async listGlobal(query: PageRequest & { authorId?: string }): Promise<PostRecord[]> {
    let request = this.client
      .from('posts')
      .select(POST_COLUMNS)
      .eq('space_id', GLOBAL_SPACE_ID)
      .eq('status', 'published')
    if (query.authorId) request = request.eq('author_id', query.authorId)
    if (query.cursor) request = request.or(keysetFilter(query.cursor, 'desc', 'created_at', 'id'))

    const rows = unwrap(
      await request.order('created_at', { ascending: false }).order('id', { ascending: false }).limit(query.limit + 1),
      'List posts',
    ) as unknown as PostRow[]
    return rows.flatMap((row) => fromPostRow(row) ?? [])
  }

  async createGlobal(authorId: string, post: NewPost): Promise<PostRecord | null> {
    const result = await this.client
      .from('posts')
      .insert({
        author_id: authorId,
        space_id: GLOBAL_SPACE_ID,
        title: post.title,
        body: post.body,
        scripture_reference: post.scriptureReference,
      })
      .select(POST_COLUMNS)
      .single()
    if (result.error?.code === '23503') return null // author has no profile row
    return fromPostRow(unwrap(result, 'Create post') as unknown as PostRow)
  }

  async findPublishedGlobal(id: string): Promise<PostRecord | null> {
    const result = await this.client
      .from('posts')
      .select(POST_COLUMNS)
      .eq('id', id)
      .eq('space_id', GLOBAL_SPACE_ID)
      .eq('status', 'published')
      .maybeSingle()
    if (result.error) throw new Error(`Find post failed (${result.error.code ?? 'unknown'})`)
    return result.data ? fromPostRow(result.data as unknown as PostRow) : null
  }
}
