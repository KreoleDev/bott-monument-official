type InquiryEvent = {
  result: { name: string; email: string; message?: string | null; documentId: string };
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
    const recipient = process.env.ADMIN_NOTIFICATION_TO || process.env.INQUIRY_NOTIFICATION_TO;
    const enabled =
      process.env.ADMIN_NOTIFICATIONS_ENABLED === "true" ||
      process.env.INQUIRY_NOTIFICATIONS_ENABLED === "true";
    if (
      !enabled ||
      !recipient ||
      !process.env.SMTP_HOST
    )
      return;

    const inquiry = event.result;
    const text = `Name: ${inquiry.name}\nEmail: ${inquiry.email}\n\nMessage:\n${inquiry.message || "No message provided."}\n\nEntry: ${inquiry.documentId}`;
    try {
      await strapi.plugin("email").service("email").send({
        to: recipient,
        replyTo: inquiry.email,
        subject: "New Bott Monument inquiry",
        text,
        html: `<pre>${escapeHtml(text)}</pre>`,
      });
    } catch {
      strapi.log.error(`Inquiry ${inquiry.documentId} saved, but the admin notification failed.`);
    }
  },
};
