import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../application.js";
import { createInMemoryDependencies } from "../../dependencies.js";
import { InMemoryDatabase } from "../../shared/in-memory-database.js";
import { encodeCursor } from "../../shared/pagination.js";
import { GLOBAL_SPACE_ID } from "../../shared/supabase.js";

const owner = "10000000-0000-4000-8000-000000000001";
const member = "10000000-0000-4000-8000-000000000002";
const outsider = "10000000-0000-4000-8000-000000000003";
let app: FastifyInstance;
let db: InMemoryDatabase;
const headers = (user?: string) =>
  user ? { authorization: `Bearer ${user}` } : {};
async function create(
  visibility: "public" | "private" = "private",
  id = randomUUID(),
) {
  const response = await app.inject({
    method: "POST",
    url: "/api/v1/spaces",
    headers: headers(owner),
    payload: {
      id,
      name: "Garden circle",
      description: "Share a little encouragement.",
      visibility,
    },
  });
  expect(response.statusCode).toBe(201);
  return response.json().data as {
    id: string;
    membership: string;
    ownerId: string;
  };
}
async function act(id: string, actor: string, action: string, userId?: string) {
  return app.inject({
    method: "POST",
    url: `/api/v1/spaces/${id}/memberships`,
    headers: headers(actor),
    payload: { action, ...(userId ? { userId } : {}) },
  });
}
function post(
  spaceId: string,
  authorId: string,
  status: "published" | "pending_moderation" = "published",
  body = "A garden of hope",
) {
  const row = {
    id: randomUUID(),
    authorId,
    spaceId,
    status,
    body,
    title: "A little hope",
    scriptureReference: null,
    createdAt: db.now(),
  };
  db.posts.push(row);
  return row.id;
}
beforeEach(async () => {
  db = new InMemoryDatabase(() => new Date("2026-10-28T12:00:00Z"));
  db.addProfile(owner, "Avery");
  db.addProfile(member, "Blair");
  db.addProfile(outsider, "Casey");
  app = await buildApp(
    { HOST: "127.0.0.1", PORT: 3000, FRONTEND_ORIGIN: "http://localhost:5173" },
    createInMemoryDependencies(db, {
      async verify(token) {
        return db.profiles.has(token) ? { id: token } : null;
      },
    }),
  );
});
afterEach(async () => {
  await app.close();
});

