import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Shell } from "@/components/ui";
import { resolvePrivateShare } from "@/lib/sharing";
import { addEvent } from "@/lib/store";
import { createId } from "@/lib/ids";
import { AskPassport } from "./ask-passport";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SharedPassportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shared = await resolvePrivateShare(token);
  if (!shared) notFound();
  const { passport, intake } = shared;
  await addEvent({
    id: createId("event"),
    name: "passport_viewed",
    passportId: passport.id,
    createdAt: new Date().toISOString(),
  });

  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 md:grid-cols-[minmax(0,1fr)_340px] md:px-8">
        <article className="min-w-0">
          <header className="border-b border-line pb-10">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Private AI Talent Passport</p>
            <h1 className="path-title mt-5 font-serif text-5xl font-black text-ink md:text-7xl">{passport.identityHeader.name}</h1>
            <p className="mt-4 text-muted-foreground">{passport.identityHeader.currentRole} · {intake.companyOrInstitution}</p>
            <p className="mt-7 max-w-3xl text-xl leading-8 text-foreground">{passport.identityHeader.positioningLine}</p>
            {intake.representativeWorkUrl ? (
              <a className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-line underline-offset-4" href={intake.representativeWorkUrl} target="_blank" rel="noreferrer">
                View representative work <ExternalLink size={14} />
              </a>
            ) : null}
          </header>

          <PublicSection title="What I'm Becoming"><p className="leading-8">{passport.whatImBecoming}</p></PublicSection>
          <PublicSection title="Work as Proof">
            <div className="grid gap-8">
              {passport.proofCards.map((card) => (
                <div className="border-t border-line pt-5" key={card.projectName}>
                  <h3 className="font-serif text-2xl text-ink">{card.projectName}</h3>
                  <p className="mt-3 leading-7">{card.whatIBuilt}</p>
                  <p className="mt-3 leading-7 text-muted-foreground">{card.whyItMatters}</p>
                </div>
              ))}
            </div>
          </PublicSection>
          <PublicSection title="Talent Signals">
            <div className="divide-y divide-line border-y border-line">
              {passport.talentSignals.map((signal) => (
                <div className="grid gap-2 py-5 md:grid-cols-[180px_130px_1fr]" key={signal.capability}>
                  <p className="font-semibold text-ink">{signal.capability}</p>
                  <p className="text-sm text-muted-foreground">{signal.level}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{signal.evidence}</p>
                </div>
              ))}
            </div>
          </PublicSection>
          <PublicSection title="How I Think">
            <div className="grid gap-6 md:grid-cols-2">
              {Object.entries(passport.howIThink).map(([key, value]) => (
                <div className="border-t border-line pt-4" key={key}>
                  <h3 className="font-serif text-xl text-ink">{key === "onAIProducts" ? "On AI Products" : key.replace(/on([A-Z])/, "On $1")}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{value}</p>
                </div>
              ))}
            </div>
          </PublicSection>
          <PublicSection title="Letter to Founders"><p className="whitespace-pre-line leading-8">{passport.letterToFounders}</p></PublicSection>
          <PublicSection title="Missing Proof / Next Edge">
            <p className="leading-8"><strong>Missing proof:</strong> {passport.missingProof.missingProof}</p>
            <p className="mt-3 leading-8"><strong>Next edge:</strong> {passport.missingProof.recommendedNextProject}</p>
          </PublicSection>
        </article>
        <aside className="paper-surface h-fit rounded-[30px] p-5 md:sticky md:top-24">
          <AskPassport token={token} questions={passport.suggestedQuestions} />
        </aside>
      </section>
    </Shell>
  );
}

function PublicSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="border-b border-line py-10"><h2 className="path-title mb-6 font-serif text-3xl font-black text-ink">{title}</h2>{children}</section>;
}
