import type { VisiblePost } from "@scripture-hero/contracts";
import {
  keysetFilter,
  normalizeTimestamp,
  unwrap,
  type ClientSource,
} from "../../shared/supabase.js";
import type { PageRequest } from "../../shared/pagination.js";
import type { ExploreRepository, PostQuery } from "./model.js";
import {
  profileColumns,
  toProfile,
  type ProfileRow,
} from "../profiles/public-profile.js";

type PostRow = {
  id: string;
  title: string | null;
  body: string;
  scripture_reference: string | null;
  status: VisiblePost["status"];
  created_at: string;
  author: ProfileRow;
  space: { id: string; name: string; visibility: string };
};
const postColumns = `id,title,body,scripture_reference,status,created_at,author:profiles!posts_author_id_fkey(${profileColumns}),space:spaces!inner(id,name,visibility)`;
const toPost = (p: PostRow): VisiblePost => ({
  id: p.id,
  title: p.title,
  body: p.body,
  scriptureReference: p.scripture_reference,
  status: p.status,
  createdAt: normalizeTimestamp(p.created_at),
  author: toProfile(p.author),
  space: {
    id: p.space.id,
    name: p.space.name,
    visibility: p.space.visibility === "restricted" ? "private" : "public",
  },
});
export class SupabaseExploreRepository implements ExploreRepository {
  constructor(private readonly source: ClientSource) {}
  private get client() {
    return this.source.current();
  }
  async profiles(query: PageRequest & { q?: string }) {
    let request = this.client.from("profiles").select(profileColumns);
    if (query.q)
      request = request.ilike(
        "display_name",
        `%${query.q.replace(/[\\%_]/g, "\\$&")}%`,
      );
    if (query.cursor)
      request = request.or(
        keysetFilter(query.cursor, "desc", "created_at", "id"),
      );
    return (
      unwrap(
        await request
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(query.limit + 1),
        "Search profiles",
      ) as ProfileRow[]
    ).map(toProfile);
  }
  async profile(id: string) {
    const rows = unwrap(
      await this.client
        .from("profiles")
        .select(profileColumns)
        .eq("id", id)
        .limit(1),
      "Read public profile",
    ) as ProfileRow[];
    return rows[0] ? toProfile(rows[0]) : null;
  }
  async posts(userId: string | null, query: PostQuery) {
    // visible_posts is a security-invoker view; both its explicit visibility
    // predicate and posts RLS apply before LIMIT and keyset pagination.
    let request = this.client.from("visible_posts").select(postColumns);
    if (query.own && userId) request = request.eq("author_id", userId);
    else request = request.eq("status", "published");
    if (query.authorId) request = request.eq("author_id", query.authorId);
    if (query.spaceId) request = request.eq("space_id", query.spaceId);
    if (query.q)
      request = request.ilike(
        "search_text",
        `%${query.q.replace(/[\\%_]/g, "\\$&")}%`,
      );
    if (query.cursor)
      request = request.or(
        keysetFilter(query.cursor, "desc", "created_at", "id"),
      );
    return (
      unwrap(
        await request
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(query.limit + 1),
        "Search posts",
      ) as unknown as PostRow[]
    ).map(toPost);
  }
  async post(id: string, _userId: string | null) {
    const rows = unwrap(
      await this.client
        .from("visible_posts")
        .select(postColumns)
        .eq("id", id)
        .limit(1),
      "Read post",
    ) as unknown as PostRow[];
    return rows[0] ? toPost(rows[0]) : null;
  }
}
