import { Suspense } from "react";
import { SectionLabel, Shell } from "@/components/ui";
import { GeneratingRedirect } from "./redirect";

export default function GeneratingPage() {
  const steps = [
    "Reading your participant profile...",
    "Examining your representative work...",
    "Tracing the question guiding your next phase...",
    "Extracting talent signals...",
    "Writing your founder-facing letter...",
    "Creating your AI Talent Passport...",
  ];

  return (
    <Shell>
      <section className="mx-auto grid min-h-[70vh] max-w-5xl place-items-center px-5 py-16 text-center md:px-8">
        <div className="paper-surface w-full rounded-[36px] p-6 md:p-10">
          <SectionLabel>Generating</SectionLabel>
          <h1 className="path-title mx-auto mt-5 max-w-3xl font-serif text-5xl font-bold leading-none text-ink">
            Portray is assembling your passport.
          </h1>
          <div className="mx-auto mt-10 grid max-w-2xl gap-3 text-left">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-path-green bg-path-green text-xs text-white">
                  {index + 1}
                </span>
                <span className="text-sm text-ink">{step}</span>
              </div>
            ))}
          </div>
          <Suspense fallback={null}>
            <GeneratingRedirect />
          </Suspense>
        </div>
      </section>
    </Shell>
  );
}
