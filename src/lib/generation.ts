import { generateText, Output } from "ai";
import type { z } from "zod";
import {
  passportPayloadSchema,
  type passportSectionSchema,
} from "@/lib/schemas";
import type { Intake, Passport, PassportSection } from "@/lib/types";
import { createId } from "@/lib/ids";
import { isRealAiMode } from "@/lib/config";
import { getPortrayModel } from "@/lib/ai-provider";

type PassportPayload = z.infer<typeof passportPayloadSchema>;

function inferDomain(intake: Intake) {
  return (
    intake.companyOrInstitution ||
    intake.preferredCompanyType ||
    intake.targetCompanyUrls?.[0] ||
    intake.targetJobUrls?.[0] ||
    "AI-native product teams"
  );
}

function firstProject(intake: Intake) {
  return intake.projectDescriptions[0] ?? {
    title: "Existing project work",
    description: "Career materials submitted by the user.",
    tools: intake.toolsUsed ?? [],
  };
}

function profileSeedSummary(intake: Intake) {
  return [
    intake.linkedinUrl ? `LinkedIn profile: ${intake.linkedinUrl}` : "",
    intake.resumeUrl ? `Resume link: ${intake.resumeUrl}` : "",
    intake.resumeText ? `Resume text: ${intake.resumeText.slice(0, 900)}` : "",
    intake.resumeSnapshot ? `Resume snapshot: ${intake.resumeSnapshot.slice(0, 900)}` : "",
  ].filter(Boolean);
}

export function createMockPassportPayload(intake: Intake): PassportPayload {
  const primaryTarget = intake.targetRoles[0] ?? intake.currentTitle;
  const project = firstProject(intake);
  const tools = Array.from(
    new Set([...(intake.toolsUsed ?? []), ...(project.tools ?? [])].filter(Boolean)),
  );
  const domains = inferDomain(intake);
  const quietQuestion = intake.quietQuestion || intake.futureTeamsNote || "";
  const profileSeeds = profileSeedSummary(intake);
  const companyContext = intake.companyOrInstitution
    ? ` at ${intake.companyOrInstitution}`
    : "";
  const isTransition =
    primaryTarget.trim().toLowerCase() !== intake.currentTitle.trim().toLowerCase();
  const hasCodeSignal =
    intake.codingComfort &&
    !/none|no code|beginner/i.test(intake.codingComfort.toLowerCase());

  return {
    identityHeader: {
      name: intake.name,
      currentRole: intake.currentTitle,
      targetRole: primaryTarget,
      positioningLine: quietQuestion
        ? `${intake.currentTitle}${companyContext}, exploring the question: ${quietQuestion}`
        : `${intake.currentTitle}${companyContext}, building from a resume/profile seed and one representative piece of work.`,
    },
    whatImBecoming: isTransition
      ? `I am moving from ${intake.currentTitle} toward ${primaryTarget}. The clearest evidence submitted so far is ${project.title}. The question guiding this next phase is: ${quietQuestion || "Needs a clearer statement from the participant."} This passport keeps that direction open without claiming experience that was not provided.`
      : `I am deepening my work as ${intake.currentTitle}${companyContext}. The clearest evidence submitted so far is ${project.title}. The question guiding this next phase is: ${quietQuestion || "Needs a clearer statement from the participant."} This passport treats that question as a direction of inquiry, not as proof of experience that was not provided.`,
    proofCards: intake.projectDescriptions.map((item) => ({
      projectName: item.title,
      targetRoleSignal: primaryTarget,
      whatIBuilt: item.description,
      whyItMatters: `This is the participant's selected work, giving future collaborators something concrete to inspect beyond a title or short biography.`,
      capabilities: [
        "Evidence Communication",
        "Subject Matter Perspective",
        quietQuestion ? "Clear Inquiry" : "Needs stronger evidence",
        item.tools?.length || tools.length ? "Tool Fluency" : "Tool fluency unverified",
      ].filter(Boolean),
      toolsUsed: item.tools?.length ? item.tools : tools,
      evidenceLinks: item.link ? [item.link] : intake.portfolioUrl ? [intake.portfolioUrl] : [],
    })),
    talentSignals: [
      {
        capability: "Problem Framing",
        level: project.description.length > 160 ? "Strong" : "Intermediate",
        evidence: quietQuestion
          ? `The submitted question gives a direct signal of what ${intake.name} is trying to understand.`
          : "Needs a direct statement of the question guiding the work.",
      },
      {
        capability: "AI-native Inquiry",
        level: /ai|agent|llm|automation|workflow/i.test(
          `${intake.resumeText ?? ""} ${project.description} ${quietQuestion}`,
        )
          ? "Emerging"
          : "Needs stronger evidence",
        evidence:
          "Any AI-related signal is limited to the representative work and question submitted by the participant.",
      },
      {
        capability: "Evidence Orientation",
        level: tools.length ? "Emerging" : "Basic",
        evidence: tools.length
          ? `Tools mentioned: ${tools.join(", ")}.`
          : `One representative work was provided: ${project.description}`,
      },
      {
        capability: "Career Coherence",
        level: profileSeeds.length ? "Intermediate" : "Needs stronger evidence",
        evidence: profileSeeds.length
          ? "The profile builder had at least one resume, LinkedIn, or resume-link seed to compare against the chosen work."
          : "No resume, LinkedIn, or resume-link seed was provided.",
      },
      {
        capability: "Coding Fluency",
        level: hasCodeSignal ? "Emerging" : "Unverified",
        evidence: hasCodeSignal
          ? `Coding comfort was described as: ${intake.codingComfort}.`
          : "No clear coding evidence was provided, so this should not be overstated.",
      },
      {
        capability: "Founder Communication",
        level: quietQuestion ? "Intermediate" : "Basic",
        evidence:
          quietQuestion ||
          "The founder-facing narrative needs one sharper sentence from the user.",
      },
    ],
    howIThink: {
      onAIProducts: quietQuestion
        ? `The question I am quietly working on is: ${quietQuestion}`
        : "No direct statement about AI products was provided.",
      onDesign:
        "The submitted material does not yet include a direct design philosophy. Needs stronger evidence.",
      onBuilding: `The work I chose to represent me is: ${project.description}`,
      onTeams: intake.salonInterest
        ? `For Z Salon consideration, I selected: ${intake.salonInterest}.`
        : "No gathering preference was provided.",
    },
    letterToFounders: `Hi,\n\nI am ${intake.name}, currently working as ${intake.currentTitle}${companyContext}.\n\nThe representative work I chose to share is ${project.description}\n\nThe question I am quietly carrying into the next phase is: ${quietQuestion || "Unverified - no question was provided."}\n\nI am sharing these as starting points for a conversation. They show what I am paying attention to without overstating what has already been proven.\n\nBest,\n${intake.name}`,
    missingProof: {
      strongestSignals: ["Problem Framing", "Evidence Orientation"],
      missingProof: hasCodeSignal
        ? "A clearer explanation of the participant's exact contribution, decisions, and outcome."
        : "Technical and AI-building fluency remain unverified from this concise intake.",
      recommendedNextProject: `Add a compact note around ${project.title}: the context, your exact contribution, one decision you made, and one result others can inspect.`,
      whyItMatters:
        `The next proof should make the inquiry legible to people beyond ${domains} without implying unsupported experience.`,
    },
    suggestedQuestions: [
      `What is ${intake.name} becoming?`,
      "Which evidence best supports the strongest talent signals?",
      "What kind of team could make good use of this perspective?",
      "What proof should this person build next?",
    ],
  };
}

