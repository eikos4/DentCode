import { prisma } from "./prisma";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Genera un slug único para un dentista. */
export async function generateUniqueSlug(fullName: string, excludeId?: string): Promise<string> {
  const base = slugify(fullName) || "dentista";
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.dentist.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
    if (n > 50) return `${base}-${Date.now()}`;
  }
}
