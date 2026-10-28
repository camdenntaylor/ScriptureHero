import type { ExploreRepository, PostQuery } from "./model.js";
import { notFound } from "../../shared/errors.js";
import { toPage, type PageRequest } from "../../shared/pagination.js";

export class ExploreService {
  constructor(private readonly repository: ExploreRepository) {}
  async profiles(query: PageRequest & { q?: string }) {
    return toPage(await this.repository.profiles(query), query.limit, (p) => ({
      id: p.id,
      createdAt: p.createdAt,
    }));
  }
  async profile(id: string) {
    const p = await this.repository.profile(id);
    if (!p) throw notFound("This profile could not be found.");
    return p;
  }
  async posts(userId: string | null, query: PostQuery) {
    return toPage(
      await this.repository.posts(userId, query),
      query.limit,
      (p) => ({ id: p.id, createdAt: p.createdAt }),
    );
  }
  async post(id: string, userId: string | null) {
    const p = await this.repository.post(id, userId);
    if (!p) throw notFound("This insight could not be found.");
    return p;
  }
}
