import {
  pageSchema,
  publicProfileSchema,
  searchResultSchema,
  spaceSchema,
  memberSchema,
  visiblePostSchema,
  type CreateSpace,
  type MembershipAction,
  type Space,
  type VisiblePost,
  type PublicProfile,
  type Page,
} from "@scripture-hero/contracts";
import { supabase } from "./supabase";
import { postSubmissionSchema, type SubmitSpacePost } from '@scripture-hero/contracts';

const apiUrl = import.meta.env.VITE_API_URL ?? "/api";
export class CommunityApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status: number,
  ) {
    super(message);
  }
}
async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  try {
    const session = supabase ? await supabase.auth.getSession() : null;
    if (session?.error)
      throw new CommunityApiError(
        "Please sign in again.",
        "unauthenticated",
        401,
      );
    const token = session?.data.session?.access_token;
    const response = await fetch(`${apiUrl}/v1${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const payload = (await response.json()) as {
      data?: unknown;
      error?: { code?: string; message?: string };
    };
    if (!response.ok)
      throw new CommunityApiError(
        payload.error?.message ??
          "Unable to complete this request. Please try again.",
        payload.error?.code ?? "request_failed",
        response.status,
      );
    return payload.data;
  } catch (error) {
    if (
      error instanceof CommunityApiError ||
      (error instanceof Error && error.name === "AbortError")
    )
      throw error;
    throw new CommunityApiError(
      "Unable to connect right now. Please try again.",
      "network_error",
      0,
    );
  }
}
function query(values: Record<string, string | undefined>) {
  return new URLSearchParams(
    Object.entries(values).filter(
      (entry): entry is [string, string] => entry[1] !== undefined,
    ),
  ).toString();
}
export type SearchKind = "all" | "users" | "spaces" | "posts";
export async function searchCommunity(
  q: string,
  kind: SearchKind,
  cursor?: string,
  signal?: AbortSignal,
) {
  return searchResultSchema.parse(
    await request(`/explore?${query({ q, kind, cursor })}`, { signal }),
  );
}
export async function listSpaces(
  mine: boolean,
  cursor?: string,
  signal?: AbortSignal,
) {
  return pageSchema(spaceSchema).parse(
    await request(`/spaces?${query({ mine: String(mine), cursor })}`, {
      signal,
    }),
  );
}
export async function getSpace(id: string, signal?: AbortSignal) {
  return spaceSchema.parse(
    await request(`/spaces/${encodeURIComponent(id)}`, { signal }),
  );
}
export async function createSpace(input: CreateSpace) {
  return spaceSchema.parse(
    await request("/spaces", { method: "POST", body: JSON.stringify(input) }),
  );
}
export async function changeMembership(
  id: string,
  action: MembershipAction,
  userId?: string,
) {
  return spaceSchema.parse(
    await request(`/spaces/${encodeURIComponent(id)}/memberships`, {
      method: "POST",
      body: JSON.stringify({ action, ...(userId ? { userId } : {}) }),
    }),
  );
}
export async function listMembers(
  id: string,
  cursor?: string,
  signal?: AbortSignal,
) {
  return pageSchema(memberSchema).parse(
    await request(
      `/spaces/${encodeURIComponent(id)}/members?${query({ cursor })}`,
      { signal },
    ),
  );
}
export async function getPublicProfile(id: string, signal?: AbortSignal) {
  return publicProfileSchema.parse(
    await request(`/profiles/${encodeURIComponent(id)}`, { signal }),
  );
}
export async function getInsight(id: string, signal?: AbortSignal) {
  return visiblePostSchema.parse(
    await request(`/insights/${encodeURIComponent(id)}`, { signal }),
  );
}
export async function listProfilePosts(
  id: string,
  own: boolean,
  cursor?: string,
  signal?: AbortSignal,
) {
  return pageSchema(visiblePostSchema).parse(
    await request(
      `${own ? "/me" : `/profiles/${encodeURIComponent(id)}`}/posts?${query({ cursor })}`,
      { signal },
    ),
  );
}
export async function listSpacePosts(
  id: string,
  cursor?: string,
  signal?: AbortSignal,
) {
  return pageSchema(visiblePostSchema).parse(
    await request(
      `/spaces/${encodeURIComponent(id)}/posts?${query({ cursor })}`,
      { signal },
    ),
  );
}
export async function listPostingSpaces(cursor?: string, signal?: AbortSignal) {
  return pageSchema(spaceSchema).parse(await request(`/me/posting-spaces?${query({ cursor })}`, { signal }));
}
export async function submitSpacePost(spaceId: string, input: SubmitSpacePost) {
  return postSubmissionSchema.parse(await request(`/spaces/${encodeURIComponent(spaceId)}/posts`, {
    method: 'POST', body: JSON.stringify(input),
  }));
}
export const spaceLink = (space: Pick<Space, "id">) =>
  `#space/${encodeURIComponent(space.id)}`;
export const profileLink = (profile: Pick<PublicProfile, "id">) =>
  `#member/${encodeURIComponent(profile.id)}`;
export const insightLink = (post: Pick<VisiblePost, "id">) =>
  `#insight/${encodeURIComponent(post.id)}`;
export type { Space, VisiblePost, PublicProfile, Page };
