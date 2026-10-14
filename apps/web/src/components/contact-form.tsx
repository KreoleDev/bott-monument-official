"use client";
import { useState, useRef, type ChangeEvent, type FormEvent } from "react";
import type { ContactDetails } from "@/lib/strapi";

const MAX_IMAGE_MB = 10;
const MAX_IMAGES = 3;

export function ContactForm({
  details,
  buttonLabel,
  locale,
}: {
  details: ContactDetails;
  buttonLabel: string;
  locale: string;
}) {
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const inFlight = useRef(false);
  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.currentTarget.files || []);
    setImages((current) => [...current, ...files].slice(0, MAX_IMAGES));
    event.currentTarget.value = "";
  }
  function removeImage(index: number) {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setFeedback("");
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("locale", locale);
    for (const image of images) {
      data.append("attachment", image, image.name);
    }
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        body: data,
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Could not save your message. Please try again.");
      }
      form.reset();
      setImages([]);
      setFeedback(details.successMessage || "Thank you. Your inquiry has been received.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Could not save your message. Please try again.",
      );
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }
  return (
    <form className="commission-form" onSubmit={submit}>
      <fieldset disabled={pending}>
        <legend className="cm-label">{details.inquiryLabel}</legend>
        <label className="sr-only" htmlFor="cmName">
          Your name
        </label>
        <input
          name="name"
          className="cm-input"
          id="cmName"
          placeholder={details.namePlaceholder}
          required
          maxLength={150}
          autoComplete="name"
        />
        <label className="sr-only" htmlFor="cmEmail">
          Email address
        </label>
        <input
          name="email"
          type="email"
          className="cm-input"
          id="cmEmail"
          placeholder={details.emailPlaceholder}
          required
          maxLength={254}
          autoComplete="email"
        />
        <label className="sr-only" htmlFor="cmMessage">
          Your message
        </label>
        <textarea
          name="message"
          className="cm-input"
          id="cmMessage"
          placeholder={details.messagePlaceholder}
          maxLength={5000}
        />
        <label className="cm-upload" htmlFor="cmImage">
          <span className="cm-upload-main">
            <span className="cm-upload-title">Add an image</span>
            <span className="cm-upload-sub">
              {images.length
                ? `${images.length} of ${MAX_IMAGES} images selected`
                : `Optional JPG, PNG, WebP, GIF, or HEIC. Up to ${MAX_IMAGES} images, ${MAX_IMAGE_MB} MB each`}
            </span>
          </span>
          <span className="cm-upload-action">Choose files</span>
          <input
            type="file"
            className="sr-only"
            id="cmImage"
            accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
            multiple
            onChange={selectImage}
          />
        </label>
        {images.length > 0 && (
          <ul className="cm-upload-list" aria-label="Selected images">
            {images.map((image, index) => (
              <li className="cm-upload-item" key={`${image.name}-${image.lastModified}-${index}`}>
                <span>{image.name}</span>
                <button type="button" onClick={() => removeImage(index)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <div hidden aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <button type="submit" className="cm-submit" disabled={pending}>
          {pending ? "Sending…" : buttonLabel}
        </button>
      </fieldset>
      <p className="cm-status" role="status" aria-live="polite">
        {feedback}
      </p>
      <p className="cm-note">{details.note}</p>
    </form>
  );
}
