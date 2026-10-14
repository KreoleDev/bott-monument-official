import { revalidateTag, revalidatePath } from "next/cache";
import { DEFAULT_LOCALE } from "@/lib/locale";
import { matchesSecret } from "@/lib/secret";
import { clearCmsMemory } from "@/lib/cms-cache";
export async function POST(request: Request) {
  if (!matchesSecret(request.headers.get("x-revalidation-secret"), process.env.REVALIDATION_SECRET))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  clearCmsMemory();
  revalidateTag("cms", "max");
  revalidatePath("/", "layout");
  revalidatePath(`/${DEFAULT_LOCALE}`, "page");
  revalidatePath("/[locale]", "page");
  return Response.json({ revalidated: true });
}
