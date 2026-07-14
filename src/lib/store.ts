import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type {
  ChatMessage,
  ChatSession,
  Feedback,
  Intake,
  Passport,
  PortrayStore,
  PortrayEvent,
  ShareLink,
  User,
  WorkSource,
} from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "portrait-store.json");

const emptyStore: PortrayStore = {
  users: [],
  intakes: [],
  passports: [],
  feedback: [],
  workSources: [],
  shareLinks: [],
  chatSessions: [],
  chatMessages: [],
  events: [],
};

function normalizePassport(passport: Passport): Passport {
  return {
    ...passport,
    generationStatus: passport.generationStatus ?? "complete",
    suggestedQuestions: passport.suggestedQuestions ?? [
      "What is this person becoming?",
      "What evidence best supports their strengths?",
      "What proof should they build next?",
    ],
    version: passport.version ?? 1,
  };
}

async function readLocalStore(): Promise<PortrayStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = { ...emptyStore, ...JSON.parse(raw) } as PortrayStore;
    parsed.passports = parsed.passports.map(normalizePassport);
    return parsed;
  } catch {
    return structuredClone(emptyStore);
  }
}

async function writeLocalStore(store: PortrayStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function updateLocalStore<T>(updater: (store: PortrayStore) => T) {
  const store = await readLocalStore();
  const result = updater(store);
  await writeLocalStore(store);
  return result;
}

function rowData<T>(row: { data: unknown }): T {
  return row.data as T;
}

export async function addUser(user: User) {
  const supabase = getSupabaseAdmin();
  if (supabase) return user;
  return updateLocalStore((store) => {
    store.users.push(user);
    return user;
  });
}

export async function addIntake(intake: Intake) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("intakes").upsert({
      id: intake.id,
      owner_email: intake.email,
      data: intake,
      formspree_delivery_status: intake.formspreeDeliveryStatus ?? "pending",
      created_at: intake.createdAt,
    });
    if (error) throw error;
    return intake;
  }
  return updateLocalStore((store) => {
    store.intakes.push(intake);
    return intake;
  });
}

export async function updateIntake(
  id: string,
  updater: (intake: Intake) => Intake,
) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const current = await getIntake(id);
    if (!current) return null;
    const next = updater(current);
    const { error } = await supabase
      .from("intakes")
      .update({
        data: next,
        formspree_delivery_status: next.formspreeDeliveryStatus ?? "pending",
      })
      .eq("id", id);
    if (error) throw error;
    return next;
  }
  return updateLocalStore((store) => {
    const index = store.intakes.findIndex((item) => item.id === id);
    if (index === -1) return null;
    store.intakes[index] = updater(store.intakes[index]);
    return store.intakes[index];
  });
}

export async function addPassport(passport: Passport) {
  const normalized = normalizePassport(passport);
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: intakeRow } = await supabase
      .from("intakes")
      .select("owner_id, owner_email")
      .eq("id", passport.intakeId)
      .single();
    const { error } = await supabase.from("passports").upsert({
      id: normalized.id,
      intake_id: normalized.intakeId,
      owner_id: intakeRow?.owner_id ?? null,
      owner_email: intakeRow?.owner_email ?? "",
      data: normalized,
      generation_status: normalized.generationStatus,
      created_at: normalized.createdAt,
      updated_at: normalized.updatedAt,
    });
    if (error) throw error;
    return normalized;
  }
  return updateLocalStore((store) => {
    store.passports.push(normalized);
    return normalized;
  });
}

export async function getIntake(id: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("intakes")
      .select("data")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? rowData<Intake>(data) : null;
  }
  const store = await readLocalStore();
  return store.intakes.find((intake) => intake.id === id) ?? null;
}

export async function getPassport(id: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("passports")
      .select("data, owner_id")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return normalizePassport({
      ...rowData<Passport>(data),
      userId: data.owner_id ?? rowData<Passport>(data).userId,
    });
  }
  const store = await readLocalStore();
  return store.passports.find((passport) => passport.id === id) ?? null;
}

export async function listPassportsForOwner(userId?: string, email?: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    let query = supabase.from("passports").select("data, owner_id");
    query = userId
      ? query.eq("owner_id", userId)
      : query.eq("owner_email", (email || "").toLowerCase());
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) =>
      normalizePassport({
        ...rowData<Passport>(row),
        userId: row.owner_id ?? rowData<Passport>(row).userId,
      }),
    );
  }
  return (await readLocalStore()).passports.slice().reverse();
}

export async function claimRecordsForUser(
  userId: string,
  email: string,
  role: "candidate" | "admin",
) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;
  const normalizedEmail = email.toLowerCase();
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    email: normalizedEmail,
    role,
  });
  if (profileError) throw profileError;
  const results = await Promise.all([
    supabase
      .from("intakes")
      .update({ owner_id: userId })
      .eq("owner_email", normalizedEmail),
    supabase
      .from("passports")
      .update({ owner_id: userId })
      .eq("owner_email", normalizedEmail),
  ]);
  const failure = results.find((result) => result.error)?.error;
  if (failure) throw failure;
}

