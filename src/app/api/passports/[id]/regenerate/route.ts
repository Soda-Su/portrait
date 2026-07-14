import { NextResponse } from "next/server";
import { regenerateSection } from "@/lib/generation";
import { passportSectionSchema } from "@/lib/schemas";
import { getIntake, getPassport, updatePassport } from "@/lib/store";
import type { Passport } from "@/lib/types";
import { canManagePassport } from "@/lib/auth";

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
  const intake = await getIntake(passport.intakeId);
  if (!intake) {
    return NextResponse.json({ error: "Intake not found" }, { status: 404 });
  }

  const body = await request.json();
  const section = passportSectionSchema.safeParse(body.section);
  if (!section.success) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const value = await regenerateSection(intake, passport, section.data);
  const updated = await updatePassport(id, (current) => ({
    ...current,
    [section.data]: value,
  }) as Passport);

  return NextResponse.json(updated);
}
