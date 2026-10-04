import type { FastifyInstance } from 'fastify'
import type { RequireUser } from '../../shared/auth.js'
import type { HeroController } from './controller.js'

// Heroes and conversations are private to their participants.
export async function registerHeroRoutes(app: FastifyInstance, controller: HeroController, requireUser: RequireUser) {
  const options = { preHandler: requireUser }
  app.get('/heroes', options, controller.listHeroes)
  app.get('/conversations', options, controller.listConversations)
  app.post('/conversations', options, controller.startConversation)
  app.get('/conversations/:conversationId/messages', options, controller.listMessages)
  app.post('/conversations/:conversationId/messages', options, controller.sendMessage)
}
