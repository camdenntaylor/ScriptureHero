import { describe, expect, it } from "vitest";
import type { Space } from "@scripture-hero/contracts";
import {
  canPostToSpace,
  destinationDescription,
  GLOBAL_SPACE_ID,
  submissionAttempt,
} from "./postDestination";

const space: Space = {
  id: "10000000-0000-4000-8000-000000000001",
  name: "Family circle",
  description: "",
  ownerId: null,
  visibility: "private",
  membership: "active",
  createdAt: "2026-10-28T00:00:00Z",
};
describe("post destination and retries", () => {
  it("makes public and private audiences explicit without claiming immediate publication", () => {
    expect(destinationDescription(space)).toContain("Family circle");
    expect(destinationDescription(space)).toContain(
      "Only members of this private Space can read it after approval.",
    );
    expect(
      destinationDescription({ name: "Global", visibility: "public" }),
    ).toContain(
      "Anyone can read it after approval, including people outside this Space.",
    );
  });
  it("allows Global and active members, never requests or invitations", () => {
    expect(
      canPostToSpace({ ...space, id: GLOBAL_SPACE_ID, membership: "none" }),
    ).toBe(true);
    expect(canPostToSpace(space)).toBe(true);
    for (const membership of ["none", "invited", "requested"] as const)
      expect(canPostToSpace({ ...space, membership })).toBe(false);
  });
  it("reuses the same ID after interrupted submissions and creates a fresh ID when destination or text changes", () => {
    let generated = 0;
    const newId = () => String(++generated);
    const first = submissionAttempt(null, space.id, " Hope ", newId);
    expect(submissionAttempt(first, space.id, "Hope", newId)).toBe(first);
    expect(generated).toBe(1);
    expect(submissionAttempt(first, GLOBAL_SPACE_ID, "Hope", newId).id).toBe(
      "2",
    );
    expect(submissionAttempt(first, space.id, "A new thought", newId).id).toBe(
      "3",
    );
  });
});