export async function updatePassport(
  id: string,
  updater: (passport: Passport) => Passport,
) {
  const current = await getPassport(id);
  if (!current) return null;
  const next = normalizePassport({
    ...updater(current),
    updatedAt: new Date().toISOString(),
  });
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("passports")
      .update({
        data: next,
        generation_status: next.generationStatus,
        updated_at: next.updatedAt,
      })
      .eq("id", id);
    if (error) throw error;
    return next;
  }
  return updateLocalStore((store) => {
    const index = store.passports.findIndex((passport) => passport.id === id);
    if (index === -1) return null;
    store.passports[index] = next;
    return next;
  });
}

export async function addWorkSource(source: WorkSource) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("work_sources").upsert({
      id: source.id,
      intake_id: source.intakeId,
      data: source,
      created_at: source.createdAt,
    });
    if (error) throw error;
    return source;
  }
  return updateLocalStore((store) => {
    store.workSources.push(source);
    return source;
  });
}

export async function getWorkSourceForIntake(intakeId: string) {
  const sources = await getWorkSourcesForIntake(intakeId);
  return (
    sources.find((item) => item.sourceKind !== "resume") ??
    sources[0] ??
    null
  );
}

export async function getWorkSourcesForIntake(intakeId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("work_sources")
      .select("data")
      .eq("intake_id", intakeId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => rowData<WorkSource>(row));
  }
  return (await readLocalStore()).workSources.filter(
    (item) => item.intakeId === intakeId,
  );
}

export async function getFeedbackForPassport(passportId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("feedback")
      .select("data")
      .eq("passport_id", passportId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => rowData<Feedback>(row));
  }
  return (await readLocalStore()).feedback.filter(
    (item) => item.passportId === passportId,
  );
}

export async function addFeedback(feedback: Feedback) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("feedback").insert({
      id: feedback.id,
      passport_id: feedback.passportId,
      data: feedback,
      created_at: feedback.createdAt,
    });
    if (error) throw error;
    return feedback;
  }
  return updateLocalStore((store) => {
    store.feedback.push(feedback);
    return feedback;
  });
}

export async function disableShareLinks(passportId: string) {
  const revokedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase
      .from("share_links")
      .update({ active: false, revoked_at: revokedAt })
      .eq("passport_id", passportId)
      .eq("active", true);
    if (error) throw error;
    return;
  }
  await updateLocalStore((store) => {
    store.shareLinks = store.shareLinks.map((link) =>
      link.passportId === passportId && link.active
        ? { ...link, active: false, revokedAt }
        : link,
    );
  });
}

export async function addShareLink(link: ShareLink) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("share_links").insert({
      id: link.id,
      passport_id: link.passportId,
      token_hash: link.tokenHash,
      active: link.active,
      created_at: link.createdAt,
    });
    if (error) throw error;
    return link;
  }
  return updateLocalStore((store) => {
    store.shareLinks.push(link);
    return link;
  });
}

export async function getActiveShareLink(passportId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("share_links")
      .select("*")
      .eq("passport_id", passportId)
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data
      ? ({
          id: data.id,
          passportId: data.passport_id,
          tokenHash: data.token_hash,
          active: data.active,
          createdAt: data.created_at,
          revokedAt: data.revoked_at ?? undefined,
        } satisfies ShareLink)
      : null;
  }
  return (
    (await readLocalStore()).shareLinks.find(
      (link) => link.passportId === passportId && link.active,
    ) ?? null
  );
}

export async function findShareLinkByHash(tokenHash: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("share_links")
      .select("*")
      .eq("token_hash", tokenHash)
      .eq("active", true)
      .maybeSingle();
    if (error) throw error;
    return data
      ? ({
          id: data.id,
          passportId: data.passport_id,
          tokenHash: data.token_hash,
          active: data.active,
          createdAt: data.created_at,
        } satisfies ShareLink)
      : null;
  }
  return (
    (await readLocalStore()).shareLinks.find(
      (link) => link.tokenHash === tokenHash && link.active,
    ) ?? null
  );
}

export async function getOrCreateChatSession(session: ChatSession) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: existing } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("share_link_id", session.shareLinkId)
      .eq("visitor_id", session.visitorId)
      .maybeSingle();
    if (existing) return mapChatSession(existing);
    const { error } = await supabase.from("chat_sessions").insert({
      id: session.id,
      passport_id: session.passportId,
      share_link_id: session.shareLinkId,
      visitor_id: session.visitorId,
      ip_hash: session.ipHash,
      created_at: session.createdAt,
    });
    if (error) throw error;
    return session;
  }
  return updateLocalStore((store) => {
    const existing = store.chatSessions.find(
      (item) =>
        item.shareLinkId === session.shareLinkId && item.visitorId === session.visitorId,
    );
    if (existing) return existing;
    store.chatSessions.push(session);
    return session;
  });
}

