import { afterEach, describe, expect, it, vi } from "vitest";
import { forwardIntakeToFormspree } from "@/lib/formspree";
import type { Intake } from "@/lib/types";

const intake = {
  id: "intake_formspree",
  userId: "pending_user",
  name: "Ada Chen",
  email: "ada@example.com",
  currentTitle: "Product designer",
  targetRoles: ["Product designer"],
  representativeWorkUrl: "https://example.com/work",
  representativeWorkDescription: "A representative AI workflow and its decisions.",
  projectDescriptions: [],
  createdAt: "2026-07-13T00:00:00.000Z",
} satisfies Intake;

afterEach(() => {
  delete process.env.FORMSPREE_ENDPOINT;
  vi.unstubAllGlobals();
});

describe("Formspree delivery", () => {
  it("is non-blocking when not configured", async () => {
    await expect(forwardIntakeToFormspree(intake)).resolves.toEqual({ status: "not_configured" });
  });

  it("records successful delivery", async () => {
    process.env.FORMSPREE_ENDPOINT = "https://formspree.io/f/test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 200 })));
    await expect(forwardIntakeToFormspree(intake)).resolves.toEqual({ status: "sent" });
  });

  it("returns a retryable failure without throwing", async () => {
    process.env.FORMSPREE_ENDPOINT = "https://formspree.io/f/test";
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
    await expect(forwardIntakeToFormspree(intake)).resolves.toMatchObject({
      status: "failed",
      error: "Formspree returned 503",
    });
  });
});
