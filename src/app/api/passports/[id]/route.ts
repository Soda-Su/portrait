import { NextResponse } from "next/server";
import {
  howIThinkSchema,
  identityHeaderSchema,
  missingProofSchema,
  passportSectionSchema,
  proofCardSchema,
  talentSignalSchema,
} from "@/lib/schemas";
import { getPassport, updatePassport } from "@/lib/store";
import type { Passport } from "@/lib/types";
import { canManagePassport } from "@/lib/auth";

const sectionSchemas = {
  identityHeader: identityHeaderSchema,
  whatImBecoming: null,
  proofCards: proofCardSchema.array(),
  talentSignals: talentSignalSchema.array(),
  howIThink: howIThinkSchema,
  letterToFounders: null,
  missingProof: missingProofSchema,
};

export async function GET(
  _request: Request,
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
  return NextResponse.json(passport);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const existing = await getPassport(id);
  if (!existing) {
    return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  }
  if (!(await canManagePassport(existing))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const section = passportSectionSchema.safeParse(body.section);

  if (!section.success) {
    const updated = await updatePassport(id, (passport) => ({
      ...passport,
      publishable:
        typeof body.publishable === "boolean" ? body.publishable : passport.publishable,
      demoCase: typeof body.demoCase === "boolean" ? body.demoCase : passport.demoCase,
      status:
        typeof body.status === "string" && ["draft", "published"].includes(body.status)
          ? body.status
          : passport.status,
    }));
    if (!updated) {
      return NextResponse.json({ error: "Passport not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  }

  const schema = sectionSchemas[section.data];
  const parsedValue =
    schema === null
      ? typeof body.value === "string"
        ? { success: true as const, data: body.value }
        : { success: false as const }
      : schema.safeParse(body.value);

  if (!parsedValue.success) {
    return NextResponse.json({ error: "Invalid section value" }, { status: 400 });
  }

  const updated = await updatePassport(id, (passport) => ({
    ...passport,
    [section.data]: parsedValue.data,
  }) as Passport);

  if (!updated) {
    return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
