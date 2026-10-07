import { z } from 'zod'
import { AppError } from './errors.js'

// Every list is ordered by (createdAt, id) so a cursor is unambiguous even when
// two rows share a timestamp.
export interface Cursor {
  createdAt: string
  id: string
}

export interface PageRequest {
  limit: number
  cursor?: Cursor
}

export interface Page<T> {
  items: T[]
  nextCursor: string | null
}

export const pageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).max(512).optional(),
})

const cursorSchema = z.object({ createdAt: z.iso.datetime(), id: z.string().min(1).max(100) })

export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(JSON.stringify(cursor)).toString('base64url')
}

export function decodeCursor(raw: string): Cursor {
  try {
    return cursorSchema.parse(JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')))
  } catch {
    throw new AppError(400, 'invalid_cursor', 'That page marker is not valid. Start again from the top.')
  }
}

export function toPageRequest(query: { limit: number; cursor?: string | undefined }): PageRequest {
  const request: PageRequest = { limit: query.limit }
  if (query.cursor !== undefined) request.cursor = decodeCursor(query.cursor)
  return request
}

export function compareCursors(a: Cursor, b: Cursor): number {
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? -1 : 1
  if (a.id === b.id) return 0
  return a.id < b.id ? -1 : 1
}

// Repositories return up to `limit + 1` rows; the extra row only proves another
// page exists. This trims it and builds the cursor from the last returned row.
export function toPage<T>(rows: T[], limit: number, keyOf: (row: T) => Cursor): Page<T> {
  const items = rows.slice(0, limit)
  const last = items[items.length - 1]
  return {
    items,
    nextCursor: rows.length > limit && last !== undefined ? encodeCursor(keyOf(last)) : null,
  }
}

// In-memory counterpart of a keyset query: sort, skip past the cursor, and take
// `limit + 1` rows.
export function sliceCursorPage<T>(
  rows: T[],
  keyOf: (row: T) => Cursor,
  { limit, cursor }: PageRequest,
  direction: 'asc' | 'desc',
): T[] {
  const sign = direction === 'desc' ? -1 : 1
  const sorted = [...rows].sort((a, b) => sign * compareCursors(keyOf(a), keyOf(b)))
  const rest = cursor ? sorted.filter((row) => sign * compareCursors(keyOf(row), cursor) > 0) : sorted
  return rest.slice(0, limit + 1)
}
