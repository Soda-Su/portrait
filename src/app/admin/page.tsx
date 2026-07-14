import type { Route } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  CheckCircle2,
  Circle,
  Eye,
  MessageSquare,
  RefreshCcw,
  Send,
  TriangleAlert,
} from "lucide-react";
import { Button, SectionLabel, Shell } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { forwardIntakeToFormspree } from "@/lib/formspree";
import { getIntake, listReviewRows, updateIntake, updatePassport } from "@/lib/store";

async function authorizeAdmin() {
  const user = await getCurrentUser();
  return !isSupabaseConfigured() || isAdmin(user?.email);
}

async function toggleDemoCase(formData: FormData) {
  "use server";
  if (!(await authorizeAdmin())) return;
  const passportId = String(formData.get("passportId"));
  const demoCase = formData.get("demoCase") === "true";
  await updatePassport(passportId, (passport) => ({ ...passport, demoCase }));
  revalidatePath("/admin");
}

async function retryFormspree(formData: FormData) {
  "use server";
  if (!(await authorizeAdmin())) return;
  const intakeId = String(formData.get("intakeId"));
  const intake = await getIntake(intakeId);
  if (!intake) return;
  const delivery = await forwardIntakeToFormspree(intake);
  await updateIntake(intakeId, (current) => ({
    ...current,
    formspreeDeliveryStatus: delivery.status,
    formspreeDeliveryError: "error" in delivery ? delivery.error : undefined,
  }));
  revalidatePath("/admin");
}

export default async function AdminPage() {
  if (!(await authorizeAdmin())) redirect("/app" as Route);
  const rows = await listReviewRows();

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
          <div>
            <SectionLabel>Admin review</SectionLabel>
            <h1 className="path-title mt-4 font-serif text-5xl font-black text-ink md:text-6xl">
              Beta signal desk
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">{rows.length} submissions</p>
        </div>

        <div className="mt-8 overflow-x-auto border-y border-line">
          <table className="w-full min-w-[1120px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-muted-foreground">
                <th className="p-4 font-medium">Candidate</th>
                <th className="p-4 font-medium">Submission</th>
                <th className="p-4 font-medium">Delivery</th>
                <th className="p-4 font-medium">Passport</th>
                <th className="p-4 font-medium">Beta activity</th>
                <th className="p-4 font-medium">Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map(({ intake, passport, feedback, chatMessages, events }) => {
                  const views = events.filter((event) => event.name === "passport_viewed").length;
                  const questions = chatMessages.filter((message) => message.role === "user");
                  return (
                    <tr key={intake.id} className="border-b border-line align-top transition hover:bg-muted/45">
                      <td className="p-4">
                        <p className="font-medium text-ink">{intake.name}</p>
                        <p className="mt-1 text-muted-foreground">{intake.currentTitle}</p>
                        <p className="mt-2 font-mono text-xs text-muted-foreground">{intake.email}</p>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        <p>{intake.companyOrInstitution || "Not specified"}</p>
                        {intake.representativeWorkUrl ? (
                          <a className="mt-2 block max-w-48 truncate underline underline-offset-4" href={intake.representativeWorkUrl} rel="noreferrer" target="_blank">
                            Representative work
                          </a>
                        ) : (
                          <p className="mt-2 max-w-48 text-xs">Work described without a link</p>
                        )}
                        <p className="mt-2 text-xs">
                          {intake.resumeUrl || intake.resumeText ? "Resume source" : "No resume source"}
                          {intake.linkedinUrl ? " · LinkedIn" : ""}
                        </p>
                        <p className="mt-2 font-mono text-xs">{new Date(intake.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          {intake.formspreeDeliveryStatus === "sent" ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}
                          Formspree: {intake.formspreeDeliveryStatus || "pending"}
                        </span>
                        {intake.formspreeDeliveryStatus !== "sent" ? (
                          <form action={retryFormspree} className="mt-3">
                            <input type="hidden" name="intakeId" value={intake.id} />
                            <Button className="min-h-9 px-3" type="submit" variant="secondary"><RefreshCcw size={13} /> Retry</Button>
                          </form>
                        ) : null}
                      </td>
                      <td className="p-4">
                        {passport ? (
                          <div className="grid gap-2">
                            <Link className="font-medium text-ink underline decoration-line underline-offset-4" href={`/app/passport/${passport.id}` as Route}>
                              Open Passport
                            </Link>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              {passport.generationStatus === "complete" ? <CheckCircle2 size={14} /> : <TriangleAlert size={14} />}
                              {passport.generationStatus} · v{passport.version}
                            </span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                              {passport.publishable ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                              {passport.publishable ? "Private link active" : "Not shared"}
                            </span>
                          </div>
                        ) : "No Passport"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-4 text-muted-foreground">
                          <span className="flex items-center gap-1"><Eye size={15} /> {views}</span>
                          <span className="flex items-center gap-1"><MessageSquare size={15} /> {questions.length}</span>
                          <span className="flex items-center gap-1"><Send size={15} /> {feedback.length}</span>
                        </div>
                        {questions[0] ? <p className="mt-3 max-w-xs text-xs leading-5 text-muted-foreground">Latest: {questions[0].content}</p> : null}
                        {feedback[0] ? <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground">Feedback: {feedback[0].wrong || feedback[0].accurate || feedback[0].usefulness}</p> : null}
                      </td>
                      <td className="p-4">
                        {passport ? (
                          <form action={toggleDemoCase}>
                            <input type="hidden" name="passportId" value={passport.id} />
                            <input type="hidden" name="demoCase" value={String(!passport.demoCase)} />
                            <Button type="submit" variant="secondary" className="min-h-9 px-3">
                              {passport.demoCase ? "Remove demo case" : "Mark demo case"}
                            </Button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td className="p-10 text-center text-muted-foreground" colSpan={6}>No submissions yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Shell>
  );
}
