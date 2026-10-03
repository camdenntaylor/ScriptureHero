import type { FastifyInstance, FastifyRequest } from 'fastify'
import { z } from 'zod'
import type { AppConfig } from '../../config/env.js'

const userSchema = z.object({ id: z.uuid() })
const profileRow = z.object({ id: z.uuid(), display_name: z.string(), bio: z.string().nullable(), location: z.string().nullable(), avatar_path: z.string().nullable() })
const questionRow = z.object({ id: z.uuid(), question_text: z.string(), created_at: z.string() })
const profileInput = z.object({ name: z.string().trim().min(1).max(80), bio: z.string().trim().max(280), location: z.string().trim().max(80) })
const avatarInput = z.object({ path: z.string().max(160) })
const questionInput = z.object({ id: z.uuid(), text: z.string().trim().min(1).max(500) })
const questionParams = z.object({ id: z.uuid() })

type Fetcher = typeof fetch
type Context = { config: AppConfig; fetcher: Fetcher; token: string; userId: string }

function fail(code: string, message: string) { return { error: { code, message } } }
function profile(row: z.infer<typeof profileRow>) { return { id: row.id, name: row.display_name, bio: row.bio ?? '', location: row.location ?? '', avatarPath: row.avatar_path } }
function question(row: z.infer<typeof questionRow>) { return { id: row.id, title: row.question_text, createdAt: row.created_at } }

async function identify(request: FastifyRequest, config: AppConfig, fetcher: Fetcher): Promise<Context | null> {
  const token = /^Bearer (\S+)$/i.exec(request.headers.authorization ?? '')?.[1]
  if (!token || !config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY) return null
  try {
    const response = await fetcher(`${config.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: config.SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${token}` } })
    if (!response.ok) return null
    const user = userSchema.safeParse(await response.json())
    return user.success ? { config, fetcher, token, userId: user.data.id } : null
  } catch { return null }
}

async function database(ctx: Context, path: string, init: RequestInit = {}) {
  return ctx.fetcher(`${ctx.config.SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { apikey: ctx.config.SUPABASE_PUBLISHABLE_KEY!, Authorization: `Bearer ${ctx.token}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...init.headers } })
}

