import { NextResponse } from "next/server";
import { canManagePassport } from "@/lib/auth";
import { shareActionSchema } from "@/lib/schemas";
import { createOrRotateShare } from "@/lib/sharing";
import { disableShareLinks, getPassport, updatePassport } from "@/lib/store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const passport = await getPassport(id);
  if (!passport) return NextResponse.json({ error: "Passport not found" }, { status: 404 });
  if (!(await canManagePassport(passport))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = shareActionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid share action" }, { status: 400 });
  }
  if (parsed.data.action === "revoke") {
    await disableShareLinks(id);
    await updatePassport(id, (current) => ({
      ...current,
      publishable: false,
      status: "draft",
    }));
    return NextResponse.json({ active: false });
  }
  const share = await createOrRotateShare(id, new URL(request.url).origin);
  await updatePassport(id, (current) => ({
    ...current,
    publishable: true,
    status: "published",
  }));
  return NextResponse.json({ active: true, ...share });
}
