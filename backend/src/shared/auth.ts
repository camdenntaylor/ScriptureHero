import type { FastifyRequest } from 'fastify'
import { AppError } from './errors.js'

export interface AuthUser {
  id: string
}

// Turns a Supabase access token into a user. The Supabase-backed version lands
// with the project keys; until then tests and local development use stand-ins.
export interface Authenticator {
  verify(accessToken: string): Promise<AuthUser | null>
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser
  }
}

export const denyAllAuthenticator: Authenticator = {
  async verify() {
    return null
  },
}

export type RequireUser = (request: FastifyRequest) => Promise<void>

export function createRequireUser(authenticator: Authenticator): RequireUser {
  return async (request) => {
    const match = /^Bearer (.+)$/i.exec(request.headers.authorization ?? '')
    const user = match?.[1] ? await authenticator.verify(match[1]) : null
    if (!user) throw new AppError(401, 'unauthenticated', 'Please sign in to continue.')
    request.user = user
  }
}

export function currentUser(request: FastifyRequest): AuthUser {
  if (!request.user) throw new AppError(401, 'unauthenticated', 'Please sign in to continue.')
  return request.user
}
