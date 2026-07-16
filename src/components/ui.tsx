import Link from "next/link";
import type { Route } from "next";
import type { ComponentProps } from "react";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "border-ink bg-ink text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:bg-[#111]",
    secondary:
      "border-line bg-white text-ink shadow-[0_8px_22px_rgba(0,0,0,0.05)] hover:bg-[#f7f7f2]",
    ghost:
      "border-transparent bg-transparent text-ink hover:border-line hover:bg-[#f7f7f2]",
  };
  return (
    <button
      className={`focus-ring hover-lift inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-45 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function LinkButton({
  className = "",
  variant = "primary",
  ...props
}: LinkButtonProps) {
  const variants = {
    primary:
      "border-ink bg-ink text-white shadow-[0_12px_28px_rgba(0,0,0,0.12)] hover:bg-[#111]",
    secondary:
      "border-line bg-white text-ink shadow-[0_8px_22px_rgba(0,0,0,0.05)] hover:bg-[#f7f7f2]",
    ghost:
      "border-transparent bg-transparent text-ink hover:border-line hover:bg-[#f7f7f2]",
  };
  return (
    <Link
      className={`focus-ring hover-lift inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-ink/90">{label}</span>
      {children}
      {hint ? <span className="text-xs leading-5 text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "focus-ring min-h-11 min-w-0 w-full rounded-2xl border border-line bg-white px-4 py-2 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] placeholder:text-muted-foreground";

export const textareaClass = `${inputClass} min-h-32 resize-y leading-6`;

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </p>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between bg-white/76 px-4 text-ink backdrop-blur-xl md:px-8">
        <span aria-hidden className="hidden md:block" />
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-black md:absolute md:left-1/2 md:-translate-x-1/2"
          aria-label="Portray home"
        >
          <span className="grid h-6 w-6 place-items-center rounded-full bg-ink font-serif text-[15px] font-black leading-none text-white" aria-hidden>
            P
          </span>
          <span>Portray</span>
        </Link>
        <nav className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex md:right-8 md:gap-3">
          <Link className="rounded-full px-2 py-2 hover:bg-muted hover:text-ink md:px-3" href="/#pricing">
            Pricing
          </Link>
          <Link className="rounded-full border border-line bg-white px-3 py-2 text-ink shadow-[0_8px_22px_rgba(0,0,0,0.04)] hover:bg-muted" href={"/app" as Route}>
            Log in
          </Link>
          <LinkButton href="/create" variant="secondary" className="!hidden min-h-9 px-3 sm:!inline-flex">
            Build Career OS
          </LinkButton>
        </nav>
      </header>
      {children}
    </main>
  );
}
