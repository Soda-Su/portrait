import { notFound, redirect } from "next/navigation";
import { Shell } from "@/components/ui";
import { canManagePassport, getCurrentUser } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/config";
import { getActiveShareLink, getFeedbackForPassport, getPassport } from "@/lib/store";
import { PassportEditor } from "@/app/passport/[id]/passport-editor";

export default async function OwnerPassportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (isSupabaseConfigured() && !user) redirect("/create");
  const passport = await getPassport(id);
  if (!passport) notFound();
  if (!(await canManagePassport(passport))) notFound();
  const [feedback, share] = await Promise.all([
    getFeedbackForPassport(id),
    getActiveShareLink(id),
  ]);
  return (
    <Shell>
      <PassportEditor
        initialPassport={passport}
        initialFeedbackCount={feedback.length}
        initialShareActive={Boolean(share)}
      />
    </Shell>
  );
}
