import { draftMode } from 'next/headers';
import { getFreshPalette } from '@/lib/active-palette';

export const dynamic = 'force-dynamic';
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' };

export async function GET() {
  try {
    return Response.json(await getFreshPalette((await draftMode()).isEnabled), { headers });
  } catch {
    return Response.json({ error: 'Palette temporarily unavailable' }, { status: 503, headers });
  }
}
