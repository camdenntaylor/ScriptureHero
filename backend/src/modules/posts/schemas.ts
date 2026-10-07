import { z } from 'zod'
import { pageQuerySchema } from '../../shared/pagination.js'

export const feedQuerySchema = pageQuerySchema.extend({ authorId: z.uuid().optional() })

// Text posts only. Title and scripture reference are optional.
export const createPostSchema = z.strictObject({
  title: z.string().trim().min(1).max(160).optional(),
  body: z.string().trim().min(1).max(10000),
  scriptureReference: z.string().trim().min(1).max(120).optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>
