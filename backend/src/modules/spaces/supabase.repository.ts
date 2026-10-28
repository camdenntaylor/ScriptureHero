import type {
  CreateSpace,
  MembershipAction,
  Space,
  SpaceMember,
} from "@scripture-hero/contracts";
import { AppError } from "../../shared/errors.js";
import {
  keysetFilter,
  normalizeTimestamp,
  unwrap,
  type ClientSource,
} from "../../shared/supabase.js";
import type { PageRequest } from "../../shared/pagination.js";
import type { SpaceRepository } from "./model.js";
import {
  profileColumns,
  toProfile,
  type ProfileRow,
} from "../profiles/public-profile.js";

type SpaceRow = {
  id: string;
  name: string;
  description: string;
  visibility: string;
  owner_id: string | null;
  created_at: string;
};
const columns = "id,name,description,visibility,owner_id,created_at";
export class SupabaseSpaceRepository implements SpaceRepository {
  constructor(private readonly source: ClientSource) {}
  private get client() {
    return this.source.current();
  }
  private async map(rows: SpaceRow[], userId: string | null): Promise<Space[]> {
    const memberships =
      userId && rows.length
        ? unwrap(
            await this.client
              .from("space_members")
              .select("space_id,status")
              .eq("user_id", userId)
              .in(
                "space_id",
                rows.map((r) => r.id),
              ),
            "Read memberships",
          )
        : [];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      visibility: row.visibility === "restricted" ? "private" : "public",
      ownerId: row.owner_id,
      createdAt: normalizeTimestamp(row.created_at),
      membership:
        memberships.find((m) => m.space_id === row.id)?.status ?? "none",
    }));
  }
  async list(
    userId: string | null,
    query: PageRequest & { q?: string; mine?: boolean },
  ) {
    // A computed RPC applies membership filtering before pagination.
    let request = query.mine
      ? this.client.rpc("my_spaces").select(columns)
      : this.client.from("spaces").select(columns);
    if (query.q)
      request = request.ilike(
        "name",
        `%${query.q.replace(/[\\%_]/g, "\\$&")}%`,
      );
    if (query.cursor)
      request = request.or(
        keysetFilter(query.cursor, "desc", "created_at", "id"),
      );
    return this.map(
      unwrap(
        await request
          .order("created_at", { ascending: false })
          .order("id", { ascending: false })
          .limit(query.limit + 1),
        "List Spaces",
      ) as SpaceRow[],
      userId,
    );
  }
  async find(id: string, userId: string | null) {
    const row = unwrap(
      await this.client.from("spaces").select(columns).eq("id", id).limit(1),
      "Find Space",
    ) as SpaceRow[];
    return (await this.map(row, userId))[0] ?? null;
  }
  async create(userId: string, input: CreateSpace) {
    await this.rpc("create_space", {
      p_id: input.id,
      p_name: input.name,
      p_description: input.description,
      p_visibility: input.visibility === "private" ? "restricted" : "public",
    });
    return (await this.find(input.id, userId))!;
  }
  async members(id: string, query: PageRequest): Promise<SpaceMember[]> {
    let request = this.client
      .from("space_members")
      .select(
        `user:profiles!space_members_user_id_fkey(${profileColumns}),status,created_at`,
      )
      .eq("space_id", id);
    if (query.cursor)
      request = request.or(
        keysetFilter(query.cursor, "desc", "created_at", "user_id"),
      );
    const rows = unwrap(
      await request
        .order("created_at", { ascending: false })
        .order("user_id", { ascending: false })
        .limit(query.limit + 1),
      "List members",
    ) as unknown as {
      user: ProfileRow;
      status: SpaceMember["status"];
      created_at: string;
    }[];
    return rows.map((row) => ({
      user: toProfile(row.user),
      status: row.status,
      createdAt: normalizeTimestamp(row.created_at),
    }));
  }
  async changeMembership(
    id: string,
    _actorId: string,
    userId: string,
    action: MembershipAction,
  ) {
    await this.rpc("change_space_membership", {
      p_space: id,
      p_user: userId,
      p_action: action,
    });
  }
  private async rpc(name: string, args: Record<string, string>) {
    const result = await this.client.rpc(name, args);
    if (result.error?.code === "42501")
      throw new AppError(403, "forbidden", "You cannot change this Space.");
    if (result.error?.code === "P0002")
      throw new AppError(
        404,
        "not_found",
        "This Space or member could not be found.",
      );
    if (result.error?.code === "23503")
      throw new AppError(
        409,
        "profile_required",
        "Finish setting up your profile first.",
      );
    if (["23505", "23514"].includes(result.error?.code ?? ""))
      throw new AppError(
        409,
        "membership_conflict",
        "This action is no longer available. Refresh and try again.",
      );
    if (result.error)
      throw new Error(`Space action failed (${result.error.code})`);
  }
}
