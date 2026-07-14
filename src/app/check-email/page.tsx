import { Mail } from "lucide-react";
import { LinkButton, SectionLabel, Shell } from "@/components/ui";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <Shell>
      <section className="mx-auto grid min-h-[72vh] max-w-3xl place-items-center px-5 py-16 text-center">
        <div>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-path-green text-white">
            <Mail size={22} />
          </span>
          <SectionLabel>Private access</SectionLabel>
          <h1 className="path-title mt-5 font-serif text-5xl font-black text-ink md:text-6xl">
            Check your email.
          </h1>
          <p className="mx-auto mt-6 max-w-xl leading-7 text-muted-foreground">
            We sent a private Portray sign-in link{email ? ` to ${email}` : ""}. Your
            Passport is being assembled while you open it.
          </p>
          <LinkButton className="mt-8" href="/">
            Back to Portray
          </LinkButton>
        </div>
      </section>
    </Shell>
  );
}
