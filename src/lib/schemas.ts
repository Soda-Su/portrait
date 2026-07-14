import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const optionalUrl = optionalTrimmedString.pipe(z.string().url().optional());

export const talentSignalLevelSchema = z.enum([
  "Strong",
  "Intermediate",
  "Emerging",
  "Basic",
  "Unverified",
  "Needs stronger evidence",
]);

export const projectInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  link: z.string().optional(),
  tools: z.array(z.string()).optional(),
  userSelectedImportance: z.enum(["high", "medium", "low"]).optional(),
});

export const intakeInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  currentTitle: z.string().min(1),
  linkedinUrl: optionalUrl,
  resumeUrl: optionalUrl,
  resumeText: optionalTrimmedString.pipe(z.string().max(8000).optional()),
  wechat: z.string().optional(),
  companyOrInstitution: z.string().min(1),
  representativeWorkUrl: optionalUrl,
  representativeWorkDescription: z.string().min(40).max(4000),
  salonInterest: z.string().optional(),
  quietQuestion: z.string().min(20).max(2000),
  materialConsent: z.literal(true),
  website: z.string().max(0).optional(),
}).superRefine((data, context) => {
  if (!data.linkedinUrl && !data.resumeUrl && !data.resumeText) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Add a resume, resume link, or LinkedIn profile",
      path: ["linkedinUrl"],
    });
  }
});

export const identityHeaderSchema = z.object({
  name: z.string(),
  currentRole: z.string(),
  targetRole: z.string(),
  positioningLine: z.string(),
});

export const proofCardSchema = z.object({
  projectName: z.string(),
  targetRoleSignal: z.string(),
  whatIBuilt: z.string(),
  whyItMatters: z.string(),
  capabilities: z.array(z.string()),
  toolsUsed: z.array(z.string()),
  evidenceLinks: z.array(z.string()),
});

export const talentSignalSchema = z.object({
  capability: z.string(),
  level: talentSignalLevelSchema,
  evidence: z.string(),
});

export const howIThinkSchema = z.object({
  onAIProducts: z.string(),
  onDesign: z.string(),
  onBuilding: z.string(),
  onTeams: z.string(),
});

export const missingProofSchema = z.object({
  strongestSignals: z.array(z.string()),
  missingProof: z.string(),
  recommendedNextProject: z.string(),
  whyItMatters: z.string(),
});

export const passportPayloadSchema = z.object({
  identityHeader: identityHeaderSchema,
  whatImBecoming: z.string(),
  proofCards: z.array(proofCardSchema),
  talentSignals: z.array(talentSignalSchema),
  howIThink: howIThinkSchema,
  letterToFounders: z.string(),
  missingProof: missingProofSchema,
  suggestedQuestions: z.array(z.string().min(1)).min(3).max(5),
});

export const chatInputSchema = z.object({
  question: z.string().trim().min(2).max(800),
  visitorId: z.string().regex(/^[a-zA-Z0-9_-]{8,80}$/),
});

export const chatAnswerSchema = z.object({
  answer: z.string().min(1),
  citations: z.array(
    z.object({ sourceId: z.string().min(1), label: z.string().min(1) }),
  ),
  confidence: z.enum(["supported", "partial", "insufficient"]),
});

export const shareActionSchema = z.object({
  action: z.enum(["enable", "rotate", "revoke"]),
});

export const feedbackInputSchema = z.object({
  usefulness: z.string().min(1),
  accurate: z.string().optional().default(""),
  wrong: z.string().optional().default(""),
  wouldUse: z.boolean(),
  wouldPay: z.boolean(),
});

export const visitorFeedbackSchema = z.object({
  helpful: z.boolean(),
  question: z.string().min(2).max(800),
  answer: z.string().min(1).max(4000),
});

export const passportSectionSchema = z.enum([
  "identityHeader",
  "whatImBecoming",
  "proofCards",
  "talentSignals",
  "howIThink",
  "letterToFounders",
  "missingProof",
]);
