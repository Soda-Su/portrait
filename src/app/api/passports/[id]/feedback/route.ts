import { NextResponse } from "next/server";
import { feedbackInputSchema } from "@/lib/schemas";
import { createId } from "@/lib/ids";
import { addFeedback, getPassport } from "@/lib/store";
import type { Feedback } from "@/lib/types";
import { canManagePassport } from "@/lib/auth";
import { addEvent } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const passport = await getPassport(id);
  if (!passport) {
    return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  }
  if (!(await canManagePassport(passport))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = feedbackInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid feedback" }, { status: 400 });
  }

  const feedback: Feedback = {
    id: createId("feedback"),
    passportId: id,
    ...parsed.data,
    createdAt: new Date().toISOString(),
  };

  await addFeedback(feedback);
  await addEvent({
    id: createId("event"),
    name: "feedback_submitted",
    passportId: id,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json(feedback);
}
