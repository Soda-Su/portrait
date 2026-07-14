import { NextResponse } from "next/server";
import { createId } from "@/lib/ids";
import { visitorFeedbackSchema } from "@/lib/schemas";
import { resolvePrivateShare } from "@/lib/sharing";
import { addEvent, addFeedback } from "@/lib/store";
import type { Feedback } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const shared = await resolvePrivateShare(token);
  if (!shared) return NextResponse.json({ error: "Share link not found" }, { status: 404 });
  const parsed = visitorFeedbackSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  const feedback: Feedback = {
    id: createId("feedback"),
    passportId: shared.passport.id,
    usefulness: parsed.data.helpful ? "Helpful" : "Needs context",
    accurate: parsed.data.helpful ? "Visitor marked the answer helpful." : "",
    wrong: parsed.data.helpful ? "" : "Visitor requested more context.",
    wouldUse: false,
    wouldPay: false,
    audience: "visitor",
    context: { question: parsed.data.question, answer: parsed.data.answer },
    createdAt: new Date().toISOString(),
  };
  await addFeedback(feedback);
  await addEvent({
    id: createId("event"),
    name: "feedback_submitted",
    passportId: shared.passport.id,
    metadata: { audience: "visitor", helpful: parsed.data.helpful },
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ saved: true });
}
