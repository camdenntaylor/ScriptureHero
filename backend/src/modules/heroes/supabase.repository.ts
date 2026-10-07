import { compareCursors, sliceCursorPage, type Cursor, type PageRequest } from '../../shared/pagination.js'
import { GLOBAL_SPACE_ID, keysetFilter, normalizeTimestamp, unwrap, type ClientSource } from '../../shared/supabase.js'
import type { PublicProfile } from '../posts/model.js'
import type { ConversationRecord, HeroRepository, HeroSummary, MessageRecord } from './model.js'

// Heroes are derived from a user's most recent saves. This keeps the query
// bounded for the prototype; a user with more saves than this sees their latest.
const HERO_SAVE_WINDOW = 500

interface ConversationRow {
  id: string
  origin_post_id: string
  initiator_id: string
  hero_id: string
  created_at: string
}

interface MessageRow {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

interface HeroSaveRow {
  created_at: string
  post_id: string
  posts: {
    id: string
    title: string | null
    scripture_reference: string | null
    author: { id: string; display_name: string } | null
  }
}

const CONVERSATION_COLUMNS = 'id, origin_post_id, initiator_id, hero_id, created_at'
const MESSAGE_COLUMNS = 'id, conversation_id, sender_id, body, created_at'

export class SupabaseHeroRepository implements HeroRepository {
  constructor(private readonly source: ClientSource) {}

  private get client() {
    return this.source.current()
  }

  private async loadProfiles(ids: string[]): Promise<Map<string, PublicProfile>> {
    const unique = [...new Set(ids)]
    if (unique.length === 0) return new Map()
    const rows = unwrap(
      await this.client.from('profiles').select('id, display_name').in('id', unique),
      'Load profiles',
    ) as unknown as { id: string; display_name: string }[]
    return new Map(rows.map((row) => [row.id, { id: row.id, displayName: row.display_name }]))
  }

  private async toConversations(rows: ConversationRow[]): Promise<ConversationRecord[]> {
    const profiles = await this.loadProfiles(rows.flatMap((row) => [row.initiator_id, row.hero_id]))
    const profile = (id: string): PublicProfile => profiles.get(id) ?? { id, displayName: 'Scripture Hero' }
    return rows.map((row) => ({
      id: row.id,
      originPostId: row.origin_post_id,
      initiator: profile(row.initiator_id),
      hero: profile(row.hero_id),
      createdAt: normalizeTimestamp(row.created_at),
    }))
  }

  async listHeroes(userId: string, query: PageRequest): Promise<HeroSummary[]> {
    const saves = unwrap(
      await this.client
        .from('saved_posts')
        .select(
          'created_at, post_id, posts!inner(id, title, scripture_reference, author:profiles!posts_author_id_fkey(id, display_name))',
        )
        .eq('user_id', userId)
        .eq('posts.space_id', GLOBAL_SPACE_ID)
        .eq('posts.status', 'published')
        .order('created_at', { ascending: false })
        .limit(HERO_SAVE_WINDOW),
      'List hero saves',
    ) as unknown as HeroSaveRow[]

    const conversations = unwrap(
      await this.client.from('hero_conversations').select('id, origin_post_id').eq('initiator_id', userId),
      'List hero conversations',
    ) as unknown as { id: string; origin_post_id: string }[]
    const conversationByPost = new Map(conversations.map((c) => [c.origin_post_id, c.id]))

    // Saves arrive newest first, so the first save seen for an author is their latest.
    const byHero = new Map<string, HeroSummary>()
    for (const save of saves) {
      const author = save.posts.author
      if (!author || author.id === userId) continue

      const existing = byHero.get(author.id)
      if (existing) {
        existing.savedPostCount += 1
        continue
      }
      byHero.set(author.id, {
        hero: { id: author.id, displayName: author.display_name },
        lastSavedAt: normalizeTimestamp(save.created_at),
        savedPostCount: 1,
        latestSavedPost: {
          id: save.posts.id,
          title: save.posts.title,
          scriptureReference: save.posts.scripture_reference,
          conversationId: conversationByPost.get(save.posts.id) ?? null,
        },
      })
    }

    return sliceCursorPage([...byHero.values()], (e) => ({ createdAt: e.lastSavedAt, id: e.hero.id }), query, 'desc')
  }

