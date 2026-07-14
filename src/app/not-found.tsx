import { LinkButton, Shell } from "@/components/ui";

export default function NotFound() {
  return (
    <Shell>
      <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5 text-center">
        <div className="paper-surface rounded-[34px] p-8 md:p-12">
          <h1 className="font-serif text-5xl text-ink">Passport not found</h1>
          <p className="mt-5 leading-7 text-muted-foreground">
            This private Passport link is invalid, expired, or has been revoked.
          </p>
          <LinkButton href="/create" className="mt-8">
            Create a new passport
          </LinkButton>
        </div>
      </section>
    </Shell>
  );
}
