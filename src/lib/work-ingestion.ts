import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import * as cheerio from "cheerio";
import { extractText, getDocumentProxy } from "unpdf";
import { createId } from "@/lib/ids";
import type { WorkSource } from "@/lib/types";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_TEXT = 30_000;

function isPrivateAddress(address: string) {
  const normalized = address.toLowerCase().replace(/^\[|\]$/g, "");
  if (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  ) {
    return true;
  }
  if (normalized.startsWith("::ffff:")) {
    return isPrivateAddress(normalized.slice(7));
  }
  const parts = normalized.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) return false;
  return (
    parts[0] === 0 ||
    parts[0] === 10 ||
    parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
  );
}

export async function assertSafePublicUrl(raw: string) {
  const url = new URL(raw);
  if (url.protocol !== "https:") throw new Error("Only public HTTPS links are supported");
  if (url.username || url.password) throw new Error("Links with credentials are not allowed");
  const hostname = url.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    throw new Error("Local network links are not allowed");
  }
  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error("Private network links are not allowed");
    return url;
  }
  const addresses = await lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("The link does not resolve to a public address");
  }
  return url;
}

async function fetchWithGuard(raw: string) {
  let current = await assertSafePublicUrl(raw);
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "PortrayEvidenceReader/1.0" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === 3) throw new Error("Too many redirects");
      current = await assertSafePublicUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The work link returned ${response.status}`);
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_BYTES) throw new Error("The linked file is larger than 8 MB");
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.byteLength > MAX_BYTES) throw new Error("The linked file is larger than 8 MB");
    return { response, bytes, finalUrl: current.toString() };
  }
  throw new Error("Could not fetch the work link");
}

function cleanText(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
}

export async function ingestWorkSource(
  intakeId: string,
  rawUrl: string,
  sourceKind: WorkSource["sourceKind"] = "representative_work",
): Promise<WorkSource> {
  const createdAt = new Date().toISOString();
  const base = { id: createId("source"), intakeId, sourceKind, url: rawUrl, createdAt };
  try {
    const { response, bytes, finalUrl } = await fetchWithGuard(rawUrl);
    const contentType = (response.headers.get("content-type") || "").toLowerCase();
    let content = "";
    let title = "";
    if (contentType.includes("application/pdf") || finalUrl.toLowerCase().endsWith(".pdf")) {
      const pdf = await getDocumentProxy(bytes);
      const extracted = await extractText(pdf, { mergePages: true });
      content = cleanText(extracted.text);
      title = sourceKind === "resume" ? "Resume PDF" : "PDF representative work";
    } else if (contentType.includes("text/html") || contentType.includes("text/plain")) {
      const $ = cheerio.loadBuffer(Buffer.from(bytes));
      $("script, style, noscript, svg, nav, footer").remove();
      title = cleanText($("title").text() || $("h1").first().text());
      const main = $("main, article").first();
      content = cleanText((main.length ? main : $("body")).text());
    } else {
      throw new Error("Only HTML, text, and PDF links are supported");
    }
    if (!content) throw new Error("No readable text was found at the work link");
    return {
      ...base,
      url: finalUrl,
      status: "ready",
      content,
      contentType,
      title: title || new URL(finalUrl).hostname,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      fetchedAt: new Date().toISOString(),
    };
  } catch (caught) {
    const error = caught instanceof Error ? caught.message : "Could not read the work link";
    return {
      ...base,
      status: /not allowed|public address|HTTPS/.test(error) ? "blocked" : "failed",
      error,
    };
  }
}
