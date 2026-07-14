"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  Download,
  ExternalLink,
  FileText,
  Hand,
  Link2,
  LockKeyhole,
  RefreshCcw,
  Save,
  Send,
} from "lucide-react";
import { Button, Field, inputClass, textareaClass } from "@/components/ui";
import { passportToMarkdown, sectionToText } from "@/lib/markdown";
import type { Passport, PassportSection } from "@/lib/types";

type Props = {
  initialPassport: Passport;
  initialFeedbackCount: number;
  initialShareActive?: boolean;
};

type FeedbackState = {
  usefulness: string;
  accurate: string;
  wrong: string;
  wouldUse: boolean;
  wouldPay: boolean;
};

const sectionLabels: Record<PassportSection, string> = {
  identityHeader: "Identity Header",
  whatImBecoming: "What I'm Becoming",
  proofCards: "Best Existing Proof",
  talentSignals: "Talent Signals",
  howIThink: "How I Think",
  letterToFounders: "Letter to Founders",
  missingProof: "Missing Proof / Next Step",
};

const editableSections: PassportSection[] = [
  "whatImBecoming",
  "letterToFounders",
  "howIThink",
  "missingProof",
];

export function PassportEditor({
  initialPassport,
  initialFeedbackCount,
  initialShareActive = false,
}: Props) {
  const [passport, setPassport] = useState(initialPassport);
  const [editing, setEditing] = useState<PassportSection | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [feedbackCount, setFeedbackCount] = useState(initialFeedbackCount);
  const [shareActive, setShareActive] = useState(initialShareActive);
  const [shareUrl, setShareUrl] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>({
    usefulness: "Useful",
    accurate: "",
    wrong: "",
    wouldUse: true,
    wouldPay: false,
  });

  const markdown = useMemo(() => passportToMarkdown(passport), [passport]);

  async function copyText(value: string, message = "Copied") {
    await navigator.clipboard.writeText(value);
    setStatus(message);
  }

  function beginEdit(section: PassportSection, value: unknown) {
    setEditing(section);
    setDraft(sectionToText(section, value));
  }

  async function saveSection() {
    if (!editing) return;
    let value: unknown = draft;
    if (editing === "howIThink" || editing === "missingProof") {
      value = JSON.parse(draft);
    }
    const response = await fetch(`/api/passports/${passport.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: editing, value }),
    });
    const data = await response.json();
    if (response.ok) {
      setPassport(data);
      setEditing(null);
      setStatus("Saved");
    } else {
      setStatus(data.error || "Could not save");
    }
  }

  async function regenerate(section: PassportSection) {
    setStatus("Regenerating...");
    const response = await fetch(`/api/passports/${passport.id}/regenerate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section }),
    });
    const data = await response.json();
    if (response.ok) {
      setPassport(data);
      setStatus(`${sectionLabels[section]} regenerated`);
    } else {
      setStatus(data.error || "Could not regenerate");
    }
  }

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${passport.identityHeader.name.toLowerCase().replace(/\s+/g, "-")}-portray.md`;
    anchor.click();
    URL.revokeObjectURL(url);
    setStatus("Markdown downloaded");
  }

  async function manageShare(action: "enable" | "rotate" | "revoke") {
    setStatus(action === "revoke" ? "Revoking..." : "Creating private link...");
    const response = await fetch(`/api/passports/${passport.id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await response.json();
    if (response.ok) {
      setShareActive(data.active);
      setShareUrl(data.url || "");
      setStatus(data.url ? "Private link created" : "Private link revoked");
    } else {
      setStatus(data.error || "Could not update sharing");
    }
  }

  async function retryPassport() {
    setStatus("Retrying generation...");
    const response = await fetch(`/api/passports/${passport.id}/retry`, { method: "POST" });
    const data = await response.json();
    if (response.ok) {
      setPassport(data);
      setStatus("Passport generated");
    } else {
      setStatus(data.error || "Generation failed");
    }
  }

  async function submitFeedback() {
    const response = await fetch(`/api/passports/${passport.id}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedback),
    });
    if (response.ok) {
      setFeedbackCount((count) => count + 1);
      setStatus("Feedback saved");
      setFeedback((current) => ({ ...current, accurate: "", wrong: "" }));
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-5 py-12 md:grid-cols-[minmax(0,1fr)_330px] md:px-8">
      <article className="paper-surface min-w-0 rounded-[34px] p-4 sm:p-5 md:p-8">
        {passport.generationStatus === "failed" ? (
          <div className="mb-6 border-b border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Generation needs attention: {passport.generationError || "The AI provider did not return a valid Passport."}
          </div>
        ) : null}
        <header className="border-b border-line pb-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              AI Talent Passport
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/50 px-3 py-1 text-xs text-ink backdrop-blur-xl">
              <Hand size={14} className="text-path-green" />
              Digital proof card
            </span>
          </div>
          <h1 className="mt-5 font-serif text-4xl text-ink sm:text-5xl">
            {passport.identityHeader.name}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {passport.identityHeader.currentRole} -&gt;{" "}
            {passport.identityHeader.targetRole}
          </p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-foreground sm:text-xl">
            {passport.identityHeader.positioningLine}
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/44 px-3 py-2 backdrop-blur-xl">
              <Link2 size={15} className="text-path-green" />
              Shareable identity
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-white/44 px-3 py-2 backdrop-blur-xl">
              <FileText size={15} className="text-path-green" />
              Founder-facing manuscript
            </span>
          </div>
        </header>

        <PassportSectionBlock
          title="What I'm Becoming"
          section="whatImBecoming"
          onCopy={() => copyText(passport.whatImBecoming)}
          onEdit={() => beginEdit("whatImBecoming", passport.whatImBecoming)}
          onRegenerate={() => regenerate("whatImBecoming")}
        >
          <p className="leading-8 text-foreground">{passport.whatImBecoming}</p>
        </PassportSectionBlock>

        <PassportSectionBlock
          title="Work as Proof"
          section="proofCards"
          onCopy={() => copyText(sectionToText("proofCards", passport.proofCards))}
          onRegenerate={() => regenerate("proofCards")}
        >
          <div className="grid gap-5">
            {passport.proofCards.map((card) => (
              <div key={card.projectName} className="editorial-card rounded-[24px] p-5">
                <h3 className="font-serif text-2xl text-ink">{card.projectName}</h3>
                <p className="mt-2 text-sm font-medium text-ink">
                  {card.targetRoleSignal}
                </p>
                <p className="mt-4 leading-7 text-foreground">{card.whatIBuilt}</p>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {card.whyItMatters}
                </p>
                <p className="mt-4 text-sm text-ink">
                  {card.capabilities.join(" / ")}
                </p>
              </div>
            ))}
          </div>
        </PassportSectionBlock>

        <PassportSectionBlock
          title="Talent Signals"
          section="talentSignals"
          onCopy={() => copyText(sectionToText("talentSignals", passport.talentSignals))}
          onRegenerate={() => regenerate("talentSignals")}
        >
          <div className="grid gap-3 md:hidden">
            {passport.talentSignals.map((signal) => (
              <div key={signal.capability} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-medium text-ink">{signal.capability}</h3>
                  <span className="shrink-0 rounded-full border border-line bg-white/50 px-3 py-1 text-xs text-ink backdrop-blur-xl">
                    {signal.level}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {signal.evidence}
                </p>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted-foreground">
                  <th className="py-3 pr-4 font-medium">Capability</th>
                  <th className="w-36 py-3 pr-4 font-medium">Signal</th>
                  <th className="py-3 font-medium">Current evidence</th>
                </tr>
              </thead>
              <tbody>
                {passport.talentSignals.map((signal) => (
                  <tr key={signal.capability} className="border-b border-line">
                    <td className="py-4 pr-4 text-ink">{signal.capability}</td>
                    <td className="w-36 py-4 pr-4">
                      <span className="inline-flex whitespace-nowrap rounded-full border border-line bg-white/50 px-3 py-1 text-xs text-ink backdrop-blur-xl">
                        {signal.level}
                      </span>
                    </td>
                    <td className="py-4 leading-6 text-muted-foreground">
                      {signal.evidence}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PassportSectionBlock>

        <PassportSectionBlock
          title="How I Think"
          section="howIThink"
          onCopy={() => copyText(sectionToText("howIThink", passport.howIThink))}
          onEdit={() => beginEdit("howIThink", passport.howIThink)}
          onRegenerate={() => regenerate("howIThink")}
        >
          <div className="grid gap-5 md:grid-cols-2">
            {Object.entries(passport.howIThink).map(([key, value]) => (
              <div key={key} className="rounded-[22px] border border-line bg-white p-4">
                <h3 className="font-serif text-xl text-ink">
                  {key === "onAIProducts" ? "On AI Products" : key.replace(/on([A-Z])/, "On $1")}
                </h3>
                <p className="mt-3 leading-7 text-muted-foreground">{value}</p>
              </div>
            ))}
          </div>
        </PassportSectionBlock>

        <PassportSectionBlock
          title="Letter to Founders"
          section="letterToFounders"
          onCopy={() => copyText(passport.letterToFounders)}
          onEdit={() => beginEdit("letterToFounders", passport.letterToFounders)}
          onRegenerate={() => regenerate("letterToFounders")}
        >
          <p className="whitespace-pre-line leading-8 text-foreground">
            {passport.letterToFounders}
          </p>
        </PassportSectionBlock>

        <PassportSectionBlock
          title="Missing Proof / Next Edge"
          section="missingProof"
          onCopy={() => copyText(sectionToText("missingProof", passport.missingProof))}
          onEdit={() => beginEdit("missingProof", passport.missingProof)}
          onRegenerate={() => regenerate("missingProof")}
        >
          <div className="grid gap-4 leading-7">
            <p>
              <strong className="text-ink">Strongest signals:</strong>{" "}
              {passport.missingProof.strongestSignals.join(", ")}
            </p>
            <p>
              <strong className="text-ink">Missing proof:</strong>{" "}
              {passport.missingProof.missingProof}
            </p>
            <p>
              <strong className="text-ink">Recommended next proof-of-work:</strong>{" "}
              {passport.missingProof.recommendedNextProject}
            </p>
            <p>
              <strong className="text-ink">Why this matters:</strong>{" "}
              {passport.missingProof.whyItMatters}
            </p>
          </div>
        </PassportSectionBlock>
      </article>

      <aside className="paper-surface min-w-0 rounded-[30px] p-5 md:sticky md:top-24 md:h-fit">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Passport controls
        </p>
        <div className="mt-5 grid gap-3">
          <Button variant="secondary" onClick={() => copyText(markdown, "Markdown copied")}>
            <FileText size={16} /> Copy full markdown
          </Button>
          <Button variant="secondary" onClick={downloadMarkdown}>
            <Download size={16} /> Download markdown
          </Button>
          {passport.generationStatus === "failed" ? (
            <Button variant="secondary" onClick={retryPassport}>
              <RefreshCcw size={16} /> Retry generation
            </Button>
          ) : null}
        </div>
        <div className="mt-8 border-t border-line pt-6">
          <div className="flex items-center gap-2">
            <LockKeyhole size={16} className="text-path-green" />
            <p className="font-serif text-2xl text-ink">Private sharing</p>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {shareActive ? "A private link is active. Rotate it to create a new copyable URL." : "Create an unguessable, read-only Passport link."}
          </p>
          <div className="mt-4 grid gap-2">
            <Button onClick={() => manageShare(shareActive ? "rotate" : "enable")}>
              <Link2 size={16} /> {shareActive ? "Rotate private link" : "Create private link"}
            </Button>
            {shareActive ? <Button variant="ghost" onClick={() => manageShare("revoke")}>Revoke link</Button> : null}
          </div>
          {shareUrl ? (
            <div className="mt-4 grid gap-2">
              <a className="focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-ink bg-ink px-4 text-xs font-semibold text-white" href={shareUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={14} /> Open visitor page
              </a>
              <button className="w-full overflow-hidden text-ellipsis whitespace-nowrap rounded-2xl border border-line bg-muted px-3 py-2 text-left text-xs text-muted-foreground" type="button" onClick={() => copyText(shareUrl, "Private link copied")} title="Copy private link">
                {shareUrl}
              </button>
            </div>
          ) : null}
        </div>
        {status ? <p className="mt-4 text-sm text-ink">{status}</p> : null}

        <div className="mt-8 border-t border-line pt-6">
          <p className="font-serif text-2xl text-ink">Feedback</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {feedbackCount} response{feedbackCount === 1 ? "" : "s"} saved.
          </p>
          <div className="mt-5 grid gap-4">
            <Field label="How useful was this?">
              <select
                className={inputClass}
                value={feedback.usefulness}
                onChange={(event) =>
                  setFeedback((current) => ({
                    ...current,
                    usefulness: event.target.value,
                  }))
                }
              >
                <option>Useful</option>
                <option>Very useful</option>
                <option>Not useful yet</option>
              </select>
            </Field>
            <Field label="What felt accurate?">
              <textarea
                className={textareaClass}
                value={feedback.accurate}
                onChange={(event) =>
                  setFeedback((current) => ({ ...current, accurate: event.target.value }))
                }
              />
            </Field>
            <Field label="What felt wrong?">
              <textarea
                className={textareaClass}
                value={feedback.wrong}
                onChange={(event) =>
                  setFeedback((current) => ({ ...current, wrong: event.target.value }))
                }
              />
            </Field>
            <label className="flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={feedback.wouldUse}
                onChange={(event) =>
                  setFeedback((current) => ({
                    ...current,
                    wouldUse: event.target.checked,
                  }))
                }
              />
              I would use this for real introductions.
            </label>
            <label className="flex items-center gap-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={feedback.wouldPay}
                onChange={(event) =>
                  setFeedback((current) => ({
                    ...current,
                    wouldPay: event.target.checked,
                  }))
                }
              />
              I would pay for a human-reviewed version.
            </label>
            <Button onClick={submitFeedback}>
              <Send size={16} /> Submit feedback
            </Button>
          </div>
        </div>
      </aside>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-ink/35 p-4 backdrop-blur-xl">
          <div className="paper-surface w-full max-w-2xl rounded-[30px] p-5 shadow-2xl">
            <h2 className="font-serif text-3xl text-ink">Edit {sectionLabels[editing]}</h2>
            <textarea
              className={`${textareaClass} mt-5 min-h-[340px] font-mono text-xs`}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={saveSection}>
                <Save size={16} /> Save
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PassportSectionBlock({
  title,
  section,
  children,
  onCopy,
  onEdit,
  onRegenerate,
}: {
  title: string;
  section: PassportSection;
  children: React.ReactNode;
  onCopy: () => void;
  onEdit?: () => void;
  onRegenerate: () => void;
}) {
  return (
    <section className="border-b border-line py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl text-ink sm:text-3xl">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {onEdit ? (
            <Button variant="ghost" className="min-h-9 px-3" onClick={onEdit}>
              Edit
            </Button>
          ) : null}
          <Button variant="ghost" className="min-h-9 px-3" onClick={onCopy}>
            <Copy size={15} /> Copy
          </Button>
          <Button
            variant="ghost"
            className="min-h-9 px-3"
            onClick={onRegenerate}
            disabled={!editableSections.includes(section) && section === "identityHeader"}
          >
            <RefreshCcw size={15} /> Regenerate
          </Button>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}
