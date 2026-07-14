import { createHash, randomBytes } from "node:crypto";

export function createPrivateToken() {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function hashIp(value: string) {
  return createHash("sha256")
    .update(`${process.env.PORTRAY_IP_HASH_SALT || "local-dev"}:${value}`)
    .digest("hex");
}
