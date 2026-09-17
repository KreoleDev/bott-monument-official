import { getCollection } from "./strapi-collection";
export type Comment = {
  documentId: string;
  quote: string;
  personName: string;
  location: string | null;
  sortOrder: number;
};
export async function getComments(preview = false): Promise<Comment[]> {
  return getCollection<Comment>(
    "comments_connection",
    "documentId quote personName location sortOrder",
    ["sortOrder:asc", "documentId:asc"],
    preview,
  );
}
