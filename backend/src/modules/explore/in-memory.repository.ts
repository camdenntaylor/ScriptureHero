import type { PublicProfile, VisiblePost } from "@scripture-hero/contracts";
import type { InMemoryDatabase } from "../../shared/in-memory-database.js";
import { sliceCursorPage, type PageRequest } from "../../shared/pagination.js";
import { GLOBAL_SPACE_ID } from "../../shared/supabase.js";
import type { ExploreRepository, PostQuery } from "./model.js";

export class InMemoryExploreRepository implements ExploreRepository {
  constructor(private readonly db: InMemoryDatabase) {}
  async profile(id: string): Promise<PublicProfile | null> {
    const p = this.db.profiles.get(id);
    return p
      ? {
          id: p.id,
          name: p.displayName,
          bio: "",
          location: "",
          avatarPath: null,
          createdAt: p.createdAt ?? this.db.now(),
        }
      : null;
  }
  async profiles(query: PageRequest & { q?: string }) {
    const rows = await Promise.all(
      [...this.db.profiles.keys()].map((id) => this.profile(id)),
    );
    return sliceCursorPage(
      rows.filter((p): p is PublicProfile =>
        Boolean(
          p &&
          (!query.q || p.name.toLowerCase().includes(query.q.toLowerCase())),
        ),
      ),
      (p) => p,
      query,
      "desc",
    );
  }
  private async visible(
    userId: string | null,
    own: boolean,
  ): Promise<VisiblePost[]> {
    const rows: VisiblePost[] = [];
    for (const p of this.db.posts) {
      const s = this.db.spaces.get(p.spaceId ?? GLOBAL_SPACE_ID);
      if (
        !s ||
        (s.visibility === "private" &&
          this.db.memberships.get(`${s.id}:${userId}`)?.status !== "active")
      )
        continue;
      if (p.status !== "published" && !(own && p.authorId === userId)) continue;
      const author = await this.profile(p.authorId);
      if (author)
        rows.push({
          id: p.id,
          author,
          title: p.title,
          body: p.body,
          scriptureReference: p.scriptureReference,
          createdAt: p.createdAt,
          space: { id: s.id, name: s.name, visibility: s.visibility },
          status: p.status,
        });
    }
    return rows;
  }
  async posts(userId: string | null, query: PostQuery) {
    const rows = (await this.visible(userId, Boolean(query.own))).filter(
      (p) =>
        (!query.authorId || p.author.id === query.authorId) &&
        (!query.spaceId || p.space.id === query.spaceId) &&
        (!query.q ||
          `${p.title ?? ""} ${p.body} ${p.scriptureReference ?? ""}`
            .toLowerCase()
            .includes(query.q.toLowerCase())),
    );
    return sliceCursorPage(rows, (p) => p, query, "desc");
  }
  async post(id: string, userId: string | null) {
    return (await this.visible(userId, true)).find((p) => p.id === id) ?? null;
  }
}
