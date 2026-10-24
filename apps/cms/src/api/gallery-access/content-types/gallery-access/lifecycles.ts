import { createHash, randomBytes } from "node:crypto";

type AccessEvent = {
  result: { name: string; email: string; documentId: string; submissionLocale?: string };
  params?: { data?: Record<string, unknown> };
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export default {
  async afterCreate(event: AccessEvent) {
    const access = event.result;
    const recipient = process.env.ADMIN_NOTIFICATION_TO || process.env.INQUIRY_NOTIFICATION_TO;
    const enabled =
      process.env.ADMIN_NOTIFICATIONS_ENABLED === "true" ||
      process.env.INQUIRY_NOTIFICATIONS_ENABLED === "true";
    if (!enabled || !recipient || !process.env.SMTP_HOST) return;

    const text = `A private gallery access request was submitted.\n\nName: ${access.name}\nEmail: ${access.email}\n\nReview it in the Gallery Access collection in Strapi.\nEntry: ${access.documentId}`;
    try {
      await strapi.plugin("email").service("email").send({
        to: recipient,
        replyTo: access.email,
        subject: "New private gallery access request - Bott Monument",
        text,
        html: `<pre>${escapeHtml(text)}</pre>`,
      });
    } catch (error) {
      strapi.log.error(`Gallery access request ${access.documentId} was saved, but the admin notification failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  },

  async afterUpdate(event: AccessEvent) {
    const access = event.result;
    const data = event.params?.data;
    const uid = "api::gallery-access.gallery-access";
    if (data?.accessActive === false) {
      await strapi.db.query(uid).update({
        where: { documentId: access.documentId },
        data: { accessTokenHash: null, accessTokenExpiresAt: null, accessNotificationSentAt: null },
      });
      return;
    }
    if (data?.accessActive !== true || !access.email) return;
    const stored = await strapi.db.query(uid).findOne({
      where: { documentId: access.documentId }, select: ["accessNotificationSentAt"],
    });
    if (stored?.accessNotificationSentAt) return;

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await strapi.db.query(uid).update({
      where: { documentId: access.documentId }, data: { accessTokenHash: tokenHash, accessTokenExpiresAt: expiresAt },
    });
    const requestedLocale = access.submissionLocale || "en";
    const locale = requestedLocale.toLowerCase().startsWith("pt") ? requestedLocale : "en";
    const webUrl = process.env.WEB_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const galleryUrl = `${webUrl}/${locale}/private-gallery?token=${encodeURIComponent(token)}`;
    const copy = locale === "en"
      ? { subject: "Private gallery access - Bott Monument", body: `Hello ${access.name},\n\nYour private gallery access is active. Open it using this link, which expires in 7 days.\n\n${galleryUrl}\n\nBott Monument` }
      : { subject: "Acesso à galeria privada - Bott Monument", body: `Olá ${access.name},\n\nO seu acesso à galeria privada está ativo. Abra-a através deste link, que expira em 7 dias.\n\n${galleryUrl}\n\nBott Monument` };
    try {
      await strapi.plugin("email").service("email").send({
        to: access.email, replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
        subject: copy.subject, text: copy.body,
        html: `<p>${escapeHtml(copy.body).replace(/\n/g, "<br>")}</p><p><a href="${escapeHtml(galleryUrl)}">Open private gallery</a></p>`,
      });
      await strapi.db.query(uid).update({ where: { documentId: access.documentId }, data: { accessNotificationSentAt: new Date() } });
    } catch (error) {
      strapi.log.error(`Approval email for gallery access ${access.documentId} failed: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  },
};
