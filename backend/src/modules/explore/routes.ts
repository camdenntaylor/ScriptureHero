import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createSpaceSchema,
  membershipActionSchema,
  memberSchema,
  pageSchema,
  publicProfileSchema,
  spaceSchema,
  visiblePostSchema,
} from "@scripture-hero/contracts";
import { currentUser, type RequireUser } from "../../shared/auth.js";
import { pageQuerySchema, toPageRequest } from "../../shared/pagination.js";
import type { SpaceService } from "../spaces/service.js";
import type { ExploreService } from "./service.js";

const idParams = z.object({ id: z.uuid() });
const searchQuery = pageQuerySchema.extend({
  q: z.string().trim().max(100).default(""),
  kind: z.enum(["all", "users", "spaces", "posts"]).default("all"),
});
function readPage(query: { limit: number; cursor?: string }) {
  const page = toPageRequest(query);
  if (page.cursor) z.uuid().parse(page.cursor.id);
  return page;
}
export async function registerExploreRoutes(
  app: FastifyInstance,
  explore: ExploreService,
  spaces: SpaceService,
  requireUser: RequireUser,
) {
  app.addHook("onSend", async (_request, reply) => {
    reply.header("Cache-Control", "private, no-store");
  });
  app.get("/explore", async (request) => {
    const query = searchQuery.parse(request.query);
    const page = { ...readPage(query), q: query.q };
    const empty = { items: [], nextCursor: null };
    const userId = request.user?.id ?? null;
    const [users, foundSpaces, posts] = await Promise.all([
      ["all", "users"].includes(query.kind) ? explore.profiles(page) : empty,
      ["all", "spaces"].includes(query.kind)
        ? spaces.list(userId, page)
        : empty,
      ["all", "posts"].includes(query.kind)
        ? explore.posts(userId, page)
        : empty,
    ]);
    return {
      data: {
        users: pageSchema(publicProfileSchema).parse(users),
        spaces: pageSchema(spaceSchema).parse(foundSpaces),
        posts: pageSchema(visiblePostSchema).parse(posts),
      },
    };
  });
  app.get("/spaces", async (request) => {
    const query = pageQuerySchema
      .extend({ mine: z.enum(["true", "false"]).default("false") })
      .parse(request.query);
    if (query.mine === "true") currentUser(request);
    return {
      data: pageSchema(spaceSchema).parse(
        await spaces.list(request.user?.id ?? null, {
          ...readPage(query),
          mine: query.mine === "true",
        }),
      ),
    };
  });
  app.post("/spaces", { preHandler: requireUser }, async (request, reply) =>
    reply.code(201).send({
      data: spaceSchema.parse(
        await spaces.create(
          currentUser(request).id,
          createSpaceSchema.parse(request.body),
        ),
      ),
    }),
  );
  app.get("/spaces/:id", async (request) => ({
    data: spaceSchema.parse(
      await spaces.find(
        idParams.parse(request.params).id,
        request.user?.id ?? null,
      ),
    ),
  }));
  app.get("/spaces/:id/posts", async (request) => ({
    data: pageSchema(visiblePostSchema).parse(
      await explore.posts(request.user?.id ?? null, {
        ...readPage(pageQuerySchema.parse(request.query)),
        spaceId: idParams.parse(request.params).id,
      }),
    ),
  }));
  app.get(
    "/spaces/:id/members",
    { preHandler: requireUser },
    async (request) => ({
      data: pageSchema(memberSchema).parse(
        await spaces.members(
          idParams.parse(request.params).id,
          currentUser(request).id,
          readPage(pageQuerySchema.parse(request.query)),
        ),
      ),
    }),
  );
  app.post(
    "/spaces/:id/memberships",
    { preHandler: requireUser },
    async (request) => {
      const input = z
        .object({ action: membershipActionSchema, userId: z.uuid().optional() })
        .strict()
        .parse(request.body);
      return {
        data: spaceSchema.parse(
          await spaces.change(
            idParams.parse(request.params).id,
            currentUser(request).id,
            input.userId ?? currentUser(request).id,
            input.action,
          ),
        ),
      };
    },
  );
  app.get("/profiles/:id", async (request) => ({
    data: publicProfileSchema.parse(
      await explore.profile(idParams.parse(request.params).id),
    ),
  }));
  app.get("/profiles/:id/posts", async (request) => ({
    data: pageSchema(visiblePostSchema).parse(
      await explore.posts(request.user?.id ?? null, {
        ...readPage(pageQuerySchema.parse(request.query)),
        authorId: idParams.parse(request.params).id,
      }),
    ),
  }));
  app.get("/me/posts", { preHandler: requireUser }, async (request) => ({
    data: pageSchema(visiblePostSchema).parse(
      await explore.posts(currentUser(request).id, {
        ...readPage(pageQuerySchema.parse(request.query)),
        authorId: currentUser(request).id,
        own: true,
      }),
    ),
  }));
  app.get("/insights/:id", async (request) => ({
    data: visiblePostSchema.parse(
      await explore.post(
        idParams.parse(request.params).id,
        request.user?.id ?? null,
      ),
    ),
  }));
}
