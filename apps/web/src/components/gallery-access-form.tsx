"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Script from "next/script";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const LOCAL_TURNSTILE_BYPASS =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_LOCAL_TURNSTILE_BYPASS === "true";

type Turnstile = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto" | "light" | "dark";
      action: string;
      callback: () => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
};

function getTurnstile() {
  return (window as Window & { turnstile?: Turnstile }).turnstile;
}

const copy = {
  en: {
    name: "Name",
    email: "Email",
    namePlaceholder: "Your name",
    emailPlaceholder: "Your email address",
    send: "Send request",
    dismiss: "Maybe later",
    success: "Thank you. Your request has been sent.",
    error: "Could not send your request. Please try again.",
    security: "Security check",
  },
  pt: {
    name: "Nome",
    email: "Email",
    namePlaceholder: "O teu nome",
    emailPlaceholder: "O teu endereço de email",
    send: "Enviar pedido",
    dismiss: "Talvez depois",
    success: "Obrigado. O teu pedido foi enviado.",
    error: "Não foi possível enviar o pedido. Tenta novamente.",
    security: "Verificação de segurança",
  },
};

export function GalleryAccessForm({
  locale,
  submitLabel,
  dismissLabel,
  onClose,
}: {
  locale: string;
  submitLabel?: string;
  dismissLabel?: string;
  onClose: () => void;
}) {
  const text = locale.toLowerCase().startsWith("pt") ? copy.pt : copy.en;
  const [pending, setPending] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(LOCAL_TURNSTILE_BYPASS);
  const [feedback, setFeedback] = useState("");
  const [sent, setSent] = useState(false);
  const inFlight = useRef(false);
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  function renderTurnstile() {
    const api = getTurnstile();
    if (!TURNSTILE_SITE_KEY || !container.current || !api || widgetId.current) return;
    container.current.replaceChildren();
    widgetId.current = api.render(container.current, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      action: "inquiry",
      callback: () => setCaptchaVerified(true),
      "expired-callback": () => setCaptchaVerified(false),
      "error-callback": () => setCaptchaVerified(false),
    });
  }

  useEffect(() => {
    renderTurnstile();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || sent) return;
    inFlight.current = true;
    setPending(true);
    setFeedback("");
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("locale", locale);
    data.set(
      "message",
      locale.toLowerCase().startsWith("pt")
        ? "Pedido de acesso à galeria privada."
        : "Private gallery access request.",
    );

    try {
      const response = await fetch("/api/inquiries", { method: "POST", body: data });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || text.error);
      }
      form.reset();
      setSent(true);
      setFeedback(text.success);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : text.error);
    } finally {
      if (widgetId.current) getTurnstile()?.reset(widgetId.current);
      setCaptchaVerified(false);
      inFlight.current = false;
      setPending(false);
    }
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={renderTurnstile}
        />
      )}
      <form className="mag-access-form" onSubmit={submit}>
        <fieldset disabled={pending || sent}>
          <label htmlFor="galleryAccessName">{text.name}</label>
          <input
            id="galleryAccessName"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={150}
            required
          />
          <label htmlFor="galleryAccessEmail">{text.email}</label>
          <input
            id="galleryAccessEmail"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
          <div className="mag-access-honeypot" aria-hidden="true">
            <label htmlFor="galleryAccessWebsite">Website</label>
            <input id="galleryAccessWebsite" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          {TURNSTILE_SITE_KEY && (
            <div className="mag-access-security">
              <span>{text.security}</span>
              <div ref={container} />
            </div>
          )}
          <div className="mag-access-actions">
            <button
              className="mag-access-primary"
              type="submit"
              disabled={pending || sent || (!captchaVerified && !LOCAL_TURNSTILE_BYPASS)}
            >
              {pending ? (locale.toLowerCase().startsWith("pt") ? "A enviar…" : "Sending…") : submitLabel || text.send}
            </button>
            <button className="mag-access-secondary" type="button" onClick={onClose}>
              {dismissLabel || text.dismiss}
            </button>
          </div>
        </fieldset>
        <p className="mag-access-status" role="status" aria-live="polite">
          {feedback}
        </p>
      </form>
    </>
  );
}
