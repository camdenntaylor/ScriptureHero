import { z } from 'zod'
import { pageQuerySchema } from '../../shared/pagination.js'

export const savedPostsQuerySchema = pageQuerySchema
export const savedPostParamsSchema = z.object({ postId: z.uuid() })
