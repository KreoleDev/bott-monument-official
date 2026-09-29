export function PreviewBanner() {
  return (
    <aside className="preview-banner" aria-label="Draft preview">
      Draft preview — unpublished content
      <form action="/api/preview/exit" method="post">
        <button type="submit">Exit preview</button>
      </form>
    </aside>
  );
}
