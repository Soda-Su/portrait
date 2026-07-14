import { NextResponse } from "next/server";
import { intakeInputSchema } from "@/lib/schemas";
import {
  addEvent,
  addIntake,
  addPassport,
  addUser,
  addWorkSource,
  updateIntake,
} from "@/lib/store";
import {
  createFailedPassportFromIntake,
  createPassportFromIntake,
} from "@/lib/generation";
import { createId } from "@/lib/ids";
import { forwardIntakeToFormspree } from "@/lib/formspree";
import { ingestWorkSource } from "@/lib/work-ingestion";
import { getSupabaseAnon } from "@/lib/supabase/admin";
import { isSupabaseConfigured, siteUrl } from "@/lib/config";
import type { Intake, User } from "@/lib/types";

export async function POST(request: Request) {
  const parsed = intakeInputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the required fields", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  if (parsed.data.website) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const pendingUserId = createId("pending");
  const user: User = {
    id: pendingUserId,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    createdAt: now,
  };
  const intake: Intake = {
    id: createId("intake"),
    userId: pendingUserId,
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    currentTitle: parsed.data.currentTitle,
    targetRoles: [parsed.data.currentTitle],
    linkedinUrl: parsed.data.linkedinUrl,
    resumeUrl: parsed.data.resumeUrl,
    resumeText: parsed.data.resumeText,
    wechat: parsed.data.wechat,
    companyOrInstitution: parsed.data.companyOrInstitution,
    representativeWork: parsed.data.representativeWorkDescription,
    representativeWorkUrl: parsed.data.representativeWorkUrl,
    representativeWorkDescription: parsed.data.representativeWorkDescription,
    materialConsent: parsed.data.materialConsent,
    salonInterest: parsed.data.salonInterest,
    quietQuestion: parsed.data.quietQuestion,
    portfolioUrl: parsed.data.representativeWorkUrl,
    projectDescriptions: [
      {
        title: "Representative work",
        description: parsed.data.representativeWorkDescription,
        link: parsed.data.representativeWorkUrl,
        tools: [],
        userSelectedImportance: "high",
      },
    ],
    desiredOpportunity: parsed.data.salonInterest,
    futureTeamsNote: parsed.data.quietQuestion,
    willingToBeRecommended:
      Boolean(parsed.data.salonInterest) && parsed.data.salonInterest !== "Not right now",
    rawNotes: parsed.data.quietQuestion,
    formspreeDeliveryStatus: "pending",
    createdAt: now,
  };

  await addUser(user);
  await addIntake(intake);
  await addEvent({
    id: createId("event"),
    name: "intake_submitted",
    intakeId: intake.id,
    createdAt: now,
  });

  const magicLink = sendMagicLink(intake.email!);
  const sourcePromises = [
    parsed.data.resumeUrl
      ? ingestWorkSource(intake.id, parsed.data.resumeUrl, "resume")
      : null,
    parsed.data.representativeWorkUrl
      ? ingestWorkSource(
          intake.id,
          parsed.data.representativeWorkUrl,
          "representative_work",
        )
      : null,
  ].filter((promise): promise is ReturnType<typeof ingestWorkSource> => Boolean(promise));

  const [formspree, workSources] = await Promise.all([
    forwardIntakeToFormspree(intake),
    Promise.all(sourcePromises),
  ]);
  await Promise.all(workSources.map((workSource) => addWorkSource(workSource)));
  const representativeWorkSource = workSources.find(
    (workSource) => workSource.sourceKind !== "resume",
  );
  const resumeSource = workSources.find((workSource) => workSource.sourceKind === "resume");
  const enriched = (await updateIntake(intake.id, (current) => ({
    ...current,
    representativeWorkSnapshot:
      representativeWorkSource?.status === "ready"
        ? representativeWorkSource.content
        : undefined,
    resumeSnapshot: resumeSource?.status === "ready" ? resumeSource.content : undefined,
    formspreeDeliveryStatus: formspree.status,
    formspreeDeliveryError: "error" in formspree ? formspree.error : undefined,
  })))!;

  let passport;
  try {
    passport = await createPassportFromIntake(enriched);
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : "Passport generation failed";
    passport = createFailedPassportFromIntake(enriched, message);
  }
  await addPassport(passport);
  if (passport.generationStatus === "complete") {
    await addEvent({
      id: createId("event"),
      name: "passport_generated",
      intakeId: intake.id,
      passportId: passport.id,
      createdAt: new Date().toISOString(),
    });
  }

  const authDelivery = await magicLink;
  return NextResponse.json({
    intakeId: intake.id,
    passportId: passport.id,
    authRequired: isSupabaseConfigured(),
    authDeliveryError: authDelivery.error,
    workSourceStatus: representativeWorkSource?.status ?? "not_provided",
    resumeSourceStatus: resumeSource?.status ?? "not_provided",
  });
}

async function sendMagicLink(email: string) {
  const client = getSupabaseAnon();
  if (!client) return { error: null };
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=/app`,
      shouldCreateUser: true,
    },
  });
  return { error: error?.message ?? null };
}
