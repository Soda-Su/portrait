import { describe, expect, it } from "vitest";
import { answerPassportQuestion, buildEvidenceBundle } from "@/lib/chat";
import { createMockPassportPayload, generatePassportPayload } from "@/lib/generation";
import { passportToMarkdown } from "@/lib/markdown";
import type { Intake, Passport, WorkSource } from "@/lib/types";

const intake: Intake = {
  id: "intake_test",
  userId: "user_test",
  name: "Ada Chen",
  email: "ada@example.com",
  currentTitle: "Product designer",
  targetRoles: ["AI product designer"],
  companyOrInstitution: "Independent",
  representativeWork: "An AI research workflow with evaluation notes and a tested prototype.",
  representativeWorkDescription: "An AI research workflow with evaluation notes and a tested prototype.",
  representativeWorkUrl: "https://example.com/work",
  materialConsent: true,
  quietQuestion: "How can agents make expert judgment more legible?",
  projectDescriptions: [
    {
      title: "Research agent",
      description: "An AI research workflow with evaluation notes and a tested prototype.",
      link: "https://example.com/work",
      tools: ["Figma"],
    },
  ],
  createdAt: "2026-07-13T00:00:00.000Z",
};

function passportFixture(): Passport {
  return {
    id: "passport_test",
    userId: intake.userId,
    intakeId: intake.id,
    status: "draft",
    publishable: false,
    demoCase: false,
    generationStatus: "complete",
    version: 1,
    createdAt: intake.createdAt,
    updatedAt: intake.createdAt,
    ...createMockPassportPayload(intake),
  };
}

describe("evidence-constrained AI", () => {
  it("generates deterministic Passport JSON without totals or rankings", () => {
    const payload = createMockPassportPayload(intake);
    expect(payload.identityHeader.name).toBe("Ada Chen");
    expect(JSON.stringify(payload)).not.toMatch(/total score|overall score|ranking/i);
    expect(payload.talentSignals.some((signal) => signal.level === "Unverified")).toBe(true);
  });

  it("trims fetched evidence and cites an allowed source", async () => {
    const source: WorkSource = {
      id: "source_test",
      intakeId: intake.id,
      url: "https://example.com/work",
      status: "ready",
      content: "A".repeat(20_000),
      title: "Work snapshot",
      createdAt: intake.createdAt,
    };
    const evidence = buildEvidenceBundle(intake, passportFixture(), source);
    expect(evidence.find((item) => item.id === "work-snapshot")?.content).toHaveLength(12_000);
    const answer = await answerPassportQuestion("What proof supports this person?", evidence);
    expect(answer.confidence).toBe("supported");
    expect(answer.citations[0]?.sourceId).toBe("representative-work");
  });

  it("refuses unsupported personal questions", async () => {
    const answer = await answerPassportQuestion(
      "What salary and visa status should I assume?",
      buildEvidenceBundle(intake, passportFixture()),
    );
    expect(answer.confidence).toBe("insufficient");
    expect(answer.citations).toEqual([]);
  });

  it("exports the complete v0.1 Markdown structure", () => {
    const markdown = passportToMarkdown(passportFixture());
    expect(markdown).toContain("## Work as Proof");
    expect(markdown).toContain("## Letter to Founders");
    expect(markdown).toContain("## Missing Proof / Next Edge");
  });

  it("fails clearly when real AI mode has no Gateway credentials", async () => {
    const previousMode = process.env.PORTRAY_AI_MODE;
    const previousGateway = process.env.AI_GATEWAY_API_KEY;
    const previousOidc = process.env.VERCEL_OIDC_TOKEN;
    const previousProvider = process.env.PORTRAY_AI_PROVIDER;
    const previousOpenAI = process.env.OPENAI_API_KEY;
    process.env.PORTRAY_AI_MODE = "real";
    process.env.PORTRAY_AI_PROVIDER = "openai";
    delete process.env.AI_GATEWAY_API_KEY;
    delete process.env.VERCEL_OIDC_TOKEN;
    delete process.env.OPENAI_API_KEY;
    try {
      await expect(generatePassportPayload(intake)).rejects.toThrow("OPENAI_API_KEY");
    } finally {
      if (previousMode === undefined) delete process.env.PORTRAY_AI_MODE;
      else process.env.PORTRAY_AI_MODE = previousMode;
      if (previousGateway === undefined) delete process.env.AI_GATEWAY_API_KEY;
      else process.env.AI_GATEWAY_API_KEY = previousGateway;
      if (previousOidc === undefined) delete process.env.VERCEL_OIDC_TOKEN;
      else process.env.VERCEL_OIDC_TOKEN = previousOidc;
      if (previousProvider === undefined) delete process.env.PORTRAY_AI_PROVIDER;
      else process.env.PORTRAY_AI_PROVIDER = previousProvider;
      if (previousOpenAI === undefined) delete process.env.OPENAI_API_KEY;
      else process.env.OPENAI_API_KEY = previousOpenAI;
    }
  });
});
