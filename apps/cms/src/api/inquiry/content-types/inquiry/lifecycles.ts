import { createHash, randomBytes } from "node:crypto";

type InquiryEvent = {
  result: {
    name: string;
    email: string;
    documentId: string;
    submissionLocale?: string;
  };
  params?: { data?: Record<string, unknown> };
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default {
  async afterCreate(event: InquiryEvent) {
    if (
      process.env.INQUIRY_NOTIFICATIONS_ENABLED !== "true" ||
      !process.env.INQUIRY_NOTIFICATION_TO ||
      !process.env.SMTP_HOST
    )
      return;

    const inquiry = event.result;
    const text = `Name: ${inquiry.name}\nEmail: ${inquiry.email}\n\nEntry: ${inquiry.documentId}`;
    try {
      await strapi.plugin("email").service("email").send({
        to: process.env.INQUIRY_NOTIFICATION_TO,
        replyTo: inquiry.email,
        subject: "New Bott Monument inquiry",
        text,
        html: `<pre>${escapeHtml(text)}</pre>`,
      });
    } catch {
      strapi.log.error(`Inquiry ${inquiry.documentId} saved, but the admin notification failed.`);
    }
  },

  async afterUpdate(event: InquiryEvent) {
    const inquiry = event.result;
    const changedData = event.params?.data;
    if (changedData?.accessApproved === false) {
      await strapi.db.query("api::inquiry.inquiry").update({
        where: { documentId: inquiry.documentId },
        data: {
          accessTokenHash: null,
          accessTokenExpiresAt: null,
          accessNotificationSentAt: null,
        },
      });
      return;
    }

    if (
      !changedData ||
      changedData.accessApproved !== true ||
      changedData.accessNotificationSentAt ||
      !inquiry.email
    )
      return;

    const storedInquiry = await strapi.db.query("api::inquiry.inquiry").findOne({
      where: { documentId: inquiry.documentId },
      select: ["accessNotificationSentAt"],
    });
    if (storedInquiry?.accessNotificationSentAt) return;

    const token = randomBytes(32).toString("base64url");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await strapi.db.query("api::inquiry.inquiry").update({
      where: { documentId: inquiry.documentId },
      data: { accessTokenHash: tokenHash, accessTokenExpiresAt: expiresAt },
    });

    const submissionLocale = inquiry.submissionLocale || "en";
    const locale = submissionLocale.toLowerCase().startsWith("pt") ? submissionLocale : "en";
    const webUrl = process.env.WEB_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const galleryUrl = `${webUrl}/${locale}/private-gallery?token=${encodeURIComponent(token)}`;
    const copy =
      locale.toLowerCase().startsWith("pt")
        ? {
            subject: "Pedido de acesso aprovado - Bott Monument",
            text: `Ol\u00e1 ${inquiry.name},\n\nO seu pedido foi aprovado. Abra a sua galeria privada no link abaixo. Este link expira em 7 dias.\n\n${galleryUrl}\n\nBott Monument`,
          }
        : {
            subject: "Access request approved - Bott Monument",
            text: `Hello ${inquiry.name},\n\nYour request has been approved. Open your private gallery using the link below. This link expires in 7 days.\n\n${galleryUrl}\n\nBott Monument`,
          };

    try {
      await strapi.plugin("email").service("email").send({
        to: inquiry.email,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
        subject: copy.subject,
        text: copy.text,
        html: `<p>${escapeHtml(copy.text).replace(/\n/g, "<br>")}</p><p><a href="${escapeHtml(galleryUrl)}">${locale.toLowerCase().startsWith("pt") ? "Abrir galeria privada" : "Open private gallery"}</a></p>`,
      });
      await strapi.db.query("api::inquiry.inquiry").update({
        where: { documentId: inquiry.documentId },
        data: { accessNotificationSentAt: new Date() },
      });
    } catch (error) {
      strapi.log.error(
        `Approval email for inquiry ${inquiry.documentId} failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    }
  },
};