  async findOrCreateConversation(initiatorId: string, heroId: string, originPostId: string) {
    const find = async () => {
      const result = await this.client
        .from('hero_conversations')
        .select(CONVERSATION_COLUMNS)
        .eq('initiator_id', initiatorId)
        .eq('origin_post_id', originPostId)
        .maybeSingle()
      if (result.error) throw new Error(`Find conversation failed (${result.error.code ?? 'unknown'})`)
      return result.data as unknown as ConversationRow | null
    }

    const existing = await find()
    if (existing) return { conversation: (await this.toConversations([existing]))[0]!, created: false }

    const inserted = await this.client
      .from('hero_conversations')
      .insert({ initiator_id: initiatorId, hero_id: heroId, origin_post_id: originPostId })
      .select(CONVERSATION_COLUMNS)
      .single()

    if (inserted.error?.code === '23505') {
      // A retry or double-tap created it first; return that one.
      const raced = await find()
      return raced ? { conversation: (await this.toConversations([raced]))[0]!, created: false } : null
    }
    const row = unwrap(inserted, 'Create conversation') as unknown as ConversationRow
    return { conversation: (await this.toConversations([row]))[0]!, created: true }
  }

  async listConversations(userId: string, query: PageRequest): Promise<ConversationRecord[]> {
    // One query per role: PostgREST cannot AND an `or` participant filter with an `or` keyset filter.
    const fetchAs = async (column: 'initiator_id' | 'hero_id') => {
      let request = this.client.from('hero_conversations').select(CONVERSATION_COLUMNS).eq(column, userId)
      if (query.cursor) request = request.or(keysetFilter(query.cursor, 'desc', 'created_at', 'id'))
      return unwrap(
        await request.order('created_at', { ascending: false }).order('id', { ascending: false }).limit(query.limit + 1),
        'List conversations',
      ) as unknown as ConversationRow[]
    }

    const [asInitiator, asHero] = await Promise.all([fetchAs('initiator_id'), fetchAs('hero_id')])
    const key = (row: ConversationRow): Cursor => ({ createdAt: normalizeTimestamp(row.created_at), id: row.id })
    const merged = [...asInitiator, ...asHero].sort((a, b) => compareCursors(key(b), key(a))).slice(0, query.limit + 1)
    return this.toConversations(merged)
  }

  async findConversation(id: string): Promise<ConversationRecord | null> {
    const result = await this.client.from('hero_conversations').select(CONVERSATION_COLUMNS).eq('id', id).maybeSingle()
    if (result.error) throw new Error(`Find conversation failed (${result.error.code ?? 'unknown'})`)
    return result.data ? (await this.toConversations([result.data as unknown as ConversationRow]))[0]! : null
  }

  async listMessages(conversationId: string, query: PageRequest): Promise<MessageRecord[]> {
    let request = this.client.from('hero_messages').select(MESSAGE_COLUMNS).eq('conversation_id', conversationId)
    if (query.cursor) request = request.or(keysetFilter(query.cursor, 'asc', 'created_at', 'id'))
    const rows = unwrap(
      await request.order('created_at', { ascending: true }).order('id', { ascending: true }).limit(query.limit + 1),
      'List messages',
    ) as unknown as MessageRow[]
    return rows.map(toMessage)
  }

  async addMessage(conversationId: string, senderId: string, body: string): Promise<MessageRecord> {
    const row = unwrap(
      await this.client
        .from('hero_messages')
        .insert({ conversation_id: conversationId, sender_id: senderId, body })
        .select(MESSAGE_COLUMNS)
        .single(),
      'Send message',
    ) as unknown as MessageRow
    return toMessage(row)
  }
}

function toMessage(row: MessageRow): MessageRecord {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: normalizeTimestamp(row.created_at),
  }
}
