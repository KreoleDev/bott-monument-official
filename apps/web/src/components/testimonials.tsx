import type { SectionContent } from "@/lib/strapi";
import type { Comment } from "@/lib/comments";
import { TestimonialColumns } from "./testimonial-columns";
import "./testimonials.css";

export function Testimonials({
  section,
  comments,
}: {
  section: SectionContent | null;
  comments: Comment[];
}) {
  if (!section || !comments.length) return null;
  return (
    <section id="testimonials" aria-labelledby="testimonials-title">
      <div className="test-header">
        <h2 id="testimonials-title" className="test-title">
          {section.title} {section.description && <em>{section.description}</em>}
        </h2>
        <div className="test-rule" aria-hidden="true" />
      </div>
      <TestimonialColumns comments={comments} />
    </section>
  );
}
