import { describe, expect, it } from "vitest";
import { createPrivateToken, hashIp, hashToken } from "@/lib/security";
import { assertSafePublicUrl } from "@/lib/work-ingestion";

describe("private sharing security", () => {
  it("creates opaque tokens and stores stable hashes", () => {
    const token = createPrivateToken();
    expect(token.length).toBeGreaterThanOrEqual(40);
    expect(hashToken(token)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashToken(token)).toBe(hashToken(token));
    expect(hashIp("203.0.113.1")).not.toBe(hashToken("203.0.113.1"));
  });
});

describe("representative work URL guard", () => {
  it.each([
    "http://example.com/work",
    "https://localhost/work",
    "https://127.0.0.1/work",
    "https://169.254.169.254/latest/meta-data",
    "https://10.0.0.1/work",
    "https://[::1]/work",
    "https://[fe80::1]/work",
  ])("blocks unsafe URL %s", async (url) => {
    await expect(assertSafePublicUrl(url)).rejects.toThrow();
  });

  it("blocks credentials in a URL", async () => {
    await expect(assertSafePublicUrl("https://user:secret@example.com/work")).rejects.toThrow(
      "credentials",
    );
  });
});
