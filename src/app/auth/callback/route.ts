import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { claimRecordsForUser } from "@/lib/store";
import { isAdmin } from "@/lib/auth";
import { siteUrl } from "@/lib/config";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/app";
  const client = await getSupabaseServerClient();
  if (!code || !client) return NextResponse.redirect(`${siteUrl()}/create`);
  const { data, error } = await client.auth.exchangeCodeForSession(code);
  if (error || !data.user.email) {
    return NextResponse.redirect(`${siteUrl()}/create?auth=failed`);
  }
  await claimRecordsForUser(
    data.user.id,
    data.user.email,
    isAdmin(data.user.email) ? "admin" : "candidate",
  );
  return NextResponse.redirect(`${siteUrl()}${next.startsWith("/") ? next : "/app"}`);
}
