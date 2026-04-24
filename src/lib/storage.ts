import { mkdir, writeFile } from "fs/promises";
import path from "path";

/** Guarda un archivo en public/uploads/<patientId>/ y devuelve su URL pública. */
export async function saveUpload(opts: {
  patientId: string;
  file: File;
}): Promise<{ url: string; filename: string; sizeBytes: number; mime: string }> {
  const { patientId, file } = opts;
  const safeName = file.name.replace(/[^\w.\-]+/g, "_");
  const stamp = Date.now().toString(36);
  const filename = `${stamp}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", patientId);
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buf);
  return {
    url: `/uploads/${patientId}/${filename}`,
    filename: file.name,
    sizeBytes: buf.byteLength,
    mime: file.type || "application/octet-stream",
  };
}
