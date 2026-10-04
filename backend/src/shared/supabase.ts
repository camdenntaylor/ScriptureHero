import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { requestContext } from './request-context.js'
import type { Cursor } from './pagination.js'

export const GLOBAL_SPACE_ID = '00000000-0000-4000-8000-000000000001'

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } }

export function createAuthClient(url: string, publishableKey: string): SupabaseClient {
  return createClient(url, publishableKey, clientOptions)
}

export interface ClientSource {
  current(): SupabaseClient
}

// Uses the publishable key plus the caller's own access token, never a secret
// key, so Postgres row level security is enforced on every query. Services still
// authorize each action; RLS is defense in depth.
export class RequestClientSource implements ClientSource {
  constructor(
    private readonly url: string,
    private readonly publishableKey: string,
  ) {}

  current(): SupabaseClient {
    const context = requestContext.getStore()
    if (context?.client) return context.client

    const client = createClient(this.url, this.publishableKey, {
      ...clientOptions,
      global: { headers: context?.accessToken ? { Authorization: `Bearer ${context.accessToken}` } : {} },
    })
    if (context) context.client = client
    return client
  }
}

interface SupabaseResult<T> {
  data: T | null
  error: { code?: string; message: string } | null
}

// Errors carry only the operation and Postgres code, never row or message content.
export function unwrap<T>(result: SupabaseResult<T>, operation: string): T {
  if (result.error || result.data === null) {
    throw new Error(`${operation} failed (${result.error?.code ?? 'no data'})`)
  }
  return result.data
}

// PostgREST returns `+00:00`; keep sub-second precision so keyset cursors compare exactly.
export function normalizeTimestamp(value: string): string {
  return value.replace(/\+00:00$/, 'Z')
}

// PostgREST `or=` filter for "rows after this cursor" in the given sort direction.
export function keysetFilter(cursor: Cursor, direction: 'asc' | 'desc', createdColumn: string, idColumn: string) {
  const op = direction === 'desc' ? 'lt' : 'gt'
  return `${createdColumn}.${op}.${cursor.createdAt},and(${createdColumn}.eq.${cursor.createdAt},${idColumn}.${op}.${cursor.id})`
}
