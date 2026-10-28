import { afterEach, describe, expect, it, vi } from "vitest";
import {
  changeMembership,
  CommunityApiError,
  createSpace,
  getSpace,
  searchCommunity,
} from "./communityApi";

const session = vi.hoisted(() => vi.fn());
vi.mock("./supabase", () => ({ supabase: { auth: { getSession: session } } }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetAllMocks();
});
const id = "10000000-0000-4000-8000-000000000001";
const space = {
  id,
  name: "Garden",
  description: "",
  visibility: "private",
  ownerId: id,
  membership: "active",
  createdAt: "2026-10-28T00:00:00Z",
};
describe("community API", () => {
  it("sends verified credentials and disables caching, while searches encode punctuation literally", async () => {
    session.mockResolvedValue({
      data: { session: { access_token: "test-token" } },
      error: null,
    });
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            data: {
              users: { items: [], nextCursor: null },
              spaces: { items: [], nextCursor: null },
              posts: { items: [], nextCursor: null },
            },
          }),
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    const abort = new AbortController();
    await searchCommunity("peace & hope", "posts", undefined, abort.signal);
    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/explore?q=peace+%26+hope&kind=posts",
      expect.objectContaining({
        cache: "no-store",
        signal: abort.signal,
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
        }),
      }),
    );
  });
  it("keeps creation IDs and membership bodies stable for safe retries", async () => {
    session.mockResolvedValue({ data: { session: null }, error: null });
    const fetcher = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(new Response(JSON.stringify({ data: space }))),
      );
    vi.stubGlobal("fetch", fetcher);
    const input = {
      id,
      name: "Garden",
      description: "",
      visibility: "private" as const,
    };
    await createSpace(input);
    await createSpace(input);
    await changeMembership(id, "invite", id);
    expect(fetcher.mock.calls[0]?.[1].body).toBe(
      fetcher.mock.calls[1]?.[1].body,
    );
    expect(JSON.parse(fetcher.mock.calls[2]?.[1].body)).toEqual({
      action: "invite",
      userId: id,
    });
  });
  it("translates authorization and interrupted network errors without swallowing cancellation", async () => {
    session.mockResolvedValue({ data: { session: null }, error: null });
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            error: { code: "forbidden", message: "Only the owner can invite." },
          }),
          { status: 403 },
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    await expect(getSpace(id)).rejects.toMatchObject({
      code: "forbidden",
      status: 403,
    });
    fetcher.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(getSpace(id)).rejects.toBeInstanceOf(CommunityApiError);
    const cancelled = new DOMException("Cancelled", "AbortError");
    fetcher.mockRejectedValueOnce(cancelled);
    await expect(getSpace(id)).rejects.toBe(cancelled);
  });
});
