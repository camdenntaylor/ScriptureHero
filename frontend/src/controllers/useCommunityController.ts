import { useEffect, useRef, useState } from "react";
import type { Page, Space } from "@scripture-hero/contracts";
import {
  changeMembership,
  createSpace,
  getSpace,
  listMembers,
  listSpacePosts,
  searchCommunity,
  type SearchKind,
} from "../services/communityApi";

const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Unable to load this right now. Please try again.";
export function usePagedResource<T>(
  key: string | null,
  loader: (cursor: string | undefined, signal: AbortSignal) => Promise<Page<T>>,
) {
  const load = useRef(loader);
  load.current = loader;
  const version = useRef(0);
  const abort = useRef<AbortController | null>(null);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    key: string | null;
    items: T[];
    nextCursor: string | null;
    loading: boolean;
    error: string;
  }>({ key, items: [], nextCursor: null, loading: key !== null, error: "" });
  async function fetchPage(cursor?: string) {
    if (key === null) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    const current = ++version.current;
    setState((s) => ({
      key,
      items: cursor && s.key === key ? s.items : [],
      nextCursor: cursor ?? null,
      loading: true,
      error: "",
    }));
    try {
      const page = await load.current(cursor, controller.signal);
      if (current === version.current && !controller.signal.aborted)
        setState((s) => ({
          key,
          items: cursor ? [...s.items, ...page.items] : page.items,
          nextCursor: page.nextCursor,
          loading: false,
          error: "",
        }));
    } catch (error) {
      if (current === version.current && !controller.signal.aborted)
        setState((s) => ({ ...s, loading: false, error: message(error) }));
    }
  }
  useEffect(() => {
    if (key !== null) void fetchPage();
    else
      setState({ key, items: [], nextCursor: null, loading: false, error: "" });
    return () => {
      ++version.current;
      abort.current?.abort();
    };
  }, [key, revision]);
  const visible =
    state.key === key
      ? state
      : { items: [], nextCursor: null, loading: key !== null, error: "" };
  return {
    ...visible,
    refresh: () => setRevision((r) => r + 1),
    more: () => {
      if (!visible.loading) void fetchPage(visible.nextCursor ?? undefined);
    },
  };
}
export function useResource<T>(
  key: string | null,
  loader: (signal: AbortSignal) => Promise<T>,
) {
  const page = usePagedResource(key, async (_cursor, signal) => ({
    items: [await loader(signal)],
    nextCursor: null,
  }));
  return { ...page, value: page.items[0] };
}
export function useExploreController(accountId: string | null) {
  const [term, setTerm] = useState("");
  const [kind, setKind] = useState<SearchKind>("all");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const results = usePagedResource(
    submitted === null ? null : JSON.stringify([accountId, submitted, kind]),
    async (cursor, signal) => {
      const result = await searchCommunity(
        submitted ?? "",
        kind,
        cursor,
        signal,
      );
      const nextCursor = kind === "all" ? null : result[kind].nextCursor;
      return { items: [result], nextCursor };
    },
  );
  return {
    term,
    setTerm,
    kind,
    setKind,
    submitted,
    search: () => setSubmitted(term.trim()),
    results,
  };
}
export function useSpaceController(id: string, accountId: string | null) {
  const space = useResource(JSON.stringify([id, accountId]), (signal) =>
    getSpace(id, signal),
  );
  const canRead =
    space.value?.visibility === "public" ||
    space.value?.membership === "active";
  const posts = usePagedResource(
    canRead ? JSON.stringify([id, accountId, "posts"]) : null,
    (cursor, signal) => listSpacePosts(id, cursor, signal),
  );
  const owner = Boolean(accountId && space.value?.ownerId === accountId);
  const members = usePagedResource(
    owner ? `${id}:${accountId}:members` : null,
    (cursor, signal) => listMembers(id, cursor, signal),
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const busy = useRef(false);
  async function act(
    action: Parameters<typeof changeMembership>[1],
    userId?: string,
  ) {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    setNotice("");
    try {
      const updated = await changeMembership(id, action, userId);
      setNotice(
        action === "invite"
          ? "Invitation sent. They can accept it from their Spaces page."
          : action === "approve"
            ? "Request approved."
            : action === "decline"
              ? "Invitation or request dismissed."
              : updated.membership === "requested"
                ? "Your request was sent to the Space owner."
                : "You’re a member of this Space.",
      );
      space.refresh();
      members.refresh();
      posts.refresh();
    } catch (err) {
      setError(message(err));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return { space, posts, members, owner, canRead, pending, error, notice, act };
}
export function useCreateSpaceController() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<Space["visibility"]>("private");
  const id = useRef<string | null>(null);
  const busy = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit() {
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setError("");
    id.current ??= crypto.randomUUID();
    try {
      const space = await createSpace({
        id: id.current,
        name: name.trim(),
        description: description.trim(),
        visibility,
      });
      window.location.hash = `#space/${space.id}`;
    } catch (err) {
      setError(message(err));
    } finally {
      busy.current = false;
      setPending(false);
    }
  }
  return {
    name,
    setName,
    description,
    setDescription,
    visibility,
    setVisibility,
    pending,
    error,
    submit,
  };
}
