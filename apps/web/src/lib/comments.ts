export type Comment = { documentId: string; quote: string; personName: string; location: string | null; sortOrder: number };

// Page through the collection so newly published comments are never silently capped.
export async function getComments(): Promise<Comment[]> {
  const url = process.env.STRAPI_URL?.replace(/\/$/, '');
  const token = process.env.STRAPI_API_TOKEN;
  if (!url || !token) return [];
  const comments: Comment[] = [];
  try {
    let page = 1;
    let pageCount = 1;
    do {
      const response = await fetch(`${url}/graphql`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `query Comments($page: Int!) {
          comments_connection(status: PUBLISHED, sort: ["sortOrder:asc", "documentId:asc"], pagination: { page: $page, pageSize: 100 }) {
            nodes { documentId quote personName location sortOrder }
            pageInfo { pageCount }
          }
        }`, variables: { page } }),
        ...(process.env.NODE_ENV === 'development' ? { cache: 'no-store' as const } : { next: { revalidate: 60 } }),
      });
      if (!response.ok) throw new Error(`Strapi returned ${response.status}`);
      const result = await response.json();
      if (result.errors?.length) throw new Error(result.errors.map((e: {message:string}) => e.message).join(', '));
      const connection = result.data.comments_connection;
      comments.push(...connection.nodes);
      pageCount = connection.pageInfo.pageCount;
      page++;
    } while (page <= pageCount);
    return comments;
  } catch (error) {
    console.warn('Could not fetch comments from Strapi', error);
    return [];
  }
}
