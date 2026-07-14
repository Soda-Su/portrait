import { createId } from "@/lib/ids";
import { createPrivateToken, hashToken } from "@/lib/security";
import {
  addEvent,
  addShareLink,
  disableShareLinks,
  findShareLinkByHash,
  getIntake,
  getPassport,
  getWorkSourcesForIntake,
} from "@/lib/store";

export async function createOrRotateShare(passportId: string, origin: string) {
  await disableShareLinks(passportId);
  const token = createPrivateToken();
  await addShareLink({
    id: createId("share"),
    passportId,
    tokenHash: hashToken(token),
    active: true,
    createdAt: new Date().toISOString(),
  });
  await addEvent({
    id: createId("event"),
    name: "share_enabled",
    passportId,
    createdAt: new Date().toISOString(),
  });
  return { token, url: `${origin.replace(/\/$/, "")}/p/${token}` };
}

export async function resolvePrivateShare(token: string) {
  const shareLink = await findShareLinkByHash(hashToken(token));
  if (!shareLink) return null;
  const passport = await getPassport(shareLink.passportId);
  if (!passport) return null;
  const intake = await getIntake(passport.intakeId);
  if (!intake) return null;
  const workSources = await getWorkSourcesForIntake(intake.id);
  return { shareLink, passport, intake, workSources };
}
