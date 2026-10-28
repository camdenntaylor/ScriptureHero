import type { PublicProfile } from "@scripture-hero/contracts";
import { normalizeTimestamp } from "../../shared/supabase.js";

export const profileColumns =
  "id,display_name,bio,location,avatar_path,created_at";
export type ProfileRow = {
  id: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  avatar_path: string | null;
  created_at: string;
};
export const toProfile = (p: ProfileRow): PublicProfile => ({
  id: p.id,
  name: p.display_name,
  bio: p.bio ?? "",
  location: p.location ?? "",
  avatarPath: p.avatar_path,
  createdAt: normalizeTimestamp(p.created_at),
});
