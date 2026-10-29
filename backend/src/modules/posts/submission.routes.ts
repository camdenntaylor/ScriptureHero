import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { postSubmissionSchema, submitSpacePostSchema } from '@scripture-hero/contracts'
import { currentUser, type RequireUser } from '../../shared/auth.js'
import type { PostSubmissionService } from './submission.service.js'

export async function registerPostSubmissionRoutes(app: FastifyInstance, service: PostSubmissionService, requireUser: RequireUser) {
  app.post('/spaces/:id/posts', { preHandler: requireUser }, async (request, reply) => {
    const { id } = z.object({ id: z.uuid() }).parse(request.params)
    const input = submitSpacePostSchema.parse(request.body)
    const receipt = await service.submit(currentUser(request).id, id, input)
    reply.header('Cache-Control', 'private, no-store')
    return reply.code(201).send({ data: postSubmissionSchema.parse(receipt) })
  })
}
