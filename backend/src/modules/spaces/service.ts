import type { CreateSpace, MembershipAction } from "@scripture-hero/contracts";
import { AppError, notFound } from "../../shared/errors.js";
import { toPage, type PageRequest } from "../../shared/pagination.js";
import type { SpaceRepository } from "./model.js";

export class SpaceService {
  constructor(private readonly repository: SpaceRepository) {}
  async list(
    userId: string | null,
    query: PageRequest & { q?: string; mine?: boolean },
  ) {
    return toPage(
      await this.repository.list(userId, query),
      query.limit,
      (row) => ({ id: row.id, createdAt: row.createdAt }),
    );
  }
  async find(id: string, userId: string | null) {
    const space = await this.repository.find(id, userId);
    if (!space) throw notFound("This Space could not be found.");
    return space;
  }
  create(userId: string, input: CreateSpace) {
    return this.repository.create(userId, input);
  }
  async members(id: string, userId: string, query: PageRequest) {
    const space = await this.find(id, userId);
    if (space.ownerId !== userId)
      throw new AppError(
        403,
        "space_owner_required",
        "Only the Space owner can manage members.",
      );
    return toPage(
      await this.repository.members(id, query),
      query.limit,
      (row) => ({ createdAt: row.createdAt, id: row.user.id }),
    );
  }
  async change(
    id: string,
    actorId: string,
    targetId: string,
    action: MembershipAction,
  ) {
    const space = await this.find(id, actorId);
    if (["invite", "approve"].includes(action) && space.ownerId !== actorId)
      throw new AppError(
        403,
        "space_owner_required",
        "Only the Space owner can manage members.",
      );
    if (["join", "accept"].includes(action) && actorId !== targetId)
      throw new AppError(403, "forbidden", "You can only join for yourself.");
    if (
      action === "decline" &&
      actorId !== targetId &&
      space.ownerId !== actorId
    )
      throw new AppError(
        403,
        "forbidden",
        "You cannot change this membership.",
      );
    await this.repository.changeMembership(id, actorId, targetId, action);
    return this.find(id, actorId);
  }
}
