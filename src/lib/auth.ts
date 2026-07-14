import { adminEmails, isSupabaseConfigured } from "@/lib/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Passport } from "@/lib/types";

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const client = await getSupabaseServerClient();
  const { data } = await client!.auth.getUser();
  return data.user;
}

export function isAdmin(email?: string | null) {
  return Boolean(email && adminEmails().has(email.toLowerCase()));
}

export async function canManagePassport(passport: Passport) {
  if (!isSupabaseConfigured()) return true;
  const user = await getCurrentUser();
  if (!user) return false;
  return passport.userId === user.id || isAdmin(user.email);
}
