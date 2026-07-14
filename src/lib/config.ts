export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function isRealAiMode() {
  return (process.env.PORTRAY_AI_MODE ?? process.env.PORTRAIT_AI_MODE) === "real";
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3003").replace(/\/$/, "");
}

export function adminEmails() {
  return new Set(
    (process.env.PORTRAY_ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}
