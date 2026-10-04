import type { FastifyReply, FastifyRequest } from 'fastify'
import { currentUser } from '../../shared/auth.js'
import { toPageRequest } from '../../shared/pagination.js'
import type { ConversationRecord, HeroSummary, MessageRecord } from './model.js'
import {
  conversationParamsSchema,
  listQuerySchema,
  sendMessageSchema,
  startConversationSchema,
} from './schemas.js'
import type { HeroService } from './service.js'

function toHeroResponse(entry: HeroSummary) {
  return {
    hero: { id: entry.hero.id, displayName: entry.hero.displayName },
    lastSavedAt: entry.lastSavedAt,
    savedPostCount: entry.savedPostCount,
    latestSavedPost: {
      id: entry.latestSavedPost.id,
      title: entry.latestSavedPost.title,
      scriptureReference: entry.latestSavedPost.scriptureReference,
      conversationId: entry.latestSavedPost.conversationId,
    },
  }
}

// `with` is the other person in the thread, from the caller's point of view.
function toConversationResponse(conversation: ConversationRecord, userId: string) {
  const isInitiator = conversation.initiator.id === userId
  const other = isInitiator ? conversation.hero : conversation.initiator
  return {
    id: conversation.id,
    originPostId: conversation.originPostId,
    role: isInitiator ? 'initiator' : 'hero',
    with: { id: other.id, displayName: other.displayName },
    createdAt: conversation.createdAt,
  }
}

function toMessageResponse(message: MessageRecord) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt,
  }
}

export class HeroController {
  constructor(private readonly service: HeroService) {}

  listHeroes = async (request: FastifyRequest) => {
    const query = listQuerySchema.parse(request.query)
    const page = await this.service.listHeroes(currentUser(request).id, toPageRequest(query))
    return { data: page.items.map(toHeroResponse), nextCursor: page.nextCursor }
  }

  startConversation = async (request: FastifyRequest, reply: FastifyReply) => {
    const user = currentUser(request)
    const { postId } = startConversationSchema.parse(request.body)
    const { conversation, created } = await this.service.startConversation(user.id, postId)
    return reply.status(created ? 201 : 200).send({ data: toConversationResponse(conversation, user.id) })
  }

  listConversations = async (request: FastifyRequest) => {
    const user = currentUser(request)
    const query = listQuerySchema.parse(request.query)
    const page = await this.service.listConversations(user.id, toPageRequest(query))
    return { data: page.items.map((c) => toConversationResponse(c, user.id)), nextCursor: page.nextCursor }
  }

  listMessages = async (request: FastifyRequest) => {
    const { conversationId } = conversationParamsSchema.parse(request.params)
    const query = listQuerySchema.parse(request.query)
    const page = await this.service.listMessages(currentUser(request).id, conversationId, toPageRequest(query))
    return { data: page.items.map(toMessageResponse), nextCursor: page.nextCursor }
  }

  sendMessage = async (request: FastifyRequest, reply: FastifyReply) => {
    const { conversationId } = conversationParamsSchema.parse(request.params)
    const { body } = sendMessageSchema.parse(request.body)
    const message = await this.service.sendMessage(currentUser(request).id, conversationId, body)
    return reply.status(201).send({ data: toMessageResponse(message) })
  }
}
