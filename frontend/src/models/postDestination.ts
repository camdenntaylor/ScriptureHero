import type { Space } from "@scripture-hero/contracts";

export const GLOBAL_SPACE_ID = "00000000-0000-4000-8000-000000000001";
export function canPostToSpace(space: Space): boolean {
  return space.id === GLOBAL_SPACE_ID || space.membership === "active";
}
export function destinationDescription(
  space: Pick<Space, "name" | "visibility">,
): string {
  return space.visibility === "private"
    ? `Your post will go to ${space.name}. Only members of this private Space can read it after approval.`
    : `Your post will go to ${space.name}. Anyone can read it after approval, including people outside this Space.`;
}

export type SubmissionAttempt = { id: string; spaceId: string; body: string };
export function submissionAttempt(
  previous: SubmissionAttempt | null,
  spaceId: string,
  body: string,
  newId: () => string,
): SubmissionAttempt {
  const trimmed = body.trim();
  return previous?.spaceId === spaceId && previous.body === trimmed
    ? previous
    : { id: newId(), spaceId, body: trimmed };
}
