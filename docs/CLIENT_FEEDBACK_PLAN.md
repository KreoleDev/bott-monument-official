# Client Feedback Implementation Plan

Created: 2026-10-12

Use this file as the working checklist for the latest Bott Monument client
feedback. Mark each item complete only after the change is implemented,
content is updated in Strapi or seeds as needed, and the site has been checked
on desktop and mobile.

## Source Feedback Summary

- No AI images anywhere on the site. Restore the owner's portrait photo and all
  magazine covers to originals.
- Remove Featured Stories / Art Becomes News.
- Change the founder quote to: "I love to make art.  It just happens to go in a cemetery."
- Use the owner's thumbnail photo, make it larger, cover the right side of the
  page, and place lettering on the left.
- Change gallery copy to: "An inimitable collection of art."
- Remove words under gallery images if possible.
- Eliminate duplicate images in the carousel.
- Showroom should say "Appointments Preferred" and hours should be 9-4.
- Trusted for Generations should say 151 years in business and eliminate states
  and number of memorials.
- Remove reviews/testimonials. Later replace with AICA logo, award photo(s),
  and award count/list when provided.
- Get private gallery running with many supplied photos.
- Inquiry form should remove category choices, ask visitors to write about the
  person, include spam protection, and allow picture uploads.
- Only list the owner's cell number and invite people to call or text.
- Use either "Masterpieces" or "Gallery", not both. Client prefers
  "Masterpieces".

## Content And Media Cleanup

- [ ] Audit all public images in Strapi media, `apps/web/public`, and
  `bott-monument-design/images` for AI-generated or placeholder imagery.
- [ ] Replace the founder/owner portrait with the original thumbnail photo the
  client prefers.
- [ ] Replace magazine-cover and press-clipping images with original supplied
  files.
- [ ] Confirm every public homepage image has an approved original source.
- [ ] Remove duplicate carousel/gallery images from Strapi Gallery records or
  from the selected gallery items on the Home page.
- [ ] Confirm the private gallery photos are separate from public gallery items
  unless the owner explicitly approves public display.

## Homepage Section Changes

- [ ] Remove the News / Featured Stories / Art Becomes News section from the Home
  page Dynamic Zone in Strapi.
- [ ] Remove the News link from the primary navigation if it is no longer needed.
- [ ] Decide whether to keep `/news` route code dormant or remove it completely.
  Prefer keeping dormant until launch unless the client asks for hard removal.
- [ ] Remove the Testimonials / Reviews section from the Home page Dynamic Zone.
- [ ] Leave placeholder plan for future awards block using AICA logo, award
  photo(s), and award wins once assets are supplied.

## Founder Section

- [ ] Update founder quote exactly:
  `"I love to make art.  It just happens to go in a cemetery."`
- [ ] Redesign founder section so text/lettering sits on the left and the
  owner's portrait fills the right side.
- [ ] Make the portrait larger and crop responsively so the subject remains
  visible on desktop, tablet, and mobile.
- [ ] Verify the section still works with the existing `pages.founder` CMS
  component and mapper.

## Masterpieces / Gallery

- [ ] Standardize public site language to "Masterpieces" instead of mixing
  "Masterpieces" and "Gallery".
- [ ] Update gallery section title/copy to:
  `"An inimitable collection of art."`
- [ ] Remove visible titles/subtitles under carousel images.
- [ ] Preserve accessible image labels using media alt text or gallery item
  titles even if captions are hidden visually.
- [ ] Confirm carousel still works after duplicate removal and caption hiding.
- [ ] Update navigation link label to "Masterpieces" and point it to the public
  carousel section.

## Showroom And Business Trust Copy

- [ ] Update showroom copy to say "Appointments Preferred".
- [ ] Update showroom hours to 9-4.
- [ ] Update "Trusted for Generations" to say 151 years in business.
- [ ] Remove states served and number of memorials from that section.
- [ ] Replace sample phone numbers everywhere with the owner's cell number only.
- [ ] Update contact copy to invite visitors to call or text the cell number.

## Inquiry Form

Current code notes:

- Frontend form: `apps/web/src/components/contact-form.tsx`
- API route: `apps/web/src/app/api/inquiries/route.ts`
- Strapi model: `apps/cms/src/api/inquiry/content-types/inquiry/schema.json`
- Inquiry notifications: `apps/cms/src/api/inquiry/content-types/inquiry/lifecycles.ts`

