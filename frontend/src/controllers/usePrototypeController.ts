import { useEffect, useRef, useState } from "react";
import {
  addToHelplist,
  getHeroes,
  resourceIdFromHash,
  screenFromHash,
  screenForAccount,
  type FeedFilter,
  type Insight,
  type Person,
} from "../models/prototype";
import { insights } from "../services/prototypeData";
import { copyInsight } from "../services/prototypeSharing";
import {
  createMyQuestion,
  deleteMyQuestion,
  getMyProfile,
  listMyQuestions,
  saveMyProfile,
  uploadAvatar,
  type AccountProfile,
  type PrivateQuestion,
} from "../services/accountApi";
import { supabase } from "../services/supabase";
import posthog from "../posthog";
import { posthogLog } from "../posthogLogger";
import { useMessagingController } from "./useMessagingController";
import { useAppearanceController } from "./useAppearanceController";
import type { PostSubmission } from "@scripture-hero/contracts";

export type PrototypeDialog =
  | { type: "save"; post: Insight }
  | { type: "message"; person: Person; thanks: true }
  | { type: "share"; post: Insight }
  | { type: "compose"; spaceId?: string }
  | null;

export function usePrototypeController() {
  const [screen, setScreen] = useState(() =>
    screenFromHash(window.location.hash),
  );
  const [resourceId, setResourceId] = useState(() =>
    resourceIdFromHash(window.location.hash),
  );
  const [saved, setSaved] = useState<{ postId: string; questionId: string }[]>(
    [],
  );
  const [liked, setLiked] = useState<string[]>([]);
  const [comments, setComments] = useState<Record<string, string[]>>({});
  const [filter, setFilter] = useState<FeedFilter>("for-you");
  const [dialog, setDialog] = useState<PrototypeDialog>(null);
  const [notice, setNotice] = useState("");
  const [thanked, setThanked] = useState<string[]>([]);
  const [postRevision, setPostRevision] = useState(0);
  const [lastPostSubmission, setLastPostSubmission] =
    useState<PostSubmission | null>(null);
  const [promptDraft, setPromptDraft] = useState<string | null>(null);
  // Demo-only: not part of the real AccountProfile, never sent to the backend.
  const [favoriteVerse, setFavoriteVerse] = useState("");
  const [viewedPersonId, setViewedPersonId] = useState<string | null>(null);
  const [viewedPostId, setViewedPostId] = useState<string | null>(null);

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const messaging = useMessagingController(profile?.id ?? null);
  const appearance = useAppearanceController();
  const [questions, setQuestions] = useState<PrivateQuestion[]>([]);
  const [authLoading, setAuthLoading] = useState(Boolean(supabase));
  const [accountError, setAccountError] = useState("");
  const signedIn = Boolean(profile);
  const currentScreen = screenForAccount(screen, signedIn);
  const loadVersion = useRef(0);

  async function refreshAccount() {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }
    const version = ++loadVersion.current;
    setAuthLoading(true);
    setProfile(null);
    setLastPostSubmission(null);
    setQuestions([]);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (version !== loadVersion.current) return;
      if (error || !user) {
        setProfile(null);
        setQuestions([]);
        setSaved([]);
        setAccountError("");
        return;
      }
      posthog.identify(user.id, user.email ? { email: user.email } : undefined);
      const [nextProfile, nextQuestions] = await Promise.all([
        getMyProfile(),
        listMyQuestions(),
      ]);
      if (version !== loadVersion.current) return;
      if (nextProfile.name)
        posthog.setPersonProperties({ name: nextProfile.name });
      setProfile(nextProfile);
      setQuestions(nextQuestions);
      setAccountError("");
    } catch (error) {
      if (version === loadVersion.current)
        setAccountError(
          error instanceof Error
            ? error.message
            : "Unable to load your account.",
        );
    } finally {
      if (version === loadVersion.current) setAuthLoading(false);
    }
  }

  useEffect(() => {
    void refreshAccount();
    if (!supabase) return;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        posthog.reset();
        ++loadVersion.current;
        setProfile(null);
        setQuestions([]);
        setSaved([]);
        setDialog(null);
        setLastPostSubmission(null);
        setPostRevision(0);
        setThanked([]);
        setAccountError("");
        setAuthLoading(false);
        messaging.reset();
      }
      if (event === "SIGNED_IN")
        window.setTimeout(() => void refreshAccount(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const navigate = () => {
      // The keyboard skip link moves focus within the current screen.
      if (window.location.hash === "#main-content") return;
      const next = screenFromHash(window.location.hash);
      setScreen(next);
      setResourceId(resourceIdFromHash(window.location.hash));
      setDialog(null);
    };
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  useEffect(() => {
    if (profile && screenForAccount(screen, true) !== screen)
      window.location.replace("#home");
  }, [profile, screen]);

  useEffect(() => {
    const titles = {
      explore: "Explore",
      space: "Space overview",
      "create-space": "Create a Space",
      member: "Member profile",
      insight: "Insight",
      welcome: "Learn through connection",
      home: "Your home",
      heroes: "Scripture Heroes",
      messages: "Messages",
      chat: "Conversation",
      notifications: "Notifications",
      spaces: "Spaces",
      library: "Questions library",
      profile: "Your profile",
      "profile-edit": "Edit profile",
      questions: "Your Soul Questions",
      "settings-privacy": "Account & privacy",
      appearance: "Appearance",
      "public-profile": "Member profile",
      about: "About",
      help: "Help & support",
      terms: "Terms",
      privacy: "Privacy",
      "blocked-accounts": "Blocked accounts",
      "delete-account": "Delete account",
      post: "Insight",
      report: "Report post",
      "settings-account": "Account settings",
      invite: "Invite friends",
      "notification-settings": "Notification preferences",
      login: "Sign in",
    };
    const title = titles[currentScreen];
    document.title = `${title} · Scripture Hero`;
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("main-content")?.focus({ preventScroll: true });
  }, [currentScreen, signedIn, resourceId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 6000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const heroes = getHeroes(insights, saved);
  const visiblePosts =
    filter === "saved"
      ? insights.filter((post) => saved.some((item) => item.postId === post.id))
      : insights;

  async function signIn(email: string, password: string) {
    if (!supabase) throw new Error("Supabase is not configured for this site.");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error)
      throw new Error(
        "Unable to sign in. Check your email and password, then try again.",
      );
    posthog.capture("sign_in_completed");
    posthogLog.signInCompleted();
    setAuthLoading(true);
    window.location.hash = "#home";
  }
  async function signUp(email: string, password: string) {
    if (!supabase) throw new Error("Supabase is not configured for this site.");
    const redirectTo =
      import.meta.env.VITE_AUTH_REDIRECT_URL ?? window.location.origin;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error)
      throw new Error(
        "Unable to create the account. Check your details and try again.",
      );
    posthog.capture("sign_up_completed", { signed_in: Boolean(data.session) });
    if (data.session) {
      setAuthLoading(true);
      window.location.hash = "#home";
      return "signed-in" as const;
    }
    return "check-email" as const;
  }
  async function signOut() {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setNotice("Unable to sign out. Try again.");
        return;
      }
    }
    ++loadVersion.current;
    setProfile(null);
    setQuestions([]);
    setSaved([]);
    setFilter("for-you");
    setDialog(null);
    setPostRevision(0);
    setLastPostSubmission(null);
    setComments({});
    setLiked([]);
    setThanked([]);
    messaging.reset();
    setFavoriteVerse("");
    window.location.hash = "#welcome";
  }
  async function updateProfile(
    details: Pick<AccountProfile, "name" | "location" | "bio">,
  ) {
    const next = await saveMyProfile(details);
    posthog.capture("profile_updated");
    posthogLog.profileUpdated();
    setProfile(next);
    setNotice("Profile updated.");
  }
  async function updatePhoto(file: File) {
    if (!profile) throw new Error("Please sign in again.");
    const next = await uploadAvatar(file, profile.id);
    posthog.capture("profile_photo_uploaded");
    setProfile(next);
    setNotice("Profile photo uploaded.");
  }
  async function addQuestion(value: string) {
    const title = value.trim().slice(0, 500);
    if (!profile || !title)
      throw new Error("Please sign in and enter a question.");
    const next = await createMyQuestion(title, crypto.randomUUID());
    posthog.capture("soul_question_created");
    setQuestions((current) => [next, ...current]);
    setNotice("Soul Question recorded privately.");
  }
  async function removeQuestion(id: string) {
    await deleteMyQuestion(id);
    posthog.capture("soul_question_deleted");
    setQuestions((current) => current.filter((question) => question.id !== id));
    setSaved((current) => current.filter((item) => item.questionId !== id));
    setNotice("Soul Question removed.");
  }

  function toggleLike(id: string) {
    const selected = !liked.includes(id);
    posthog.capture("insight_reaction_toggled", { insight_id: id, selected });
    setLiked((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }
  function addComment(postId: string, value: string) {
    const body = value.trim();
    if (!body) return;
    posthog.capture("comment_created", { insight_id: postId });
    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), body.slice(0, 500)],
    }));
    setNotice("Comment added to this demo.");
  }
  function save(post: Insight, questionId: string) {
    if (!profile || !questions.some((question) => question.id === questionId))
      return;
    posthog.capture("insight_saved", { insight_id: post.id });
    setSaved((current) => addToHelplist(current, post.id, questionId));
    setDialog(null);
    setNotice(
      `Saved privately. ${post.author.name.split(" ")[0]} is in your Scripture Heroes.`,
    );
  }
  function removeSaved(postId: string) {
    posthog.capture("insight_removed", { insight_id: postId });
    setSaved((current) => current.filter((item) => item.postId !== postId));
    setNotice("Insight removed from your helplist.");
  }
  async function share(post: Insight) {
    try {
      await copyInsight(post);
      posthog.capture("insight_shared", { insight_id: post.id });
      setNotice("Insight copied. You can paste it into a message.");
    } catch {
      setDialog({ type: "share", post });
    }
  }
  function sendDemoMessage(person: Person, body: string, anonymous: boolean) {
    if (!messaging.sendThanks(person, body, anonymous)) return false;
    posthog.capture("thanks_sent", { anonymous });
    setThanked((current) =>
      current.includes(person.id) ? current : [...current, person.id],
    );
    setDialog(null);
    setNotice("Thank-you note saved in this demo.");
    return true;
  }
  function onPostSubmitted(receipt: PostSubmission) {
    posthog.capture("insight_submitted");
    setPostRevision((current) => current + 1);
    setLastPostSubmission(receipt);
    setDialog(null);
    setNotice(
      `Insight submitted to ${receipt.space.name}. You can find it under Your posts.`,
    );
  }
  return {
    screen: currentScreen,
    resourceId,
    profile,
    questions,
    authLoading,
    accountError,
    refreshAccount,
    signIn,
    signUp,
    signOut,
    updateProfile,
    updatePhoto,
    addQuestion,
    removeQuestion,
    saved,
    liked,
    comments,
    filter,
    setFilter,
    dialog,
    setDialog,
    notice,
    setNotice,
    thanked,
    postRevision,
    lastPostSubmission,
    heroes,
    visiblePosts,
    toggleLike,
    addComment,
    save,
    removeSaved,
    share,
    sendDemoMessage,
    onPostSubmitted,
    promptDraft,
    setPromptDraft,
    favoriteVerse,
    setFavoriteVerse,
    messaging,
    appearance,
    viewedPersonId,
    setViewedPersonId,
    viewedPostId,
    setViewedPostId,
  };
}

export type PrototypeController = ReturnType<typeof usePrototypeController>;
