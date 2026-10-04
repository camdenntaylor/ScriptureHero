import { AppError, notFound } from '../../shared/errors.js'
import { toPage, type Page, type PageRequest } from '../../shared/pagination.js'
import type { PostRepository } from '../posts/model.js'
import type { SavedPostRepository } from '../saved-posts/model.js'
import type { ConversationRecord, HeroRepository, HeroSummary, MessageRecord } from './model.js'

export class HeroService {
  constructor(
    private readonly heroes: HeroRepository,
    private readonly posts: PostRepository,
    private readonly saves: SavedPostRepository,
  ) {}

  async listHeroes(userId: string, query: PageRequest): Promise<Page<HeroSummary>> {
    const rows = await this.heroes.listHeroes(userId, query)
    return toPage(rows, query.limit, (entry) => ({ createdAt: entry.lastSavedAt, id: entry.hero.id }))
  }

  // Messaging a Hero is the only action that reveals the saver to the author, and
  // only because the saver chose to write. Saving alone never creates one.
  async startConversation(userId: string, postId: string) {
    const post = await this.posts.findPublishedGlobal(postId)
    if (!post) throw notFound('We could not find that post.')
    if (post.author.id === userId) {
      throw new AppError(400, 'cannot_message_self', 'This is your own post.')
    }
    if (!(await this.saves.isSaved(userId, postId))) {
      throw new AppError(403, 'save_required', 'Save this post to message the person who shared it.')
    }

    const result = await this.heroes.findOrCreateConversation(userId, post.author.id, postId)
    if (!result) throw notFound('We could not start that conversation.')
    return result
  }

  async listConversations(userId: string, query: PageRequest): Promise<Page<ConversationRecord>> {
    const rows = await this.heroes.listConversations(userId, query)
    return toPage(rows, query.limit, (c) => ({ createdAt: c.createdAt, id: c.id }))
  }

  // Non-participants get the same 404 as a missing thread, so a conversation ID
  // reveals nothing about whether it exists.
  private async requireParticipant(userId: string, conversationId: string): Promise<ConversationRecord> {
    const conversation = await this.heroes.findConversation(conversationId)
    if (!conversation || (conversation.initiator.id !== userId && conversation.hero.id !== userId)) {
      throw notFound('We could not find that conversation.')
    }
    return conversation
  }

  async listMessages(userId: string, conversationId: string, query: PageRequest): Promise<Page<MessageRecord>> {
    await this.requireParticipant(userId, conversationId)
    const rows = await this.heroes.listMessages(conversationId, query)
    return toPage(rows, query.limit, (m) => ({ createdAt: m.createdAt, id: m.id }))
  }

  async sendMessage(userId: string, conversationId: string, body: string): Promise<MessageRecord> {
    await this.requireParticipant(userId, conversationId)
    return this.heroes.addMessage(conversationId, userId, body)
  }
}
