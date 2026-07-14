import { generateText, Output } from "ai";
import { chatAnswerSchema } from "@/lib/schemas";
import { isRealAiMode } from "@/lib/config";
import { getPortrayModel } from "@/lib/ai-provider";
import type { ChatAnswer, ChatMessage, Intake, Passport, WorkSource } from "@/lib/types";

type EvidenceSource = { id: string; label: string; content: string };

export function buildEvidenceBundle(
  intake: Intake,
  passport: Passport,
  workSources?: WorkSource | WorkSource[] | null,
) {
  const sources = Array.isArray(workSources)
    ? workSources
    : workSources
      ? [workSources]
      : [];
  const readySources = sources.filter((source) => source.status === "ready" && source.content);
  const resumeSource = readySources.find((source) => source.sourceKind === "resume");
  const representativeWorkSource = readySources.find(
    (source) => source.sourceKind !== "resume",
  );
  return [
    {
      id: "identity",
      label: "Identity and direction",
      content: `${intake.name}; ${intake.currentTitle}; ${intake.companyOrInstitution}; ${intake.quietQuestion}`,
    },
    {
      id: "profile-seed",
      label: "Resume / LinkedIn profile seed",
      content: [
        intake.linkedinUrl ? `LinkedIn URL: ${intake.linkedinUrl}` : "",
        intake.resumeUrl ? `Resume URL: ${intake.resumeUrl}` : "",
        intake.resumeText ? `Resume text: ${intake.resumeText}` : "",
        intake.resumeSnapshot ? `Resume snapshot: ${intake.resumeSnapshot.slice(0, 12_000)}` : "",
      ].filter(Boolean).join("\n"),
    },
    ...(resumeSource
      ? [
          {
            id: "resume-snapshot",
            label: resumeSource.title || "Authorized resume snapshot",
            content: resumeSource.content!.slice(0, 12_000),
          },
        ]
      : []),
    {
      id: "representative-work",
      label: "Representative work",
      content: [
        intake.representativeWorkUrl
          ? `Representative work URL: ${intake.representativeWorkUrl}`
          : "",
        intake.representativeWorkDescription || intake.representativeWork || "",
      ].filter(Boolean).join("\n"),
    },
    ...(representativeWorkSource
      ? [
          {
            id: "work-snapshot",
            label: representativeWorkSource.title || "Authorized work snapshot",
            content: representativeWorkSource.content!.slice(0, 12_000),
          },
        ]
      : []),
    {
      id: "talent-signals",
      label: "Talent signals",
      content: passport.talentSignals
        .map((signal) => `${signal.capability}: ${signal.level}. ${signal.evidence}`)
        .join("\n"),
    },
    {
      id: "next-edge",
      label: "Missing proof / next edge",
      content: `${passport.missingProof.missingProof} ${passport.missingProof.recommendedNextProject}`,
    },
  ].filter((source) => source.content.trim()) satisfies EvidenceSource[];
}

function mockAnswer(question: string, sources: EvidenceSource[]): ChatAnswer {
  const normalized = question.toLowerCase();
  const unsupported = /salary|age|nationality|married|politic|visa|compensation/.test(normalized);
  if (unsupported) {
    return {
      answer:
        "This passport does not contain authorized evidence for that question, so I cannot make a reliable claim.",
      citations: [],
      confidence: "insufficient",
    };
  }
  const preferred = normalized.includes("next") || normalized.includes("gap")
    ? sources.find((source) => source.id === "next-edge")
    : normalized.includes("proof") || normalized.includes("work") || normalized.includes("project")
      ? sources.find((source) => source.id === "representative-work")
      : normalized.includes("signal") || normalized.includes("strength")
        ? sources.find((source) => source.id === "talent-signals")
        : sources.find((source) => source.id === "identity");
  if (!preferred) {
    return {
      answer: "The authorized material does not provide enough evidence to answer that yet.",
      citations: [],
      confidence: "insufficient",
    };
  }
  return {
    answer: preferred.content.slice(0, 520),
    citations: [{ sourceId: preferred.id, label: preferred.label }],
    confidence: "supported",
  };
}

export async function answerPassportQuestion(
  question: string,
  sources: EvidenceSource[],
  history: ChatMessage[] = [],
) {
  if (!isRealAiMode()) return mockAnswer(question, sources);
  const { output } = await generateText({
    model: getPortrayModel(),
    output: Output.object({ schema: chatAnswerSchema }),
    prompt: `You are Ask My Passport for Portray. Answer only from the authorized evidence below.

Rules:
- Never invent experience, biography, education, compensation, identity attributes, or role fit.
- Never provide a total score or ranking.
- Cite only source IDs that appear in the evidence.
- If the answer is not directly supported, say so and use confidence "insufficient".
- Use conversation history only to understand follow-up references. Previous answers are not evidence.
- Keep the answer concise, warm, and founder-facing.

Recent conversation:
${history
  .slice(-8)
  .map((message) => `${message.role}: ${message.content.slice(0, 1200)}`)
  .join("\n") || "No previous turns."}

Question: ${question}

Evidence:\n${JSON.stringify(sources, null, 2)}`,
  });
  const parsed = chatAnswerSchema.parse(output);
  const allowed = new Set(sources.map((source) => source.id));
  return {
    ...parsed,
    citations: parsed.citations.filter((citation) => allowed.has(citation.sourceId)),
  };
}
