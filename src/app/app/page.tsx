import Link from "next/link";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, CircleCheck, Clock3, TriangleAlert } from "lucide-react";
import { LinkButton, SectionLabel, Shell } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { listPassportsForOwner } from "@/lib/store";

export default async function WorkspacePage() {
  const user = await getCurrentUser();
  if (isSupabaseConfigured() && !user) redirect("/create");
  const passports = await listPassportsForOwner(user?.id, user?.email);
  return (
    <Shell>
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-line pb-8">
          <div>
            <SectionLabel>Your workspace</SectionLabel>
            <h1 className="path-title mt-4 font-serif text-5xl font-black text-ink md:text-6xl">Passports</h1>
          </div>
          <LinkButton href="/create" variant="secondary">New submission</LinkButton>
        </div>
        {passports.length ? (
          <div className="divide-y divide-line">
            {passports.map((passport) => {
              const StatusIcon = passport.generationStatus === "complete" ? CircleCheck : passport.generationStatus === "failed" ? TriangleAlert : Clock3;
              return (
                <Link className="group grid gap-5 py-7 transition hover:bg-muted/45 md:grid-cols-[1fr_220px_auto] md:items-center md:px-3" href={`/app/passport/${passport.id}` as Route} key={passport.id}>
                  <div>
                    <h2 className="font-serif text-2xl text-ink">{passport.identityHeader.name}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{passport.identityHeader.currentRole} · Version {passport.version}</p>
                  </div>
                  <span className="flex items-center gap-2 text-sm text-muted-foreground"><StatusIcon size={15} /> {passport.generationStatus}</span>
                  <ArrowRight className="text-muted-foreground transition group-hover:translate-x-1 group-hover:text-ink" size={18} />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="font-serif text-3xl text-ink">No Passport yet.</p>
            <p className="mt-3 text-muted-foreground">Start with one representative work.</p>
            <LinkButton className="mt-6" href="/create">Create Passport</LinkButton>
          </div>
        )}
      </section>
    </Shell>
  );
}
