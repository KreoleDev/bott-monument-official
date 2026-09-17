export default {
  async afterCreate(event: {
    result: {
      name: string;
      email: string;
      inquiryType: string;
      message?: string;
      documentId: string;
    };
  }) {
    if (
      process.env.INQUIRY_NOTIFICATIONS_ENABLED !== "true" ||
      !process.env.INQUIRY_NOTIFICATION_TO ||
      !process.env.SMTP_HOST
    )
      return;
    const inquiry = event.result;
    const text = `Name: ${inquiry.name}\nEmail: ${inquiry.email}\nInterest: ${inquiry.inquiryType}\n\n${inquiry.message || ""}\n\nEntry: ${inquiry.documentId}`;
    const html =
      "<pre>" + text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>";
    try {
      await strapi.plugin("email").service("email").send({
        to: process.env.INQUIRY_NOTIFICATION_TO,
        replyTo: inquiry.email,
        subject: "New Bott Monument inquiry",
        text,
        html,
      });
    } catch {
      strapi.log.error(
        `Inquiry ${inquiry.documentId} saved, but notification delivery failed. Review Inquiries in the CMS.`,
      );
    }
  },
};
