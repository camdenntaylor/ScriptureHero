import { randomUUID } from 'node:crypto'
import type { InMemoryDatabase, StoredConversation } from '../../shared/in-memory-database.js'
import { sliceCursorPage, type PageRequest } from '../../shared/pagination.js'
import type { PublicProfile } from '../posts/model.js'
import type { ConversationRecord, HeroRepository, HeroSummary, MessageRecord } from './model.js'

export class InMemoryHeroRepository implements HeroRepository {
  constructor(private readonly db: InMemoryDatabase) {}

  private profile(id: string): PublicProfile {
    const stored = this.db.profiles.get(id)
    return { id, displayName: stored?.displayName ?? 'Scripture Hero' }
  }

  private toConversation(stored: StoredConversation): ConversationRecord {
    return {
      id: stored.id,
      originPostId: stored.originPostId,
      initiator: this.profile(stored.initiatorId),
      hero: this.profile(stored.heroId),
      createdAt: stored.createdAt,
    }
  }

  async listHeroes(userId: string, query: PageRequest): Promise<HeroSummary[]> {
    const byHero = new Map<string, HeroSummary>()

    for (const save of this.db.saves.filter((s) => s.userId === userId)) {
      const post = this.db.posts.find((p) => p.id === save.postId && p.status === 'published')
      if (!post || post.authorId === userId) continue

      const existing = byHero.get(post.authorId)
      const isLatest = !existing || save.createdAt > existing.lastSavedAt
      const conversation = this.db.conversations.find(
        (c) => c.initiatorId === userId && c.originPostId === post.id,
      )

      byHero.set(post.authorId, {
        hero: this.profile(post.authorId),
        lastSavedAt: isLatest ? save.createdAt : existing.lastSavedAt,
        savedPostCount: (existing?.savedPostCount ?? 0) + 1,
        latestSavedPost: isLatest
          ? {
              id: post.id,
              title: post.title,
              scriptureReference: post.scriptureReference,
              conversationId: conversation?.id ?? null,
            }
          : existing.latestSavedPost,
      })
    }

    return sliceCursorPage(
      [...byHero.values()],
      (entry) => ({ createdAt: entry.lastSavedAt, id: entry.hero.id }),
      query,
      'desc',
    )
  }

  async findOrCreateConversation(initiatorId: string, heroId: string, originPostId: string) {
    const existing = this.db.conversations.find(
      (c) => c.initiatorId === initiatorId && c.originPostId === originPostId,
    )
    if (existing) return { conversation: this.toConversation(existing), created: false }

    const stored: StoredConversation = {
      id: randomUUID(),
      initiatorId,
      heroId,
      originPostId,
      createdAt: this.db.now(),
    }
    this.db.conversations.push(stored)
    return { conversation: this.toConversation(stored), created: true }
  }

  async listConversations(userId: string, query: PageRequest): Promise<ConversationRecord[]> {
    const rows = this.db.conversations
      .filter((c) => c.initiatorId === userId || c.heroId === userId)
      .map((c) => this.toConversation(c))
    return sliceCursorPage(rows, (r) => ({ createdAt: r.createdAt, id: r.id }), query, 'desc')
  }

  async findConversation(id: string): Promise<ConversationRecord | null> {
    const stored = this.db.conversations.find((c) => c.id === id)
    return stored ? this.toConversation(stored) : null
  }

  async listMessages(conversationId: string, query: PageRequest): Promise<MessageRecord[]> {
    const rows = this.db.messages.filter((m) => m.conversationId === conversationId)
    return sliceCursorPage(rows, (m) => ({ createdAt: m.createdAt, id: m.id }), query, 'asc')
  }

  async addMessage(conversationId: string, senderId: string, body: string): Promise<MessageRecord> {
    const message: MessageRecord = {
      id: randomUUID(),
      conversationId,
      senderId,
      body,
      createdAt: this.db.now(),
    }
    this.db.messages.push(message)
    return message
  }
}
