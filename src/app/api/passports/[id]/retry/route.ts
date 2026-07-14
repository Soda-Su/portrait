import { NextResponse } from "next/server";
import { canManagePassport } from "@/lib/auth";
import { generatePassportPayload } from "@/lib/generation";
import { getIntake, getPassport, updatePassport } from "@/lib/store";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const passport = await getPassport(id);
  if (!passport) return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  if (!(await canManagePassport(passport))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const intake = await getIntake(passport.intakeId);
  if (!intake) return NextResponse.json({ error: "Intake not found" }, { status: 404 });
  try {
    const payload = await generatePassportPayload(intake);
    const updated = await updatePassport(id, (current) => ({
      ...current,
      ...payload,
      generationStatus: "complete",
      generationError: undefined,
      version: current.version + 1,
    }));
    return NextResponse.json(updated);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Generation failed";
    await updatePassport(id, (current) => ({ ...current, generationStatus: "failed", generationError: message }));
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