export function registerAccountRoutes(app: FastifyInstance, config: AppConfig, fetcher: Fetcher = fetch) {
  app.addHook('preHandler', (_request, reply, done) => {
    if (!config.SUPABASE_URL || !config.SUPABASE_PUBLISHABLE_KEY) {
      reply.code(503).send(fail('CONFIG_UNAVAILABLE', 'Account services are not configured.'))
      return
    }
    done()
  })
  app.addHook('onSend', (_request, reply, payload, done) => { reply.header('Cache-Control', 'private, no-store'); done(null, payload) })
  app.setErrorHandler((_error, _request, reply) => { reply.code(502).send(fail('ACCOUNT_UNAVAILABLE', 'Account services are temporarily unavailable.')) })

  app.get('/me', async (request, reply) => {
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    const response = await database(ctx, `profiles?id=eq.${ctx.userId}&select=id,display_name,bio,location,avatar_path&limit=1`)
    if (!response.ok) return reply.code(502).send(fail('PROFILE_UNAVAILABLE', 'Unable to load your profile.'))
    const rows = z.array(profileRow).safeParse(await response.json())
    if (!rows.success || !rows.data[0]) return reply.code(502).send(fail('PROFILE_UNAVAILABLE', 'Unable to load your profile.'))
    return { data: profile(rows.data[0]) }
  })

  app.patch('/me', async (request, reply) => {
    const input = profileInput.safeParse(request.body)
    if (!input.success) return reply.code(400).send(fail('INVALID_PROFILE', 'Check your profile details.'))
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    const response = await database(ctx, `profiles?id=eq.${ctx.userId}&select=id,display_name,bio,location,avatar_path`, { method: 'PATCH', body: JSON.stringify({ display_name: input.data.name, bio: input.data.bio || null, location: input.data.location || null }) })
    if (!response.ok) return reply.code(502).send(fail('PROFILE_SAVE_FAILED', 'Unable to save your profile.'))
    const rows = z.array(profileRow).safeParse(await response.json())
    if (!rows.success || !rows.data[0]) return reply.code(502).send(fail('PROFILE_SAVE_FAILED', 'Unable to save your profile.'))
    return { data: profile(rows.data[0]) }
  })

  app.patch('/me/avatar', async (request, reply) => {
    const input = avatarInput.safeParse(request.body)
    if (!input.success) return reply.code(400).send(fail('INVALID_AVATAR', 'Choose a valid photo.'))
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    if (!new RegExp(`^${ctx.userId}/[0-9a-f-]{36}\\.(jpg|png|webp)$`, 'i').test(input.data.path)) return reply.code(400).send(fail('INVALID_AVATAR', 'Choose a valid photo.'))
    const response = await database(ctx, `profiles?id=eq.${ctx.userId}&select=id,display_name,bio,location,avatar_path`, { method: 'PATCH', body: JSON.stringify({ avatar_path: input.data.path }) })
    if (!response.ok) return reply.code(502).send(fail('AVATAR_SAVE_FAILED', 'Unable to save your photo.'))
    const rows = z.array(profileRow).safeParse(await response.json())
    if (!rows.success || !rows.data[0]) return reply.code(502).send(fail('AVATAR_SAVE_FAILED', 'Unable to save your photo.'))
    return { data: profile(rows.data[0]) }
  })

  app.get('/soul-questions', async (request, reply) => {
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    const response = await database(ctx, `soul_questions?owner_id=eq.${ctx.userId}&select=id,question_text,created_at&order=created_at.desc&limit=100`)
    if (!response.ok) return reply.code(502).send(fail('QUESTIONS_UNAVAILABLE', 'Unable to load your questions.'))
    const rows = z.array(questionRow).safeParse(await response.json())
    if (!rows.success) return reply.code(502).send(fail('QUESTIONS_UNAVAILABLE', 'Unable to load your questions.'))
    return { data: rows.data.map(question) }
  })

  app.post('/soul-questions', async (request, reply) => {
    const input = questionInput.safeParse(request.body)
    if (!input.success) return reply.code(400).send(fail('INVALID_QUESTION', 'Enter a question up to 500 characters.'))
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    const response = await database(ctx, 'soul_questions?select=id,question_text,created_at', { method: 'POST', body: JSON.stringify({ id: input.data.id, owner_id: ctx.userId, question_text: input.data.text }) })
    if (response.status === 409) return reply.code(409).send(fail('QUESTION_EXISTS', 'This question was already recorded.'))
    if (!response.ok) return reply.code(502).send(fail('QUESTION_SAVE_FAILED', 'Unable to record your question.'))
    const rows = z.array(questionRow).safeParse(await response.json())
    if (!rows.success || !rows.data[0]) return reply.code(502).send(fail('QUESTION_SAVE_FAILED', 'Unable to record your question.'))
    return reply.code(201).send({ data: question(rows.data[0]) })
  })

  app.delete('/soul-questions/:id', async (request, reply) => {
    const params = questionParams.safeParse(request.params)
    if (!params.success) return reply.code(400).send(fail('INVALID_QUESTION', 'Choose a valid question.'))
    const ctx = await identify(request, config, fetcher)
    if (!ctx) return reply.code(401).send(fail('UNAUTHORIZED', 'Sign in to continue.'))
    const response = await database(ctx, `soul_questions?id=eq.${params.data.id}&owner_id=eq.${ctx.userId}`, { method: 'DELETE' })
    if (!response.ok) return reply.code(502).send(fail('QUESTION_DELETE_FAILED', 'Unable to remove your question.'))
    return reply.code(204).send()
  })
}
