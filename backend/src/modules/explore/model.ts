import type { PublicProfile, VisiblePost } from "@scripture-hero/contracts";
import type { PageRequest } from "../../shared/pagination.js";

export type PostQuery = PageRequest & {
  q?: string;
  authorId?: string;
  own?: boolean;
  spaceId?: string;
};
export interface ExploreRepository {
  profiles(query: PageRequest & { q?: string }): Promise<PublicProfile[]>;
  profile(id: string): Promise<PublicProfile | null>;
  posts(userId: string | null, query: PostQuery): Promise<VisiblePost[]>;
  post(id: string, userId: string | null): Promise<VisiblePost | null>;
}
