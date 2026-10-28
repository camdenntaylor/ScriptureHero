import { z } from "zod";

export const membershipSchema = z.enum([
  "none",
  "active",
  "requested",
  "invited",
]);
export const createSpaceSchema = z
  .object({
    id: z.uuid(), // client-generated id makes creation safe to retry
    name: z.string().trim().min(1).max(80),
    description: z.string().trim().max(500),
    visibility: z.enum(["public", "private"]),
  })
  .strict();
export const spaceSchema = createSpaceSchema.extend({
  ownerId: z.uuid().nullable(),
  createdAt: z.iso.datetime(),
  membership: membershipSchema,
});
export const publicProfileSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  bio: z.string(),
  location: z.string(),
  avatarPath: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
export const visiblePostSchema = z.object({
  id: z.uuid(),
  title: z.string().nullable(),
  body: z.string(),
  scriptureReference: z.string().nullable(),
  createdAt: z.iso.datetime(),
  author: publicProfileSchema,
  space: z.object({
    id: z.uuid(),
    name: z.string(),
    visibility: z.enum(["public", "private"]),
  }),
  status: z.enum([
    "draft",
    "pending_moderation",
    "needs_review",
    "published",
    "rejected",
    "hidden",
  ]),
});
export const membershipActionSchema = z.enum([
  "join",
  "accept",
  "invite",
  "approve",
  "decline",
]);
export const memberSchema = z.object({
  user: publicProfileSchema,
  status: z.enum(["active", "requested", "invited"]),
  createdAt: z.iso.datetime(),
});
export const pageSchema = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable() });
export const searchResultSchema = z.object({
  users: pageSchema(publicProfileSchema),
  spaces: pageSchema(spaceSchema),
  posts: pageSchema(visiblePostSchema),
});
export type Space = z.infer<typeof spaceSchema>;
export type CreateSpace = z.infer<typeof createSpaceSchema>;
export type MembershipAction = z.infer<typeof membershipActionSchema>;
export type SpaceMember = z.infer<typeof memberSchema>;
export type PublicProfile = z.infer<typeof publicProfileSchema>;
export type VisiblePost = z.infer<typeof visiblePostSchema>;
export type SearchResult = z.infer<typeof searchResultSchema>;
export type Page<T> = { items: T[]; nextCursor: string | null };
