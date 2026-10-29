import type {
  CreateSpace,
  MembershipAction,
  Space,
  SpaceMember,
} from "@scripture-hero/contracts";
import type { InMemoryDatabase } from "../../shared/in-memory-database.js";
import { AppError, notFound } from "../../shared/errors.js";
import { sliceCursorPage, type PageRequest } from "../../shared/pagination.js";
import { GLOBAL_SPACE_ID } from "../../shared/supabase.js";
import type { SpaceRepository } from "./model.js";

export class InMemorySpaceRepository implements SpaceRepository {
  constructor(private readonly db: InMemoryDatabase) {}
  async find(id: string, userId: string | null): Promise<Space | null> {
    const space = this.db.spaces.get(id);
    return space
      ? {
          ...space,
          membership:
            this.db.memberships.get(`${id}:${userId}`)?.status ?? "none",
        }
      : null;
  }
  async list(
    userId: string | null,
    query: PageRequest & { q?: string; mine?: boolean; posting?: boolean },
  ) {
    const rows = await Promise.all(
      [...this.db.spaces.keys()].map((id) => this.find(id, userId)),
    );
    return sliceCursorPage(
      rows.filter((s): s is Space =>
        Boolean(
          s &&
          (!query.q || s.name.toLowerCase().includes(query.q.toLowerCase())) &&
          (!query.mine || s.membership !== "none" || s.id === GLOBAL_SPACE_ID) &&
          (!query.posting || s.membership === 'active' || s.id === GLOBAL_SPACE_ID),
        ),
      ),
      (s) => s,
      query,
      "desc",
    );
  }
  async create(userId: string, input: CreateSpace) {
    if (!this.db.profiles.has(userId))
      throw new AppError(
        409,
        "profile_required",
        "Finish setting up your profile first.",
      );
    const existing = this.db.spaces.get(input.id);
    if (existing && existing.ownerId !== userId)
      throw new AppError(
        409,
        "space_exists",
        "This Space identifier is already in use.",
      );
    if (!existing) {
      this.db.spaces.set(input.id, {
        ...input,
        ownerId: userId,
        createdAt: this.db.now(),
        membership: "none",
      });
      this.db.memberships.set(`${input.id}:${userId}`, {
        spaceId: input.id,
        userId,
        status: "active",
        createdAt: this.db.now(),
      });
    }
    return (await this.find(input.id, userId))!;
  }
  async members(id: string, query: PageRequest): Promise<SpaceMember[]> {
    const rows = [...this.db.memberships.values()]
      .filter((m) => m.spaceId === id)
      .map((m) => {
        const p = this.db.profiles.get(m.userId)!;
        return {
          user: {
            id: p.id,
            name: p.displayName,
            bio: "",
            location: "",
            avatarPath: null,
            createdAt: p.createdAt ?? this.db.now(),
          },
          status: m.status,
          createdAt: m.createdAt,
        };
      });
    return sliceCursorPage(
      rows,
      (r) => ({ createdAt: r.createdAt, id: r.user.id }),
      query,
      "desc",
    );
  }
  async changeMembership(
    id: string,
    actorId: string,
    userId: string,
    action: MembershipAction,
  ) {
    const space = this.db.spaces.get(id);
    if (!space || !this.db.profiles.has(userId)) throw notFound();
    const key = `${id}:${userId}`;
    const current = this.db.memberships.get(key);
    if (space.ownerId === userId && action === "decline")
      throw new AppError(
        409,
        "owner_membership",
        "The owner must remain a member.",
      );
    if (action === "decline") {
      if (current?.status !== "active") this.db.memberships.delete(key);
      return;
    }
    let status = current?.status;
    if (action === "join")
      status =
        status === "invited" ||
        status === "active" ||
        space.visibility === "public"
          ? "active"
          : "requested";
    if (action === "accept") {
      if (status !== "active" && status !== "invited")
        throw new AppError(
          409,
          "invitation_required",
          "There is no invitation to accept.",
        );
      status = "active";
    }
    if (action === "invite" && status !== "active") status = "invited";
    if (action === "approve") {
      if (status !== "active" && status !== "requested")
        throw new AppError(
          409,
          "request_required",
          "There is no pending request.",
        );
      status = "active";
    }
    this.db.memberships.set(key, {
      spaceId: id,
      userId,
      status: status!,
      createdAt: current?.createdAt ?? this.db.now(),
    });
  }
}
