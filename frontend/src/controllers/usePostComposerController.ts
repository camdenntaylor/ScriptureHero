import { useEffect, useRef, useState } from "react";
import type { PostSubmission } from "@scripture-hero/contracts";
import {
  getSpace,
  listPostingSpaces,
  submitSpacePost,
} from "../services/communityApi";
import { usePagedResource, useResource } from "./useCommunityController";
import {
  canPostToSpace,
  submissionAttempt,
  type SubmissionAttempt,
} from "../models/postDestination";

export function usePostComposerController(
  accountId: string | null,
  initialSpaceId: string | undefined,
  onSubmitted: (receipt: PostSubmission) => void,
) {
  const spaces = usePagedResource(
    accountId ? `posting-spaces:${accountId}` : null,
    (cursor, signal) => listPostingSpaces(cursor, signal),
  );
  const context = useResource(
    accountId && initialSpaceId
      ? `posting-context:${accountId}:${initialSpaceId}`
      : null,
    (signal) => getSpace(initialSpaceId!, signal),
  );
  const [body, setBody] = useState("");
  const [spaceId, setSpaceId] = useState(initialSpaceId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const attempt = useRef<SubmissionAttempt | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const choices = [
    ...new Map(
      [...spaces.items, ...(context.value ? [context.value] : [])]
        .filter(canPostToSpace)
        .map((s) => [s.id, s]),
    ).values(),
  ];
  const selected = choices.find((s) => s.id === spaceId);
  const blocked =
    !accountId || !selected || !body.trim() || body.length > 1500 || pending;
  async function submit() {
    if (busy.current || blocked || !selected) return;
    busy.current = true;
    setPending(true);
    setError("");
    const next = submissionAttempt(attempt.current, selected.id, body, () =>
      crypto.randomUUID(),
    );
    attempt.current = next;
    try {
      const receipt = await submitSpacePost(next.spaceId, {
        id: next.id,
        body: next.body,
      });
      if (mounted.current) onSubmitted(receipt);
    } catch (err) {
      if (mounted.current)
        setError(
          err instanceof Error
            ? err.message
            : "Unable to submit your insight. Please try again.",
        );
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  }
  return {
    spaces,
    context,
    choices,
    body,
    setBody,
    spaceId,
    setSpaceId,
    selected,
    pending,
    error,
    blocked,
    submit,
  };
}
