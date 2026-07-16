import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Link2,
  MessageSquareText,
  PencilLine,
  Send,
  Sparkles,
} from "lucide-react";
import type { Route } from "next";
import { LinkButton, Shell } from "@/components/ui";

const passportSections = [
  ["Identity layer", "Who you are now, where you are moving, and the role language that makes the transition legible."],
  ["Becoming narrative", "A career transition story assembled from evidence, not aspiration."],
  ["Proof graph", "Representative work converted into capability signal recruiters and founders can inspect."],
  ["Signal map", "Specific strengths with current evidence, never a synthetic total score."],
  ["Operating principles", "Point-of-view sections that show how you think, decide, and collaborate with AI."],
  ["Founder intro", "A concise outreach layer you can reuse when the conversation gets real."],
  ["Next proof", "The next proof-of-work that would make the system stronger."],
];

const buildSteps = [
  ["Career source", "Start with the resume, LinkedIn, or work material you already have."],
  ["Signal calibration", "Answer the prompts that reveal direction, taste, proof, and where you are headed next."],
  ["Career OS draft", "Get a working system you can edit, export, share, and let others query."],
];

const productPromises = [
  ["Editable OS layers", PencilLine, "Tune each generated section before it becomes part of your public signal."],
  ["Portable manuscript", FileText, "Copy or download a clean Markdown version for docs, intros, and applications."],
  ["Private signal link", Link2, "Create a revocable link when you are ready to let someone inspect the system."],
  ["Ask My Passport", MessageSquareText, "Let visitors ask evidence-bound questions without inventing claims."],
];

function LineStack({ dark = false }: { dark?: boolean }) {
  return (
    <div className="grid gap-2">
      <span className={`h-1.5 rounded-full ${dark ? "bg-white/38" : "bg-ink/12"}`} />
      <span className={`h-1.5 w-4/5 rounded-full ${dark ? "bg-white/24" : "bg-ink/8"}`} />
    </div>
  );
}

