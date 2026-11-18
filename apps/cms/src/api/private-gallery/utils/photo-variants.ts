import { randomUUID } from "node:crypto";
import { mkdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const widths = [160, 480, 960, 1600] as const;
const pending = new Map<string, Promise<string>>();

export function getPhotoWidth(value?: string): number | null {
  if (!value) return null;
  const width = Number(value);
  return widths.includes(width as (typeof widths)[number]) ? width : null;
}

// Derivatives stay beside the private originals, outside the public upload folder.
// Include the source version so replacing an upload cannot reuse an old rendition.
export async function getPhotoVariant(filepath: string, width: number): Promise<string> {
  if (!widths.includes(width as (typeof widths)[number])) throw new Error("Invalid photo width");
  const source = await stat(filepath);
  const directory = path.join(path.dirname(filepath), ".variants");
  const output = path.join(
    directory,
    `${path.basename(filepath)}-${source.mtimeMs}-${source.size}-${width}-v1.webp`,
  );
  try {
    await stat(output);
    return output;
  } catch {
    // Existing uploads get their derivatives on first use.
  }
  const existing = pending.get(output);
  if (existing) return existing;
  const job = (async () => {
    await mkdir(directory, { recursive: true });
    const temporary = `${output}.${randomUUID()}.tmp`;
    try {
      await sharp(filepath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 78 })
        .toFile(temporary);
      await rename(temporary, output);
      return output;
    } finally {
      await unlink(temporary).catch(() => {});
    }
  })();
  pending.set(output, job);
  try {
    return await job;
  } finally {
    pending.delete(output);
  }
}
