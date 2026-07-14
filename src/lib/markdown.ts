import type { Passport } from "@/lib/types";

export function passportToMarkdown(passport: Passport) {
  const proofCards = passport.proofCards
    .map(
      (card) => `### ${card.projectName}

**Target role signal:** ${card.targetRoleSignal}

**What I built:** ${card.whatIBuilt}

**Why it matters:** ${card.whyItMatters}

**Capabilities:** ${card.capabilities.join(", ")}

**Tools:** ${card.toolsUsed.join(", ") || "Not specified"}

${card.evidenceLinks.length ? `**Evidence:** ${card.evidenceLinks.join(", ")}` : ""}`,
    )
    .join("\n\n");

  const signals = passport.talentSignals
    .map((signal) => `- **${signal.capability}:** ${signal.level} - ${signal.evidence}`)
    .join("\n");

  return `# ${passport.identityHeader.name}

${passport.identityHeader.currentRole} -> ${passport.identityHeader.targetRole}

${passport.identityHeader.positioningLine}

## What I'm Becoming

${passport.whatImBecoming}

## Work as Proof

${proofCards}

## Talent Signals

${signals}

## How I Think

### On AI Products
${passport.howIThink.onAIProducts}

### On Design / Product
${passport.howIThink.onDesign}

### On Building
${passport.howIThink.onBuilding}

### On Teams
${passport.howIThink.onTeams}

## Letter to Founders

${passport.letterToFounders}

## Missing Proof / Next Edge

**Strongest current signals:** ${passport.missingProof.strongestSignals.join(", ")}

**The missing proof:** ${passport.missingProof.missingProof}

**Recommended next proof-of-work:** ${passport.missingProof.recommendedNextProject}

**Why this matters:** ${passport.missingProof.whyItMatters}
`;
}

export function sectionToText(section: string, value: unknown) {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}
