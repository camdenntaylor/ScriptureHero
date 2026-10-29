import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PrototypeController } from "../../controllers/usePrototypeController";
import { usePostComposerController } from "../../controllers/usePostComposerController";
import { ComposePostForm } from "./ComposePostForm";

vi.mock("../../controllers/usePostComposerController", () => ({
  usePostComposerController: vi.fn(),
}));
const app = {
  profile: { id: "account" },
  dialog: { type: "compose" },
  onPostSubmitted: vi.fn(),
} as unknown as PrototypeController;
const selected = {
  id: "space",
  name: "Family circle",
  visibility: "private",
  membership: "active",
};
beforeEach(() => {
  vi.mocked(usePostComposerController).mockReturnValue({
    body: "A little hope.",
    choices: [selected],
    selected,
    spaceId: selected.id,
    pending: false,
    blocked: false,
    error: "",
    spaces: { items: [selected], loading: false, error: "", nextCursor: null },
    context: { loading: false, error: "", value: undefined },
  } as unknown as ReturnType<typeof usePostComposerController>);
});
describe("post composer audience", () => {
  it("names the selected Space in the picker, privacy summary, and submission button", () => {
    const html = renderToStaticMarkup(<ComposePostForm app={app} />);
    expect(html).toContain("Post to");
    expect(html).toContain("Family circle · Private");
    expect(html).toContain("Your post will go to Family circle. Only members");
    expect(html).toContain("Submit to Family circle for review");
    expect(html).not.toContain("Sharing to Global");
    expect(html).not.toContain("memory only");
  });
  it("explains the public audience before Global submission", () => {
    const current = vi
      .mocked(usePostComposerController)
      .getMockImplementation()!(null, undefined, vi.fn());
    vi.mocked(usePostComposerController).mockReturnValue({
      ...current,
      selected: { ...current.selected!, name: "Global", visibility: "public" },
    });
    const html = renderToStaticMarkup(<ComposePostForm app={app} />);
    expect(html).toContain("Anyone can read it after approval");
    expect(html).toContain("Submit to Global for review");
  });
  it("keeps the text and destination visible when a submission fails", () => {
    const current = vi
      .mocked(usePostComposerController)
      .getMockImplementation()!(null, undefined, vi.fn());
    vi.mocked(usePostComposerController).mockReturnValue({
      ...current,
      error: "Unable to connect.",
    });
    const html = renderToStaticMarkup(<ComposePostForm app={app} />);
    expect(html).toContain("A little hope.");
    expect(html).toContain("Your text is still here; you can retry.");
    expect(html).toContain("Submit to Family circle for review");
  });
  it("requires sign-in and does not show posting controls to visitors", () => {
    const html = renderToStaticMarkup(
      <ComposePostForm app={{ ...app, profile: null }} />,
    );
    expect(html).toContain("Log in to share");
    expect(html).not.toContain("<select");
  });
});
