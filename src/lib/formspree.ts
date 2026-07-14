import type { Intake } from "@/lib/types";

export async function forwardIntakeToFormspree(intake: Intake) {
  const endpoint = process.env.FORMSPREE_ENDPOINT;
  if (!endpoint) return { status: "not_configured" as const };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: intake.name,
        email: intake.email,
        wechat: intake.wechat,
        linkedin: intake.linkedinUrl,
        resume_url: intake.resumeUrl,
        resume_text: intake.resumeText,
        role: intake.currentTitle,
        company: intake.companyOrInstitution,
        representative_work_url: intake.representativeWorkUrl,
        representative_work_description: intake.representativeWorkDescription,
        salon_interest: intake.salonInterest,
        quiet_question: intake.quietQuestion,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error(`Formspree returned ${response.status}`);
    return { status: "sent" as const };
  } catch (caught) {
    return {
      status: "failed" as const,
      error: caught instanceof Error ? caught.message : "Formspree delivery failed",
    };
  }
}
