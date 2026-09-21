import { revalidateTag, revalidatePath } from "next/cache";
import { matchesSecret } from "@/lib/secret";
import { clearCmsMemory } from "@/lib/cms-cache";
export async function POST(request: Request) {
  if (!matchesSecret(request.headers.get("x-revalidation-secret"), process.env.REVALIDATION_SECRET))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  clearCmsMemory();
  revalidateTag("cms", "max");
  revalidatePath("/", "layout");
  return Response.json({ revalidated: true });
}
