import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before migrating.");
}

const file = path.join(process.cwd(), "data", "portrait-store.json");
const store = JSON.parse(await readFile(file, "utf8"));
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function upsert(table, rows) {
  if (!rows.length) return;
  const { error } = await supabase.from(table).upsert(rows);
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: ${rows.length}`);
}

await upsert(
  "intakes",
  (store.intakes || []).map((item) => ({
    id: item.id,
    owner_email: (item.email || "").toLowerCase(),
    data: item,
    formspree_delivery_status: item.formspreeDeliveryStatus || "not_configured",
    created_at: item.createdAt,
  })),
);
await upsert(
  "work_sources",
  (store.workSources || []).map((item) => ({
    id: item.id,
    intake_id: item.intakeId,
    data: item,
    created_at: item.createdAt,
  })),
);
const intakeEmails = new Map((store.intakes || []).map((item) => [item.id, item.email || ""]));
await upsert(
  "passports",
  (store.passports || []).map((item) => ({
    id: item.id,
    intake_id: item.intakeId,
    owner_email: String(intakeEmails.get(item.intakeId) || "").toLowerCase(),
    data: {
      ...item,
      generationStatus: item.generationStatus || "complete",
      suggestedQuestions: item.suggestedQuestions || [
        "What is this person becoming?",
        "What evidence supports their strongest signals?",
        "What proof should they build next?",
      ],
      version: item.version || 1,
    },
    generation_status: item.generationStatus || "complete",
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  })),
);
await upsert("share_links", (store.shareLinks || []).map((item) => ({
  id: item.id,
  passport_id: item.passportId,
  token_hash: item.tokenHash,
  active: item.active,
  created_at: item.createdAt,
  revoked_at: item.revokedAt || null,
})));
await upsert("chat_sessions", (store.chatSessions || []).map((item) => ({
  id: item.id,
  passport_id: item.passportId,
  share_link_id: item.shareLinkId,
  visitor_id: item.visitorId,
  ip_hash: item.ipHash || null,
  created_at: item.createdAt,
})));
await upsert("chat_messages", (store.chatMessages || []).map((item) => ({
  id: item.id,
  session_id: item.sessionId,
  data: item,
  created_at: item.createdAt,
})));
await upsert("feedback", (store.feedback || []).map((item) => ({
  id: item.id,
  passport_id: item.passportId,
  data: item,
  created_at: item.createdAt,
})));
await upsert("events", (store.events || []).map((item) => ({
  id: item.id,
  passport_id: item.passportId || null,
  intake_id: item.intakeId || null,
  data: item,
  created_at: item.createdAt,
})));

console.log("Local Portray fixture migration complete. Records are claimed when each user opens a magic link.");
