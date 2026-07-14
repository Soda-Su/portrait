export type TalentSignalLevel =
  | "Strong"
  | "Intermediate"
  | "Emerging"
  | "Basic"
  | "Unverified"
  | "Needs stronger evidence";

export type User = {
  id: string;
  email?: string;
  name: string;
  createdAt: string;
};

export type ProjectInput = {
  title: string;
  description: string;
  link?: string;
  tools?: string[];
  userSelectedImportance?: "high" | "medium" | "low";
};

export type Intake = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  currentTitle: string;
  yearsExperience?: string;
  targetRoles: string[];
  linkedinUrl?: string;
  resumeUrl?: string;
  resumeText?: string;
  resumeSnapshot?: string;
  wechat?: string;
  companyOrInstitution?: string;
  representativeWork?: string;
  representativeWorkUrl?: string;
  representativeWorkDescription?: string;
  representativeWorkSnapshot?: string;
  materialConsent?: boolean;
  formspreeDeliveryStatus?: "pending" | "sent" | "failed" | "not_configured";
  formspreeDeliveryError?: string;
  salonInterest?: string;
  quietQuestion?: string;
  portfolioUrl?: string;
  projectDescriptions: ProjectInput[];
  targetJobUrls?: string[];
  targetCompanyUrls?: string[];
  toolsUsed?: string[];
  codingComfort?: string;
  desiredOpportunity?: string;
  futureTeamsNote?: string;
  preferredCompanyType?: string;
  locationPreference?: string;
  willingToBeRecommended?: boolean;
  rawNotes?: string;
  createdAt: string;
};

export type IdentityHeader = {
  name: string;
  currentRole: string;
  targetRole: string;
  positioningLine: string;
};

export type ProofCard = {
  projectName: string;
  targetRoleSignal: string;
  whatIBuilt: string;
  whyItMatters: string;
  capabilities: string[];
  toolsUsed: string[];
  evidenceLinks: string[];
};

export type TalentSignal = {
  capability: string;
  level: TalentSignalLevel;
  evidence: string;
};

export type HowIThink = {
  onAIProducts: string;
  onDesign: string;
  onBuilding: string;
  onTeams: string;
};

export type MissingProof = {
  strongestSignals: string[];
  missingProof: string;
  recommendedNextProject: string;
  whyItMatters: string;
};

export type Passport = {
  id: string;
  userId: string;
  intakeId: string;
  status: "draft" | "published";
  identityHeader: IdentityHeader;
  whatImBecoming: string;
  proofCards: ProofCard[];
  talentSignals: TalentSignal[];
  howIThink: HowIThink;
  letterToFounders: string;
  missingProof: MissingProof;
  publishable: boolean;
  demoCase: boolean;
  generationStatus: "pending" | "complete" | "failed";
  generationError?: string;
  suggestedQuestions: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type Feedback = {
  id: string;
  passportId: string;
  usefulness: string;
  accurate: string;
  wrong: string;
  wouldUse: boolean;
  wouldPay: boolean;
  createdAt: string;
  audience?: "candidate" | "visitor";
  context?: { question: string; answer: string };
};

export type WorkSource = {
  id: string;
  intakeId: string;
  sourceKind?: "resume" | "representative_work";
  url: string;
  status: "pending" | "ready" | "failed" | "blocked";
  content?: string;
  contentType?: string;
  title?: string;
  error?: string;
  sha256?: string;
  fetchedAt?: string;
  createdAt: string;
};

export type ShareLink = {
  id: string;
  passportId: string;
  tokenHash: string;
  active: boolean;
  createdAt: string;
  revokedAt?: string;
};

export type ChatCitation = {
  sourceId: string;
  label: string;
};

export type ChatConfidence = "supported" | "partial" | "insufficient";

export type ChatAnswer = {
  answer: string;
  citations: ChatCitation[];
  confidence: ChatConfidence;
};

export type ChatSession = {
  id: string;
  passportId: string;
  shareLinkId: string;
  visitorId: string;
  ipHash?: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  confidence?: ChatConfidence;
  createdAt: string;
};

export type PortrayEventName =
  | "intake_submitted"
  | "passport_generated"
  | "share_enabled"
  | "passport_viewed"
  | "chat_question"
  | "feedback_submitted";

export type PortrayEvent = {
  id: string;
  name: PortrayEventName;
  passportId?: string;
  intakeId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type PortrayStore = {
  users: User[];
  intakes: Intake[];
  passports: Passport[];
  feedback: Feedback[];
  workSources: WorkSource[];
  shareLinks: ShareLink[];
  chatSessions: ChatSession[];
  chatMessages: ChatMessage[];
  events: PortrayEvent[];
};

export type PassportSection =
  | "identityHeader"
  | "whatImBecoming"
  | "proofCards"
  | "talentSignals"
  | "howIThink"
  | "letterToFounders"
  | "missingProof";