describe("Spaces and Explore", () => {
  it('offers Global and active memberships as posting destinations, excluding requests and invitations before pagination', async () => {
    const joined = await create('public')
    const requested = await create()
    const invited = await create()
    await act(joined.id, member, 'join')
    await act(requested.id, member, 'join')
    await act(invited.id, owner, 'invite', member)
    const first = await app.inject({ url: '/api/v1/me/posting-spaces?limit=1', headers: headers(member) })
    expect(first.statusCode).toBe(200)
    const second = await app.inject({ url: `/api/v1/me/posting-spaces?limit=1&cursor=${first.json().data.nextCursor}`, headers: headers(member) })
    expect([...first.json().data.items, ...second.json().data.items].map((s: { id: string }) => s.id).sort()).toEqual([joined.id, GLOBAL_SPACE_ID].sort())
    expect(second.json().data.nextCursor).toBeNull()
    expect((await app.inject({ url: '/api/v1/me/posting-spaces' })).statusCode).toBe(401)
  })

  it('persists Global submissions for moderation and handles simultaneous retry IDs without duplicate posts', async () => {
    const id = randomUUID()
    const request = { method: 'POST' as const, url: `/api/v1/spaces/${GLOBAL_SPACE_ID}/posts`, headers: headers(member), payload: { id, body: '  A little encouragement.  ' } }
    const [first, retry] = await Promise.all([app.inject(request), app.inject(request)])
    expect(first.statusCode).toBe(201)
    expect(retry.json()).toEqual(first.json())
    expect(first.json().data).toEqual({ id, status: 'pending_moderation', space: { id: GLOBAL_SPACE_ID, name: 'Global', visibility: 'public' } })
    expect(db.posts).toHaveLength(1)
    expect(db.posts[0]).toMatchObject({ spaceId: GLOBAL_SPACE_ID, authorId: member, body: 'A little encouragement.', status: 'pending_moderation' })
    expect((await app.inject({ url: '/api/v1/me/posts', headers: headers(member) })).json().data.items[0].id).toBe(id)
    expect((await app.inject({ url: `/api/v1/insights/${id}`, headers: headers(outsider) })).statusCode).toBe(404)
    expect((await app.inject({ url: '/api/v1/explore?kind=posts', headers: headers(member) })).json().data.posts.items).toEqual([])
  })

  it('submits only to the selected Space after membership is active, and checks again on retry after revocation', async () => {
    const s = await create()
    const id = randomUUID()
    const request = { method: 'POST' as const, url: `/api/v1/spaces/${s.id}/posts`, headers: headers(member), payload: { id, body: 'For this little circle.' } }
    expect((await app.inject(request)).statusCode).toBe(403)
    await act(s.id, owner, 'invite', member)
    expect((await app.inject(request)).statusCode).toBe(403)
    await act(s.id, member, 'accept')
    const response = await app.inject(request)
    expect(response.statusCode).toBe(201)
    expect(response.json().data.space).toMatchObject({ id: s.id, visibility: 'private' })
    expect(db.posts.map(p => p.spaceId)).toEqual([s.id])
    expect((await app.inject({ ...request, payload: { ...request.payload, body: 'Changed body' } })).statusCode).toBe(409)
    expect((await app.inject({ ...request, url: `/api/v1/spaces/${GLOBAL_SPACE_ID}/posts` })).statusCode).toBe(409)
    expect((await app.inject({ ...request, url: `/api/v1/spaces/${GLOBAL_SPACE_ID}/posts`, headers: headers(outsider) })).statusCode).toBe(409)
    db.memberships.delete(`${s.id}:${member}`)
    expect((await app.inject(request)).statusCode).toBe(403)
    expect(db.posts).toHaveLength(1)
  })

  it('requires joining public Spaces and never silently falls back to Global', async () => {
    const s = await create('public')
    const payload = { id: randomUUID(), body: 'Chosen destination.' }
    const request = { method: 'POST' as const, url: `/api/v1/spaces/${s.id}/posts`, headers: headers(member), payload }
    expect((await app.inject(request)).statusCode).toBe(403)
    await act(s.id, member, 'join')
    expect((await app.inject(request)).statusCode).toBe(201)
    expect((await app.inject({ ...request, url: `/api/v1/spaces/${randomUUID()}/posts`, payload: { ...payload, id: randomUUID() } })).statusCode).toBe(404)
    expect(db.posts.map(p => p.spaceId)).toEqual([s.id])
  })

  it('rejects forged author/status/destination fields and invalid content on the submission boundary', async () => {
    const url = `/api/v1/spaces/${GLOBAL_SPACE_ID}/posts`
    for (const payload of [
      { id: randomUUID(), body: ' ' }, { id: randomUUID(), body: 'a'.repeat(1501) },
      { id: randomUUID(), body: 'Hope', authorId: outsider }, { id: randomUUID(), body: 'Hope', status: 'published' },
      { id: randomUUID(), body: 'Hope', spaceId: randomUUID() },
    ]) expect((await app.inject({ method: 'POST', url, headers: headers(member), payload })).statusCode).toBe(400)
    expect((await app.inject({ method: 'POST', url, payload: { id: randomUUID(), body: 'Hope' } })).statusCode).toBe(401)
    expect(db.posts).toHaveLength(0)
  })

  it("creates atomically and retries the same creation without duplicates or ownership changes", async () => {
    const s = await create();
    expect(s).toMatchObject({ membership: "active", ownerId: owner });
    await create("private", s.id);
    expect(db.spaces.size).toBe(2);
    expect(db.memberships.size).toBe(1);
    const conflict = await app.inject({
      method: "POST",
      url: "/api/v1/spaces",
      headers: headers(outsider),
      payload: {
        id: s.id,
        name: "Taken",
        description: "",
        visibility: "public",
      },
    });
    expect(conflict.statusCode).toBe(409);
  });
  it("public joining is idempotent, private joining waits for owner approval", async () => {
    const publicSpace = await create("public");
    const privateSpace = await create();
    for (let i = 0; i < 2; i++)
      expect(
        (await act(publicSpace.id, member, "join")).json().data.membership,
      ).toBe("active");
    for (let i = 0; i < 2; i++)
      expect(
        (await act(privateSpace.id, member, "join")).json().data.membership,
      ).toBe("requested");
    expect((await act(privateSpace.id, member, "accept")).statusCode).toBe(409);
    expect(
      (await act(privateSpace.id, outsider, "approve", member)).statusCode,
    ).toBe(403);
    expect(
      (await act(privateSpace.id, owner, "approve", member)).statusCode,
    ).toBe(200);
    expect(
      (await act(privateSpace.id, owner, "approve", member)).statusCode,
    ).toBe(200);
    expect(db.memberships.get(`${privateSpace.id}:${member}`)?.status).toBe(
      "active",
    );
  });
  it("owners invite, recipients see and accept or decline invitations, others cannot impersonate them", async () => {
    const s = await create();
    expect((await act(s.id, outsider, "invite", member)).statusCode).toBe(403);
    expect((await act(s.id, owner, "invite", member)).statusCode).toBe(200);
    expect((await act(s.id, owner, "invite", member)).statusCode).toBe(200);
    const mine = await app.inject({
      url: "/api/v1/spaces?mine=true",
      headers: headers(member),
    });
    expect(mine.json().data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: s.id, membership: "invited" }),
      ]),
    );
    expect((await act(s.id, outsider, "accept", member)).statusCode).toBe(403);
    expect((await act(s.id, member, "decline")).statusCode).toBe(200);
    expect((await act(s.id, member, "accept")).statusCode).toBe(409);
    await act(s.id, owner, "invite", member);
    expect((await act(s.id, member, "accept")).json().data.membership).toBe(
      "active",
    );
    expect((await act(s.id, member, "accept")).statusCode).toBe(200);
    expect((await act(s.id, owner, "decline")).statusCode).toBe(409);
  });
  it("exposes private directory metadata but blocks its posts until active membership, including direct IDs and profiles", async () => {
    const s = await create();
    const id = post(s.id, owner);
    post(s.id, owner, "pending_moderation");
    expect(
      (await app.inject({ url: `/api/v1/spaces/${s.id}` })).json().data.name,
    ).toBe("Garden circle");
    await act(s.id, owner, "invite", member);
    for (const viewer of [undefined, outsider, member]) {
      expect(
        (
          await app.inject({
            url: `/api/v1/insights/${id}`,
            headers: headers(viewer),
          })
        ).statusCode,
      ).toBe(404);
      for (const url of [
        `/api/v1/explore?q=garden`,
        `/api/v1/profiles/${owner}/posts`,
        `/api/v1/spaces/${s.id}/posts`,
      ]) {
        const response = await app.inject({ url, headers: headers(viewer) });
        expect(response.statusCode).toBe(200);
        expect(JSON.stringify(response.json().data)).not.toContain(
          "A garden of hope",
        );
      }
    }
    await act(s.id, member, "accept");
    const result = await app.inject({
      url: `/api/v1/spaces/${s.id}/posts`,
      headers: headers(member),
    });
    expect(result.json().data.items.map((p: { id: string }) => p.id)).toEqual([
      id,
    ]);
    expect(
      (
        await app.inject({
          url: `/api/v1/insights/${id}`,
          headers: headers(member),
        })
      ).statusCode,
    ).toBe(200);
    expect((await app.inject({ url: "/api/v1/posts" })).json().data).toEqual(
      [],
    );
  });
  it("keeps member management owner-only and paginates it", async () => {
    const s = await create();
    await act(s.id, member, "join");
    await act(s.id, outsider, "join");
    expect(
      (
        await app.inject({
          url: `/api/v1/spaces/${s.id}/members`,
          headers: headers(member),
        })
      ).statusCode,
    ).toBe(403);
    const first = (
      await app.inject({
        url: `/api/v1/spaces/${s.id}/members?limit=2`,
        headers: headers(owner),
      })
    ).json().data;
    const second = (
      await app.inject({
        url: `/api/v1/spaces/${s.id}/members?limit=2&cursor=${first.nextCursor}`,
        headers: headers(owner),
      })
    ).json().data;
    expect([...first.items, ...second.items]).toHaveLength(3);
    expect(second.nextCursor).toBeNull();
  });
  it("own posts include unpublished states; public profiles and searches include only approved posts", async () => {
    const published = post(GLOBAL_SPACE_ID, owner);
    const pending = post(
      GLOBAL_SPACE_ID,
      owner,
      "pending_moderation",
      "An unreviewed thought",
    );
    post(GLOBAL_SPACE_ID, outsider, "pending_moderation");
    const own = await app.inject({
      url: "/api/v1/me/posts",
      headers: headers(owner),
    });
    expect(
      own
        .json()
        .data.items.map((p: { id: string }) => p.id)
        .sort(),
    ).toEqual([published, pending].sort());
    expect(
      (
        await app.inject({
          url: `/api/v1/profiles/${owner}/posts`,
          headers: headers(owner),
        })
      )
        .json()
        .data.items.map((p: { id: string }) => p.id),
    ).toEqual([published]);
    expect(
      (
        await app.inject({
          url: `/api/v1/insights/${pending}`,
          headers: headers(outsider),
        })
      ).statusCode,
    ).toBe(404);
    expect(
      (
        await app.inject({
          url: "/api/v1/explore?kind=posts",
          headers: headers(owner),
        })
      )
        .json()
        .data.posts.items.map((p: { id: string }) => p.id),
    ).toEqual([published]);
  });
  it("uses literal case-insensitive search and opaque keysets without duplicates", async () => {
    for (let i = 0; i < 4; i++) post(GLOBAL_SPACE_ID, owner);
    const first = (
      await app.inject({ url: "/api/v1/explore?q=HOPE&kind=posts&limit=2" })
    ).json().data.posts;
    expect(
      Object.keys(
        JSON.parse(Buffer.from(first.nextCursor, "base64url").toString()),
      ).sort(),
    ).toEqual(["createdAt", "id"]);
    const second = (
      await app.inject({
        url: `/api/v1/explore?q=HOPE&kind=posts&limit=2&cursor=${first.nextCursor}`,
      })
    ).json().data.posts;
    expect(
      new Set(
        [...first.items, ...second.items].map((p: { id: string }) => p.id),
      ).size,
    ).toBe(4);
    expect(second.nextCursor).toBeNull();
    expect(
      (await app.inject({ url: "/api/v1/explore?q=%25&kind=posts" })).json()
        .data.posts.items,
    ).toEqual([]);
    expect(
      (await app.inject({ url: "/api/v1/explore?q=ave&kind=users" })).json()
        .data.users.items[0].name,
    ).toBe("Avery");
  });
  it("rejects unauthenticated writes and invalid inputs and never exposes private contract fields", async () => {
    const s = await create();
    post(GLOBAL_SPACE_ID, owner);
    for (const url of ["/api/v1/me/posts", `/api/v1/spaces/${s.id}/members`])
      expect((await app.inject({ url })).statusCode).toBe(401);
    expect(
      (await app.inject({ method: "POST", url: "/api/v1/spaces", payload: {} }))
        .statusCode,
    ).toBe(401);
    expect(
      (
        await app.inject({
          url: "/api/v1/explore",
          headers: { authorization: "Bearer forged" },
        })
      ).statusCode,
    ).toBe(401);
    expect(
      (await app.inject({ url: "/api/v1/explore?limit=51" })).statusCode,
    ).toBe(400);
    expect(
      (await app.inject({ url: "/api/v1/explore?cursor=bad" })).statusCode,
    ).toBe(400);
    expect(
      (
        await app.inject({
          url: `/api/v1/explore?cursor=${encodeCursor({ createdAt: db.now(), id: "x),status.eq.hidden" })}`,
        })
      ).statusCode,
    ).toBe(400);
    for (const url of [
      "/api/v1/explore",
      `/api/v1/profiles/${owner}`,
      "/api/v1/me/posts",
      `/api/v1/spaces/${s.id}/members`,
    ]) {
      const response = await app.inject({ url, headers: headers(owner) });
      expect(response.statusCode).toBe(200);
      expect(response.headers["cache-control"]).toBe("private, no-store");
      expect(response.body).not.toMatch(
        /question|embedding|matchScore|reason|email|access_token/,
      );
    }
  });
});
