import type { FastifyInstance } from 'fastify'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    readonly statusCode: number,
    readonly code: string,
    message: string,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const notFound = (message = 'We could not find that.') => new AppError(404, 'not_found', message)

// One error envelope for every route: { error: { code, message } }. Request
// bodies are never echoed back or logged, because messages are private.
export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } })
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'validation_error',
          message: 'Please check the highlighted details and try again.',
          issues: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
        },
      })
    }

    const statusCode = (error as { statusCode?: number }).statusCode
    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      return reply.status(statusCode).send({
        error: { code: 'bad_request', message: 'The request could not be understood.' },
      })
    }

    request.log.error({ err: error }, 'Unhandled error')
    return reply.status(500).send({
      error: { code: 'internal_error', message: 'Something went wrong. Please try again.' },
    })
  })
}
