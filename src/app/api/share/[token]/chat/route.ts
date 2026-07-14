import { NextResponse } from "next/server";
import { answerPassportQuestion, buildEvidenceBundle } from "@/lib/chat";
import { createId } from "@/lib/ids";
import { chatInputSchema } from "@/lib/schemas";
import { hashIp } from "@/lib/security";
import { resolvePrivateShare } from "@/lib/sharing";
import {
  addChatMessage,
  addEvent,
  countRecentQuestionsByIp,
  countVisitorQuestions,
  getOrCreateChatSession,
  listRecentChatMessagesForSession,
} from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const shared = await resolvePrivateShare(token);
  if (!shared) return NextResponse.json({ error: "Share link not found" }, { status: 404 });
  const parsed = chatInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Please ask a shorter, specific question" }, { status: 400 });
  }
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ipHash = hashIp(forwarded || "local");
  const session = await getOrCreateChatSession({
    id: createId("chat"),
    passportId: shared.passport.id,
    shareLinkId: shared.shareLink.id,
    visitorId: parsed.data.visitorId,
    ipHash,
    createdAt: new Date().toISOString(),
  });
  if ((await countVisitorQuestions(session.id)) >= 12) {
    return NextResponse.json({ error: "This private conversation has reached its question limit" }, { status: 429 });
  }
  if ((await countRecentQuestionsByIp(ipHash)) >= 20) {
    return NextResponse.json({ error: "Please wait before asking another question" }, { status: 429 });
  }

  const now = new Date().toISOString();
  const history = await listRecentChatMessagesForSession(session.id);
  await addChatMessage({
    id: createId("message"),
    sessionId: session.id,
    role: "user",
    content: parsed.data.question,
    createdAt: now,
  });
  const sources = buildEvidenceBundle(
    shared.intake,
    shared.passport,
    shared.workSources,
  );
  const answer = await answerPassportQuestion(parsed.data.question, sources, history);
  await addChatMessage({
    id: createId("message"),
    sessionId: session.id,
    role: "assistant",
    content: answer.answer,
    citations: answer.citations,
    confidence: answer.confidence,
    createdAt: new Date().toISOString(),
  });
  await addEvent({
    id: createId("event"),
    name: "chat_question",
    passportId: shared.passport.id,
    metadata: { confidence: answer.confidence },
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(answer);
}
