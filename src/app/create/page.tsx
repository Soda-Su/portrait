import { SectionLabel, Shell } from "@/components/ui";
import { IntakeForm } from "./intake-form";

export default function CreatePage() {
  return (
    <Shell>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-10 overflow-hidden px-5 py-14 md:grid-cols-[0.72fr_1.28fr] md:px-8">
        <div className="min-w-0 max-w-[calc(100vw-2.5rem)] md:sticky md:top-28 md:h-fit md:max-w-none">
          <SectionLabel>Agentic profile</SectionLabel>
          <h1 className="mt-5 font-serif text-[40px] leading-[1.02] text-ink md:text-6xl md:leading-tight">
            <span className="block">Build your</span>
            <span className="block">Passport from</span>
            <span className="block">real proof.</span>
          </h1>
          <p className="mt-6 leading-7 text-muted-foreground">
            Share a resume or LinkedIn source, add one representative work, then
            complete the selective beta context. Portray drafts a profile with
            evidence, gaps, and editable narrative sections.
          </p>
          <div className="mt-10 hidden border-t border-line pt-7 md:block">
            <p className="text-sm font-medium text-ink">Builder note</p>
            <p className="mt-4 max-w-xs text-lg leading-8 text-muted-foreground">
              One strong proof is enough for a first pass. The agent should
              make your signal legible without pretending the missing evidence
              already exists.
            </p>
          </div>
        </div>
        <IntakeForm />
      </section>
    </Shell>
  );
}