function assertRealAiConfigured() {
  if (!isRealAiMode()) return false;
  getPortrayModel();
  return true;
}

export async function generatePassportPayload(intake: Intake) {
  if (!assertRealAiConfigured()) {
    return createMockPassportPayload(intake);
  }

  const { output } = await generateText({
    model: getPortrayModel(),
    output: Output.object({ schema: passportPayloadSchema }),
    prompt: `You are Portray's Profile Builder, an evidence-constrained AI career manuscript agent.

Generate an AI Talent Passport from this intake JSON. Follow this process internally:
1. Extract stable profile facts from resumeText, resumeSnapshot, resumeUrl, and linkedinUrl.
2. Extract proof from representativeWorkDescription, representativeWorkUrl, and representativeWorkSnapshot.
3. Connect the profile facts to the selected work into one coherent founder-facing narrative.
4. Mark gaps honestly in missingProof and avoid making unsupported claims.

Rules:
- Use only evidence provided by the user or fetched into the intake JSON.
- A LinkedIn or resume URL alone is a reference, not proof of job history unless text is included in the intake.
- Do not exaggerate, invent experience, infer private identity details, or assign a total score.
- Unsupported capabilities must be Emerging, Basic, Unverified, or Needs stronger evidence.
- Write in a clear, warm, editorial, founder-facing voice.

${JSON.stringify(intake, null, 2)}`,
  });

  return passportPayloadSchema.parse(output);
}

export async function createPassportFromIntake(intake: Intake): Promise<Passport> {
  const payload = await generatePassportPayload(intake);
  const now = new Date().toISOString();
  return {
    id: createId("passport"),
    userId: intake.userId,
    intakeId: intake.id,
    status: "draft",
    publishable: false,
    demoCase: false,
    generationStatus: "complete",
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...payload,
  };
}

export function createFailedPassportFromIntake(intake: Intake, error: string): Passport {
  const payload = createMockPassportPayload(intake);
  const now = new Date().toISOString();
  return {
    id: createId("passport"),
    userId: intake.userId,
    intakeId: intake.id,
    status: "draft",
    publishable: false,
    demoCase: false,
    generationStatus: "failed",
    generationError: error,
    version: 1,
    createdAt: now,
    updatedAt: now,
    ...payload,
  };
}

export async function regenerateSection(
  intake: Intake,
  passport: Passport,
  section: PassportSection,
) {
  const fresh = await generatePassportPayload(intake);
  if (section === "letterToFounders" && !isRealAiMode()) {
    return `${fresh.letterToFounders}\n\nP.S. This version is tightened around ${passport.identityHeader.targetRole} and keeps the claims evidence-based.`;
  }
  return fresh[section as keyof PassportPayload];
}

export type PassportSectionInput = z.infer<typeof passportSectionSchema>;
