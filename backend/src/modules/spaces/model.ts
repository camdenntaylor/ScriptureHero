import type {
  CreateSpace,
  MembershipAction,
  Space,
  SpaceMember,
} from "@scripture-hero/contracts";
import type { PageRequest } from "../../shared/pagination.js";

export interface SpaceRepository {
  list(
    userId: string | null,
    query: PageRequest & { q?: string; mine?: boolean; posting?: boolean },
  ): Promise<Space[]>;
  find(id: string, userId: string | null): Promise<Space | null>;
  create(userId: string, input: CreateSpace): Promise<Space>;
  members(id: string, query: PageRequest): Promise<SpaceMember[]>;
  changeMembership(
    id: string,
    actorId: string,
    userId: string,
    action: MembershipAction,
  ): Promise<void>;
}
