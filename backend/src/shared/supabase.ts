import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Cursor } from './pagination.js'

export const GLOBAL_SPACE_ID = '00000000-0000-4000-8000-000000000001'

const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } }

// The secret-key client bypasses RLS and is server-only. Every authorization
// rule therefore lives in the services, not in the database policies.
export function createServiceClient(url: string, secretKey: string): SupabaseClient {
  return createClient(url, secretKey, clientOptions)
}

export function createAuthClient(url: string, publishableKey: string): SupabaseClient {
  return createClient(url, publishableKey, clientOptions)
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