function CompactProfile({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`grid h-full gap-5 rounded-xl p-5 text-[10px] ${
        dark ? "bg-path-green text-white" : "bg-white text-ink"
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-full bg-[linear-gradient(135deg,#f29a38,#87532d)]" />
        <div>
          <p className="font-semibold">Mona Wright</p>
          <p className={dark ? "text-white/54" : "text-muted-foreground"}>
            Product Designer -&gt; AI Product Designer
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {["Direction", "Proof", "Signals", "Principles", "Next move"].map((label) => (
          <div className="grid grid-cols-[62px_1fr] gap-3" key={label}>
            <p className={dark ? "text-white/55" : "text-muted-foreground"}>{label}</p>
            <LineStack dark={dark} />
          </div>
        ))}
      </div>
      <div className="mt-auto grid grid-cols-2 gap-2">
        <span className="h-9 rounded-md bg-path-orange" />
        <span className="h-9 rounded-md bg-path-blue" />
      </div>
    </div>
  );
}

function PassportSheet() {
  return (
    <div className="grid h-full overflow-hidden rounded-xl bg-white p-6 text-left text-[10px] text-ink md:p-8">
      <div className="mb-4">
        <p className="font-serif text-lg font-bold leading-tight md:text-2xl">
          I turn product judgment into human-AI workflows teams can trust.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-[linear-gradient(135deg,#c9823c,#40281e)]" />
          <div>
            <p className="font-semibold">Mona Wright</p>
            <p className="text-muted-foreground">Product Designer - London, UK</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[72px_1fr] gap-5 border-t border-line pt-4">
        <p className="font-semibold text-muted-foreground">Proof</p>
        <p className="leading-5 text-ink/70">
          Reframed an onboarding case study into evidence for agentic product design:
          expectation-setting, feedback loops, and trust recovery.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-[72px_1fr] gap-5">
        <p className="font-semibold text-muted-foreground">Signals</p>
        <div className="grid gap-2">
          {["Product framing", "Human-AI systems", "Founder communication"].map(
            (item) => (
              <div className="grid grid-cols-[1fr_auto] border-b border-line pb-2" key={item}>
                <span>{item}</span>
                <span className="text-muted-foreground">Active</span>
              </div>
            ),
          )}
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[72px_1fr] gap-5">
        <p className="font-semibold text-muted-foreground">Next</p>
        <p className="leading-5 text-ink/70">
          Ship a small demo that proves the workflow can operate in the wild.
        </p>
      </div>
    </div>
  );
}

function HeroMock() {
  return (
    <div className="path-mock-stage relative mx-auto mt-14 h-[520px] max-w-5xl md:h-[760px]">
      <div className="path-sheet path-sheet-blue mock-float absolute left-1/2 top-32 h-[270px] w-[190px] p-4 md:h-[470px] md:w-[335px]">
        <CompactProfile dark />
      </div>
      <div className="path-sheet path-sheet-orange mock-float absolute left-1/2 top-16 h-[315px] w-[220px] p-4 md:h-[560px] md:w-[400px]">
        <CompactProfile />
      </div>
      <div className="path-sheet path-sheet-white mock-float absolute left-1/2 top-24 h-[350px] w-[250px] p-3 md:h-[620px] md:w-[470px]">
        <PassportSheet />
      </div>
    </div>
  );
}

export default function Home() {
  const demoPassportUrl = process.env.PORTRAY_DEMO_PASSPORT_URL?.trim();

  return (
    <Shell>
      <section className="mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-24 text-center md:overflow-visible md:pt-28">
        <p className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-muted-foreground shadow-[0_8px_22px_rgba(0,0,0,0.04)]">
          <Sparkles size={14} className="text-path-green" />
          Welcome to the age of agentic careers
        </p>
        <h1 className="path-title mx-auto max-w-[280px] font-serif text-[34px] font-black leading-[0.94] text-ink sm:max-w-4xl sm:text-6xl md:text-7xl">
          Portray is your
          <br />
          Agentic Career OS
        </h1>
        <p className="mx-auto mt-7 max-w-[260px] break-words text-base font-medium leading-7 text-muted-foreground sm:max-w-2xl md:text-2xl md:leading-9">
          You provide the proof. Portray turns scattered career material into an
          evidence-backed operating system for narrative, signal, sharing, and questions.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton href="/create" variant="secondary">
            Build my Career OS <ArrowRight size={13} />
          </LinkButton>
          {demoPassportUrl ? (
            <LinkButton href={demoPassportUrl as Route} variant="ghost">
              Ask a sample Passport
            </LinkButton>
          ) : (
            <LinkButton href="/#preview" variant="ghost">
              See the Passport layer
            </LinkButton>
          )}
        </div>

        <HeroMock />
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-28 text-center" id="preview">
        <h2 className="path-title mx-auto max-w-[280px] font-serif text-[30px] font-black leading-[0.98] text-ink sm:max-w-xl sm:text-4xl md:text-5xl">
          From source material to a working career system
        </h2>
        <div className="mx-auto mt-12 grid max-w-5xl gap-5 text-left md:grid-cols-3">
          {buildSteps.map(([title, body], index) => (
            <div className="border-t border-line pt-5" key={title}>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Step {index + 1}
              </p>
              <h3 className="mt-3 font-serif text-2xl text-ink">{title}</h3>
              <p className="mt-3 max-w-[260px] break-words text-sm leading-6 text-muted-foreground sm:max-w-none">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="path-topography px-5 py-28 text-white md:py-36">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.78fr_1.22fr] md:items-start">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/62">
              Operating structure
            </p>
            <h2 className="path-title mt-5 max-w-[280px] font-serif text-[30px] font-black leading-[0.98] md:max-w-md md:text-5xl">
              An OS needs structure, not another profile
            </h2>
            <p className="mt-5 max-w-[270px] break-words text-sm leading-6 text-white/72 md:max-w-sm">
              Every layer has one job: make your existing work legible as future-facing
              proof while keeping unsupported claims out of the system.
            </p>
          </div>
          <div className="grid gap-3">
            {passportSections.map(([title, body]) => (
              <div
                className="grid min-w-0 gap-3 border-t border-white/14 py-4 md:grid-cols-[190px_1fr]"
                key={title}
              >
                <p className="min-w-0 font-serif text-xl text-white">{title}</p>
                <p className="min-w-0 max-w-[270px] break-words text-sm leading-6 text-white/70 md:max-w-none">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-28" id="product">
        <div className="grid gap-12 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
              After the draft
            </p>
            <h2 className="path-title mt-5 max-w-[280px] font-serif text-[30px] font-black leading-[0.98] text-ink md:max-w-lg md:text-5xl">
              Operate your signal after generation
            </h2>
            <p className="mt-5 max-w-[270px] break-words text-sm leading-6 text-muted-foreground md:max-w-md">
              The first version focuses on the real workflow: review the draft, sharpen
              the language, export the manuscript, share it privately, and collect feedback.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap">
              <LinkButton href="/create" variant="secondary">
                Start the intake
              </LinkButton>
              {demoPassportUrl ? (
                <LinkButton href={demoPassportUrl as Route} variant="ghost">
                  Try the sample
                </LinkButton>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4">
            {productPromises.map(([title, Icon, body]) => (
              <div
                className="grid min-w-0 grid-cols-[36px_1fr] gap-4 border-t border-line py-5"
                key={title as string}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-muted text-path-green">
                  <Icon size={17} />
                </span>
                <div className="min-w-0">
                  <h3 className="font-serif text-2xl text-ink">{title as string}</h3>
                  <p className="mt-2 max-w-[270px] break-words text-sm leading-6 text-muted-foreground md:max-w-none">
                    {body as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 text-center" id="pricing">
        <h2 className="path-title mx-auto max-w-[290px] font-serif text-[34px] font-black leading-[0.98] text-ink sm:max-w-2xl md:text-6xl">
          Start with proof. Let the OS assemble.
        </h2>
        <p className="mx-auto mt-5 max-w-[270px] break-words text-sm leading-6 text-muted-foreground sm:max-w-md">
          The beta is designed to learn whether your generated Career OS feels accurate,
          useful, and worth sharing before we add more automation.
        </p>
        <div className="mx-auto mt-8 grid max-w-lg gap-3 text-left text-sm text-muted-foreground sm:grid-cols-3">
          {["Assemble", "Edit", "Share"].map((item) => (
            <div className="flex items-center gap-2 border-t border-line pt-4" key={item}>
              <CheckCircle2 size={16} className="shrink-0 text-path-green" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
          <LinkButton href="/create" variant="secondary">
            Build my Career OS <ArrowRight size={13} />
          </LinkButton>
          <LinkButton href="/#preview" variant="ghost">
            Review the system
          </LinkButton>
        </div>
      </section>

      <footer className="path-topography mx-auto grid max-w-[1280px] overflow-hidden text-white">
        <div className="grid gap-10 p-8 md:grid-cols-[1fr_auto] md:p-12">
          <div>
            <p className="font-serif text-3xl font-black leading-none">
              Portray
              <br />
              Agentic Career OS
            </p>
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/68">
              A proof-based career system for people moving toward AI-native work.
            </p>
          </div>
          <div className="flex items-start md:justify-end">
            <LinkButton
              href="/create"
              className="border-white/15 bg-white/14 text-white hover:bg-white/20"
            >
              Start with your source <Send size={14} />
            </LinkButton>
          </div>
        </div>
        <div className="border-t border-white/10 p-5 md:p-8">
          <p className="path-title font-sans text-[21vw] font-black leading-[0.72] md:text-[13rem]">
            Portray
          </p>
        </div>
      </footer>
    </Shell>
  );
}
