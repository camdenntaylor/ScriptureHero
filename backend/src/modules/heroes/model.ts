import type { PageRequest } from '../../shared/pagination.js'
import type { PublicProfile } from '../posts/model.js'

// One entry per author the caller has saved, summarised by their latest save.
export interface HeroSummary {
  hero: PublicProfile
  lastSavedAt: string
  savedPostCount: number
  latestSavedPost: {
    id: string
    title: string | null
    scriptureReference: string | null
    conversationId: string | null
  }
}

export interface ConversationRecord {
  id: string
  originPostId: string
  initiator: PublicProfile
  hero: PublicProfile
  createdAt: string
}

export interface MessageRecord {
  id: string
  conversationId: string
  senderId: string
  body: string
  createdAt: string
}

export interface HeroRepository {
  /** Authors of the caller's saved posts (excluding the caller). Up to `limit + 1` rows, newest save first. */
  listHeroes(userId: string, query: PageRequest): Promise<HeroSummary[]>
  /** One conversation per (initiator, post). Returns the existing one when it already exists. */
  findOrCreateConversation(
    initiatorId: string,
    heroId: string,
    originPostId: string,
  ): Promise<{ conversation: ConversationRecord; created: boolean } | null>
  /** Conversations the caller is part of, newest first. Up to `limit + 1` rows. */
  listConversations(userId: string, query: PageRequest): Promise<ConversationRecord[]>
  findConversation(id: string): Promise<ConversationRecord | null>
  /** Oldest first. Up to `limit + 1` rows. */
  listMessages(conversationId: string, query: PageRequest): Promise<MessageRecord[]>
  addMessage(conversationId: string, senderId: string, body: string): Promise<MessageRecord>
}
