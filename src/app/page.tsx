import {
  ArrowRight,
  FileUp,
  Grid3X3,
  Search,
  Send,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import type { Route } from "next";
import { LinkButton, Shell } from "@/components/ui";

const sectionRows = [
  ["About", "Bio and introduction"],
  ["Experience", "Work history and roles"],
  ["Projects", "Personal and professional work"],
  ["Education", "Degrees and courses"],
  ["Skills", "Technical and soft skills"],
  ["Awards", "Honors and recognition"],
  ["Speaking", "Talks and presentations"],
  ["Publications", "Articles and research"],
  ["Services", "What you offer"],
  ["Links", "Important links"],
  ["Blog", "Your articles"],
  ["Social Links", "Social media profiles"],
];

const people = [
  ["Kyle Thacker", "Designer, Builder", "Vancouver, Canada"],
  ["Ludo", "Visual Designer", "Berlin, Germany"],
  ["Chris Ho", "Managing Client Reporting", "Chicago, United Kingdom"],
  ["Tina Nguyen", "Creative Director", "Warsaw, Canada"],
  ["Eugene Veronica", "Product Designer", "New York, United States"],
  ["Khouan Fraser", "Talent PM and Advocate", "London, United Kingdom"],
  ["Ankush Ghosh", "Software Engineer", "Remote"],
  ["Gursim Singh", "Software Developer", "San Francisco, United States"],
];

const chips = [
  "Figma",
  "JavaScript",
  "TypeScript",
  "Design Systems",
  "Prototyping",
  "Python",
  "Browse all skills ->",
  "Berlin",
  "Hyderabad",
  "San Francisco",
  "Sao Paulo",
  "Browse all locations ->",
];

function Rail() {
  return (
    <aside className="path-rail fixed inset-y-0 left-0 z-30 hidden w-14 flex-col items-center justify-between border-r border-line bg-white md:flex">
      <div className="pt-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-muted text-ink">
          <Send size={16} fill="currentColor" />
        </span>
      </div>
      <div className="grid gap-6 pb-8 text-muted-foreground">
        {[UserRound, Grid3X3, Search].map((Icon, index) => (
          <span className="grid h-6 w-6 place-items-center" key={index}>
            <Icon size={17} />
          </span>
        ))}
      </div>
    </aside>
  );
}

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
    <div className={`grid h-full gap-5 rounded-xl p-5 text-[10px] ${dark ? "bg-path-green text-white" : "bg-white text-ink"}`}>
      <div className="flex items-center gap-2">
        <span className="h-6 w-6 rounded-full bg-[linear-gradient(135deg,#f29a38,#87532d)]" />
        <div>
          <p className="font-semibold">Sarah Chen</p>
          <p className={dark ? "text-white/54" : "text-muted-foreground"}>
            Staff Software Engineer
          </p>
        </div>
      </div>
      <div className="grid gap-3">
        {["About", "Experience", "Projects", "Education", "Skills"].map((label) => (
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

function PortfolioSheet() {
  return (
    <div className="grid h-full overflow-hidden rounded-xl bg-white p-6 text-left text-[10px] text-ink md:p-8">
      <div className="mb-4">
        <p className="font-serif text-lg font-bold leading-tight md:text-2xl">
          Crafting delightful, human-centric experiences.
        </p>
        <div className="mt-4 flex items-center gap-2">
          <span className="h-6 w-6 rounded-full bg-[linear-gradient(135deg,#c9823c,#40281e)]" />
          <div>
            <p className="font-semibold">Mona Wright</p>
            <p className="text-muted-foreground">Principal Product Designer - London, UK</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-[62px_1fr] gap-5 border-t border-line pt-4">
        <p className="font-semibold text-muted-foreground">About</p>
        <p className="leading-5 text-ink/70">
          Crafting delightful, human-centric experiences through strategy, research,
          and iterative design.
        </p>
      </div>
      <div className="mt-5 grid grid-cols-[62px_1fr] gap-5">
        <p className="font-semibold text-muted-foreground">Projects</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="grid h-24 place-items-center rounded-md bg-[#2589e8] md:h-32">
            <span className="h-10 w-16 rounded-full border-[7px] border-ink" />
          </div>
          <div className="grid h-24 place-items-center rounded-md bg-ink text-white md:h-32">
            <Send size={34} />
          </div>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-[62px_1fr] gap-5">
        <p className="font-semibold text-muted-foreground">Experience</p>
        <div className="grid gap-3">
          {["Lead Product Designer", "Senior Product Designer", "Product Designer"].map((item) => (
            <div className="grid grid-cols-[1fr_auto] border-b border-line pb-2" key={item}>
              <span>{item}</span>
              <span className="text-muted-foreground">Jan 2021 - Current</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditorPreview() {
  return (
    <div className="relative mx-auto mt-12 max-w-4xl">
      <div className="path-green-preview mx-auto min-h-[520px] max-w-2xl rounded-xl p-7 text-left text-[10px] text-white shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:min-h-[690px] md:p-10">
        <CompactProfile dark />
      </div>
      <div className="path-control-panel relative mx-auto mt-6 w-full max-w-[320px] rounded-3xl border border-line bg-white/94 p-5 text-left shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur md:absolute md:-right-12 md:top-14 md:mt-0 md:w-[320px] md:p-6">
        <div className="mx-auto h-36 w-24 rounded-xl bg-path-green p-3">
          <CompactProfile dark />
        </div>
        <button className="mx-auto mt-4 flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-xs font-semibold text-ink">
          <Grid3X3 size={14} /> Change layout
        </button>
        <div className="mt-8 grid gap-5 text-xs">
          <div>
            <p className="mb-3 text-muted-foreground">Header style</p>
            <div className="flex items-center gap-3 rounded-2xl bg-muted p-2">
              <span className="h-10 w-16 rounded-lg bg-path-green" />
              <span className="font-semibold">Simple</span>
            </div>
          </div>
          {["Background color", "Font color", "Auto contrast"].map((label, index) => (
            <div className="flex items-center justify-between" key={label}>
              <span className="font-semibold text-ink">{label}</span>
              <span className={`h-7 w-12 rounded-full ${index === 2 ? "bg-ink" : index === 1 ? "bg-white border border-line" : "bg-path-green"}`} />
            </div>
          ))}
          <div>
            <p className="mb-3 text-muted-foreground">Font</p>
            <div className="rounded-full bg-muted px-4 py-2 font-semibold text-muted-foreground">
              Aa&nbsp;&nbsp; Inter
            </div>
          </div>
          <div className="grid grid-cols-3 rounded-full bg-muted p-1 text-center text-muted-foreground">
            <span className="rounded-full bg-white py-2">Icons</span>
            <span className="py-2">Text</span>
            <span className="py-2">Buttons</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const demoPassportUrl = (process.env.PORTRAY_DEMO_PASSPORT_URL || "/#preview") as Route;
  return (
    <Shell>
      <Rail />

      <section className="mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-24 text-center md:overflow-visible md:pt-28">
        <h1 className="path-title mx-auto max-w-[310px] font-serif text-[44px] font-black leading-[0.9] text-ink sm:max-w-3xl sm:text-6xl md:text-7xl">
          One passport to
          <br />
          show how you think
        </h1>
        <p className="mx-auto mt-7 max-w-[260px] break-normal text-base font-medium leading-7 text-muted-foreground sm:max-w-2xl md:text-2xl md:leading-9">
          Share a resume or LinkedIn source, add one representative work, and
          turn both into an evidence-backed profile people can question.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/create" variant="secondary">
            Request access
          </LinkButton>
          <LinkButton href={demoPassportUrl} variant="secondary">
            Chat with a sample Passport
          </LinkButton>
        </div>

        <div className="path-mock-stage relative mx-auto mt-16 h-[520px] max-w-5xl md:h-[790px]">
          <div className="path-sheet path-sheet-blue mock-float absolute left-1/2 top-32 h-[270px] w-[190px] p-4 md:h-[470px] md:w-[335px]">
            <CompactProfile dark />
          </div>
          <div className="path-sheet path-sheet-orange mock-float absolute left-1/2 top-16 h-[315px] w-[220px] p-4 md:h-[560px] md:w-[400px]">
            <CompactProfile />
          </div>
          <div className="path-sheet path-sheet-white mock-float absolute left-1/2 top-24 h-[350px] w-[250px] p-3 md:h-[620px] md:w-[470px]">
            <PortfolioSheet />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl overflow-hidden px-5 pb-28 text-center md:pb-32" id="preview">
        <h2 className="path-title mx-auto max-w-[270px] font-serif text-[30px] font-black leading-[0.95] text-ink md:max-w-[340px] md:text-5xl">
          Look your best,
          <br />
          without the work
        </h2>
        <p className="mx-auto mt-5 max-w-[260px] break-normal text-sm leading-6 text-muted-foreground md:max-w-lg md:text-base">
          Review every evidence-backed section, refine the language, and keep
          the final story unmistakably yours.
        </p>
        <EditorPreview />
      </section>

      <section className="mx-auto max-w-5xl px-5 pb-28 text-center" id="sections">
        <h2 className="path-title font-serif text-4xl font-black leading-none text-ink md:text-5xl">
          A structure for real signal
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
          Portray connects your career source to one selected proof, then drafts
          a founder-facing view of what you made, how you think, and what you
          should prove next.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl overflow-hidden rounded-xl border border-line bg-white text-left text-xs md:grid-cols-3">
          {sectionRows.map(([title, body], index) => (
            <div
              className={`border-line p-5 ${index < 9 ? "border-b" : ""} ${index % 3 !== 2 ? "md:border-r" : ""}`}
              key={title}
            >
              <p className="font-bold text-ink">{title}</p>
              <p className="mt-1 text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="path-topography min-h-[760px] px-5 py-28 text-center text-white md:py-36">
        <div className="mx-auto max-w-4xl">
          <h2 className="path-title font-serif text-4xl font-black leading-[0.95] md:text-5xl">
            Start with
            <br />one proof
          </h2>
          <p className="mx-auto mt-5 max-w-xs text-sm leading-6 text-white/72">
            Share a resume or LinkedIn source plus one representative work.
            Portray turns them into a founder-facing passport.
          </p>
          <div className="relative mx-auto mt-14 grid h-56 max-w-lg place-items-center">
            <div className="absolute left-5 top-8 rotate-[-16deg] rounded-xl bg-white p-5 text-ink shadow-2xl md:left-20">
              <FileUp size={30} />
              <p className="mt-3 text-xs font-bold">WORK</p>
            </div>
            <div className="path-upload-target grid h-32 w-32 place-items-center rounded-2xl">
              <FileUp size={28} />
            </div>
          </div>
          <LinkButton href="/create" className="border-white/15 bg-white/14 text-white hover:bg-white/20">
            Request access
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-28 text-center" id="discovery">
        <h2 className="path-title font-serif text-4xl font-black leading-none text-ink md:text-5xl">
          Shared on your terms
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
          Your Passport stays private until you create a revocable link. Visitors
          can inspect the proof and ask evidence-constrained questions.
        </p>
        <div className="mx-auto mt-12 max-w-5xl">
          <div className="mb-4 flex flex-wrap justify-center gap-2 text-xs">
            <span className="rounded-full border border-line bg-white px-4 py-2 text-muted-foreground">
              <Search size={13} className="mr-1 inline" /> Search
            </span>
            {["Location", "Company", "Skills"].map((filter) => (
              <span className="rounded-full border border-line bg-white px-4 py-2" key={filter}>
                {filter}
              </span>
            ))}
          </div>
          <div className="path-people-grid grid gap-3 text-left sm:grid-cols-2 lg:grid-cols-4">
            {people.map(([name, role, place], index) => (
              <article className="rounded-lg bg-muted p-4" key={name}>
                <div className="mb-3 h-9 w-9 rounded-full bg-white shadow-inner">
                  <span
                    className="block h-full w-full rounded-full opacity-80"
                    style={{
                      background:
                        index % 4 === 0
                          ? "#d8a06b"
                          : index % 4 === 1
                            ? "#002fa7"
                            : index % 4 === 2
                              ? "#0046ff"
                              : "#d8d8ce",
                    }}
                  />
                </div>
                <p className="font-bold text-ink">{name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{role}</p>
                <p className="mt-3 text-xs text-muted-foreground">{place}</p>
              </article>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <LinkButton href="/create" variant="secondary">
              Build your Passport <ArrowRight size={13} />
            </LinkButton>
          </div>
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
            {chips.map((chip) => (
              <span
                className="rounded-full border border-line bg-white px-3 py-1.5 text-xs text-muted-foreground"
                key={chip}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-24 text-center" id="pricing">
        <h2 className="path-title font-serif text-5xl font-black leading-none text-ink md:text-6xl">
          Request quiet access
        </h2>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
          A concise career source and one proof are enough. We read for clarity,
          curiosity, and signal.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/create" variant="secondary">
            Request access
          </LinkButton>
          <LinkButton href="/#preview" variant="secondary">
            View example
          </LinkButton>
        </div>
      </section>

      <footer className="path-topography mx-auto grid max-w-[1280px] overflow-hidden text-white md:grid-cols-[1fr_0.9fr]">
        <div className="p-8 md:p-12">
          <p className="text-xs text-white/62">Build your Portray Passport</p>
          <div className="mt-8 grid gap-2 text-sm text-white/72">
            {[
              "People",
              "Browse by skill",
              "Browse by location",
              "Projects",
              "Templates",
              "Pricing",
              "Company",
              "Import",
              "Blog",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="grid place-items-center border-t border-white/10 p-8 md:border-l md:border-t-0">
          <div className="text-center">
            <p className="font-serif text-2xl font-black leading-none">
              Turn one proof
              <br />
              into a profile agent
            </p>
            <div className="path-upload-target mx-auto mt-6 grid h-28 w-28 place-items-center rounded-2xl">
              <FileUp size={26} />
            </div>
          </div>
        </div>
        <div className="col-span-full flex min-h-72 items-end justify-between border-t border-white/10 p-5 md:min-h-80 md:p-8">
          <p className="path-title font-sans text-[21vw] font-black leading-[0.72] tracking-[-0.08em] md:text-[13rem]">
            Portray
          </p>
          <div className="mb-2 hidden text-right text-xs text-white/62 md:block">
            <p>X / Talent</p>
            <p>Terms</p>
            <p>Privacy</p>
          </div>
        </div>
      </footer>

      <div className="path-bottom-nav fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 py-2 text-muted-foreground md:hidden">
        {[Send, SlidersHorizontal, Grid3X3, Search].map((Icon, index) => (
          <div className="grid place-items-center" key={index}>
            <span className={`grid h-9 w-9 place-items-center rounded-xl ${index === 0 ? "bg-muted text-ink" : ""}`}>
              <Icon size={15} />
            </span>
          </div>
        ))}
      </div>
    </Shell>
  );
}
