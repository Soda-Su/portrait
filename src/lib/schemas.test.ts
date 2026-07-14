import { describe, expect, it } from "vitest";
import { chatAnswerSchema, chatInputSchema, intakeInputSchema } from "@/lib/schemas";

const validIntake = {
  name: "Ada Chen",
  email: "ada@example.com",
  currentTitle: "Product designer",
  linkedinUrl: "https://www.linkedin.com/in/ada",
  wechat: "",
  companyOrInstitution: "Independent",
  representativeWorkUrl: "https://example.com/work",
  representativeWorkDescription:
    "I designed and tested an AI research workflow, including the core interaction and evaluation notes.",
  salonInterest: "Current or next gathering",
  quietQuestion: "How can agents make expert judgment more legible without flattening it?",
  materialConsent: true,
  website: "",
};

describe("MVP schemas", () => {
  it("accepts a complete selective-beta intake", () => {
    expect(intakeInputSchema.safeParse(validIntake).success).toBe(true);
  });

  it("requires explicit material consent and sufficient evidence notes", () => {
    expect(intakeInputSchema.safeParse({ ...validIntake, materialConsent: false }).success).toBe(false);
    expect(intakeInputSchema.safeParse({ ...validIntake, representativeWorkDescription: "Short" }).success).toBe(false);
  });

  it("accepts resume-only profile source and described work without a link", () => {
    expect(
      intakeInputSchema.safeParse({
        ...validIntake,
        linkedinUrl: "",
        resumeText: "Principal designer with AI workflow, research, prototyping, and strategy experience.",
        representativeWorkUrl: "",
      }).success,
    ).toBe(true);
  });

  it("requires at least one resume or LinkedIn profile source", () => {
    expect(
      intakeInputSchema.safeParse({
        ...validIntake,
        linkedinUrl: "",
        resumeUrl: "",
        resumeText: "",
      }).success,
    ).toBe(false);
  });

  it("limits visitor questions and validates structured answers", () => {
    expect(chatInputSchema.safeParse({ question: "x".repeat(801), visitorId: "visitor_1234" }).success).toBe(false);
    expect(
      chatAnswerSchema.safeParse({
        answer: "The evidence does not support that claim.",
        citations: [],
        confidence: "insufficient",
      }).success,
    ).toBe(true);
  });
});