Tasks:

- [ ] Remove inquiry type/category pills from the form UI.
- [ ] Remove the required `inquiryType` validation from the Next.js API route.
- [ ] Make `inquiryType` optional or remove it from the Strapi Inquiry schema.
- [ ] Update form prompt and placeholder so visitors write about the person and
  what they have in mind.
- [ ] Keep the existing honeypot field.
- [ ] Add production spam protection before launch. Preferred options:
  Cloudflare Turnstile, hCaptcha, or reCAPTCHA. Store provider keys only in
  environment variables.
- [ ] Add file upload support for visitor photos.
- [ ] Enforce upload limits: allowed image/PDF types, maximum file count, maximum
  individual file size, and maximum total request size.
- [ ] Store uploads in Strapi media or a related private attachment collection.
- [ ] Include upload links in inquiry notification emails, if email is enabled.
- [ ] Add tests for category-free inquiries, spam rejection, and upload limits.

## Private Gallery Implementation

Goal: visitors request access, the owner reviews the request in Strapi, and the
owner can grant permission to a private gallery without making those images
public.

Existing code notes:

- Public gallery collection: `api::gallery-item.gallery-item`
- Public gallery component: `apps/web/src/components/gallery.tsx`
- Existing private-gallery dialog copy lives in `components_gallery_access`.
- Current dialog links visitors to `#contact`; it does not authenticate or grant
  private access yet.

Recommended model:

- [ ] Add a `Private Gallery Item` collection in Strapi.
  Fields: title, optional description, image, sortOrder, visibility/status, and
  optional tags.
- [ ] Add a `Private Gallery Request` collection, or extend Inquiry with
  private-gallery fields.
  Recommended fields: name, email, phone, message, status, accessTokenHash,
  accessExpiresAt, approvedAt, approvedBy, internalNotes.
- [ ] Keep private gallery images unpublished from the public Gallery collection.
- [ ] Add an owner-only Strapi workflow:
  New request -> reviewed -> approved or denied.
- [ ] When approved, generate a secure random token, store only its hash in
  Strapi, set an expiration date, and email the visitor a private link.
- [ ] Add a private frontend route such as `/private-gallery/[token]`.
- [ ] Validate token server-side through the Next.js API route or a Strapi custom
  route before returning private images.
- [ ] Never expose all private images through public GraphQL queries.
- [ ] Add expiry handling and a friendly expired-link state.
- [ ] Add revoke behavior by changing status or clearing token fields in Strapi.
- [ ] Add audit-friendly fields for owner notes and approval date.
- [ ] Add tests for valid token access, invalid token rejection, expired token
  rejection, and revoked access.

Possible implementation path:

1. Model the request/access data in Strapi.
2. Update inquiry/contact flow to include "request private gallery access"
   without exposing categories.
3. Build owner approval action in Strapi or as a small custom controller.
4. Build private-gallery route in Next.js.
5. Add upload and spam protection after the base request flow is stable.
6. Seed or import supplied private gallery photos.
7. Verify access control with direct URL and GraphQL/API attempts.

## Verification Checklist

- [ ] Run frontend tests.
- [ ] Run CMS tests.
- [ ] Run frontend lint/type/build checks.
- [ ] Run CMS build/type checks.
- [ ] Review homepage desktop layout.
- [ ] Review homepage mobile layout.
- [ ] Verify no AI/placeholder public images remain.
- [ ] Verify inquiries save without category options.
- [ ] Verify spam protection works in production-like environment.
- [ ] Verify visitor uploads work and respect limits.
- [ ] Verify private gallery cannot be accessed without approval.
- [ ] Verify approved private gallery links work, expire, and can be revoked.

## Waiting On Client Assets Or Decisions

- [ ] Original owner thumbnail/preferred portrait.
- [ ] Original magazine cover images.
- [ ] Owner's cell number.
- [ ] Supplied private gallery image set.
- [ ] AICA logo.
- [ ] Award photo(s).
- [ ] Award names/count/list to display.
- [ ] Spam protection provider choice, unless the implementation chooses a
  default provider during launch setup.
