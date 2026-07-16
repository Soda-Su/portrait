"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { FileText, Link2, Send, Sparkles } from "lucide-react";
import { Button, Field, inputClass, textareaClass } from "@/components/ui";

type FormState = {
  name: string;
  email: string;
  wechat: string;
  linkedinUrl: string;
  resumeUrl: string;
  resumeText: string;
  currentTitle: string;
  companyOrInstitution: string;
  representativeWorkUrl: string;
  representativeWorkDescription: string;
  salonInterest: string;
  quietQuestion: string;
  materialConsent: boolean;
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  wechat: "",
  linkedinUrl: "",
  resumeUrl: "",
  resumeText: "",
  currentTitle: "",
  companyOrInstitution: "",
  representativeWorkUrl: "",
  representativeWorkDescription: "",
  salonInterest: "",
  quietQuestion: "",
  materialConsent: false,
  website: "",
};

export function IntakeForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!form.linkedinUrl && !form.resumeUrl && !form.resumeText.trim()) {
      setError("Add a LinkedIn URL, public resume link, or pasted resume notes.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/intakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not build Career OS");
      if (data.authRequired) {
        router.push(`/check-email?email=${encodeURIComponent(form.email)}` as Route);
      } else {
        router.push(`/generating?passportId=${data.passportId}` as Route);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="paper-surface min-w-0 max-w-[calc(100vw-2.5rem)] rounded-[32px] p-5 md:max-w-none md:p-7" onSubmit={submit}>
      <div className="mb-7 border-b border-line pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          Career OS Builder
        </p>
        <p className="mt-3 max-w-2xl font-serif text-2xl font-semibold leading-8 text-ink">
          Give Portray the source material. The agent assembles the signal.
        </p>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Add one career source and one proof of work. Portray extracts evidence,
          drafts the Career OS, and keeps unsupported claims visible.
        </p>
      </div>

      <div className="mb-7 grid gap-3 border-b border-line pb-7 md:grid-cols-3">
        {[
          ["1", "Read career source", "Resume text, resume link, or LinkedIn"],
          ["2", "Inspect one proof", "A public link or a concrete description"],
          ["3", "Assemble Career OS", "Evidence-backed layers for review"],
        ].map(([step, title, body]) => (
          <div className="min-w-0 rounded-2xl bg-muted px-4 py-3" key={step}>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Step {step}
            </p>
            <p className="mt-2 text-sm font-semibold text-ink">{title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name *">
          <input className={inputClass} value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="How you would like to be known" autoComplete="name" required />
        </Field>
        <Field label="Email *">
          <input className={inputClass} type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} autoComplete="email" required />
        </Field>
        <Field label="WeChat">
          <input className={inputClass} value={form.wechat} onChange={(event) => updateField("wechat", event.target.value)} placeholder="Optional contact" />
        </Field>
        <Field label="Current role *">
          <input className={inputClass} value={form.currentTitle} onChange={(event) => updateField("currentTitle", event.target.value)} placeholder="Designer, founder, researcher, etc." required />
        </Field>
        <Field label="Company / institution *">
          <input className={inputClass} value={form.companyOrInstitution} onChange={(event) => updateField("companyOrInstitution", event.target.value)} placeholder="Current home base" required />
        </Field>
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2 border-t border-line pt-6 text-sm font-semibold text-ink">
            <Sparkles size={15} /> Career source
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="LinkedIn URL" hint="Use this when your public profile is the best career source.">
              <div className="relative">
                <Link2 className="pointer-events-none absolute left-4 top-3.5 text-muted-foreground" size={15} />
                <input className={`${inputClass} pl-10`} type="url" value={form.linkedinUrl} onChange={(event) => updateField("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/..." inputMode="url" />
              </div>
            </Field>
            <Field label="Public resume link" hint="Optional HTTPS PDF, HTML, or text resume.">
              <div className="relative">
                <FileText className="pointer-events-none absolute left-4 top-3.5 text-muted-foreground" size={15} />
                <input className={`${inputClass} pl-10`} type="url" value={form.resumeUrl} onChange={(event) => updateField("resumeUrl", event.target.value)} placeholder="https://..." inputMode="url" />
              </div>
            </Field>
            <div className="md:col-span-2">
              <Field label="Resume notes" hint="Paste concise resume highlights if you do not want to use a public link.">
                <textarea className={`${textareaClass} min-h-28`} value={form.resumeText} onChange={(event) => updateField("resumeText", event.target.value)} maxLength={8000} placeholder="Roles, projects, education, skills, awards, or publications." />
              </Field>
            </div>
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2 border-t border-line pt-6 text-sm font-semibold text-ink">
            <Link2 size={15} /> One representative proof
          </div>
          <Field label="Representative work link" hint="Optional public HTTPS page, GitHub project, or PDF. A written description is enough for the first draft.">
            <div className="relative">
              <Link2 className="pointer-events-none absolute left-4 top-3.5 text-muted-foreground" size={15} />
              <input className={`${inputClass} pl-10`} type="url" value={form.representativeWorkUrl} onChange={(event) => updateField("representativeWorkUrl", event.target.value)} placeholder="https://..." />
            </div>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Why does this work represent you? *" hint="Describe your contribution, one important decision, and the evidence someone can inspect.">
            <textarea className={textareaClass} value={form.representativeWorkDescription} onChange={(event) => updateField("representativeWorkDescription", event.target.value)} minLength={40} maxLength={4000} required />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Would you like to be considered for the current or next Z Salon gathering?">
            <select className={inputClass} value={form.salonInterest} onChange={(event) => updateField("salonInterest", event.target.value)}>
              <option value="">Optional</option>
              <option value="Current gathering">Current gathering</option>
              <option value="Next gathering">Next gathering</option>
              <option value="Either gathering">Either gathering</option>
              <option value="Not right now">Not right now</option>
            </select>
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="What question are you quietly working on that Z Labs should understand? *">
            <textarea className={`${textareaClass} min-h-40`} value={form.quietQuestion} onChange={(event) => updateField("quietQuestion", event.target.value)} minLength={20} maxLength={2000} required />
          </Field>
        </div>
        <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => updateField("website", event.target.value)} aria-hidden />
        <label className="flex items-start gap-3 border-t border-line pt-5 text-sm leading-6 text-ink md:col-span-2">
          <input className="mt-1" type="checkbox" checked={form.materialConsent} onChange={(event) => updateField("materialConsent", event.target.checked)} required />
          <span>I authorize Portray to read this public work and use the submitted material to generate and answer questions about my private Career OS.</span>
        </label>
      </div>

      {error ? <p className="mt-5 text-sm text-red-700">{error}</p> : null}
      <div className="mt-8 flex items-center justify-end border-t border-line pt-5">
        <Button type="submit" disabled={submitting}>
          {submitting ? "Reading your work..." : "Build Career OS"} <Send size={16} />
        </Button>
      </div>
    </form>
  );
}