function mapChatSession(row: Record<string, unknown>): ChatSession {
  return {
    id: String(row.id),
    passportId: String(row.passport_id),
    shareLinkId: String(row.share_link_id),
    visitorId: String(row.visitor_id),
    ipHash: row.ip_hash ? String(row.ip_hash) : undefined,
    createdAt: String(row.created_at),
  };
}

export async function addChatMessage(message: ChatMessage) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("chat_messages").insert({
      id: message.id,
      session_id: message.sessionId,
      data: message,
      created_at: message.createdAt,
    });
    if (error) throw error;
    return message;
  }
  return updateLocalStore((store) => {
    store.chatMessages.push(message);
    return message;
  });
}

export async function countVisitorQuestions(sessionId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("data")
      .eq("session_id", sessionId);
    if (error) throw error;
    return (data ?? []).filter((row) => rowData<ChatMessage>(row).role === "user").length;
  }
  return (await readLocalStore()).chatMessages.filter(
    (message) => message.sessionId === sessionId && message.role === "user",
  ).length;
}

export async function listRecentChatMessagesForSession(
  sessionId: string,
  limit = 8,
) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("data")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? [])
      .map((row) => rowData<ChatMessage>(row))
      .reverse();
  }
  return (await readLocalStore()).chatMessages
    .filter((message) => message.sessionId === sessionId)
    .slice(-limit);
}

export async function countRecentQuestionsByIp(ipHash: string) {
  const since = Date.now() - 60 * 60 * 1000;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: sessions, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("ip_hash", ipHash);
    if (sessionError) throw sessionError;
    const ids = (sessions ?? []).map((session) => session.id);
    if (!ids.length) return 0;
    const { data, error } = await supabase
      .from("chat_messages")
      .select("data")
      .in("session_id", ids)
      .gte("created_at", new Date(since).toISOString());
    if (error) throw error;
    return (data ?? []).filter((row) => rowData<ChatMessage>(row).role === "user").length;
  }
  const store = await readLocalStore();
  const ids = new Set(
    store.chatSessions.filter((session) => session.ipHash === ipHash).map((session) => session.id),
  );
  return store.chatMessages.filter(
    (message) =>
      ids.has(message.sessionId) &&
      message.role === "user" &&
      new Date(message.createdAt).getTime() >= since,
  ).length;
}

export async function listChatMessagesForPassport(passportId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: sessions, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("passport_id", passportId);
    if (sessionError) throw sessionError;
    const ids = (sessions ?? []).map((session) => session.id);
    if (!ids.length) return [];
    const { data, error } = await supabase
      .from("chat_messages")
      .select("data")
      .in("session_id", ids)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => rowData<ChatMessage>(row));
  }
  const store = await readLocalStore();
  const ids = new Set(
    store.chatSessions
      .filter((session) => session.passportId === passportId)
      .map((session) => session.id),
  );
  return store.chatMessages.filter((message) => ids.has(message.sessionId));
}

export async function listEventsForPassport(passportId: string) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("events")
      .select("data")
      .eq("passport_id", passportId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => rowData<PortrayEvent>(row));
  }
  return (await readLocalStore()).events.filter(
    (event) => event.passportId === passportId,
  );
}

export async function addEvent(event: PortrayEvent) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("events").insert({
      id: event.id,
      passport_id: event.passportId,
      intake_id: event.intakeId,
      data: event,
      created_at: event.createdAt,
    });
    if (error) throw error;
    return event;
  }
  return updateLocalStore((store) => {
    store.events.push(event);
    return event;
  });
}

export async function listReviewRows() {
  const supabase = getSupabaseAdmin();
  const intakes = supabase
    ? await (async () => {
        const { data, error } = await supabase
          .from("intakes")
          .select("data")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return (data ?? []).map((row) => rowData<Intake>(row));
      })()
    : (await readLocalStore()).intakes.slice().reverse();

  return Promise.all(
    intakes.map(async (intake) => {
      const passports = supabase
        ? await (async () => {
            const { data, error } = await supabase
              .from("passports")
              .select("data, owner_id")
              .eq("intake_id", intake.id)
              .limit(1);
            if (error) throw error;
            return (data ?? []).map((row) =>
              normalizePassport({
                ...rowData<Passport>(row),
                userId: row.owner_id ?? rowData<Passport>(row).userId,
              }),
            );
          })()
        : (await readLocalStore()).passports.filter(
            (passport) => passport.intakeId === intake.id,
          );
      const passport = passports[0];
      return {
        intake,
        user: undefined,
        passport,
        feedback: passport ? await getFeedbackForPassport(passport.id) : [],
        chatMessages: passport ? await listChatMessagesForPassport(passport.id) : [],
        events: passport ? await listEventsForPassport(passport.id) : [],
      };
    }),
  );
}
