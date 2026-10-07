import { z } from 'zod'
import { pageQuerySchema } from '../../shared/pagination.js'

export const listQuerySchema = pageQuerySchema
export const conversationParamsSchema = z.object({ conversationId: z.uuid() })

// A message carries only what its sender writes. No Soul Question, save record,
// or post metadata is attached automatically.
export const startConversationSchema = z.strictObject({ postId: z.uuid() })
export const sendMessageSchema = z.strictObject({ body: z.string().trim().min(1).max(4000) })
