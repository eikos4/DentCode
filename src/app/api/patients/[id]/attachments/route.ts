import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const patient = await prisma.patient.findFirst({ where: { id: params.id, dentistId } });
  if (!patient) return NextResponse.json({ error: "not found" }, { status: 404 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "file required" }, { status: 400 });

  const category = String(form.get("category") ?? "document");
  const subtype = (form.get("subtype") as string) || null;
  const note = (form.get("note") as string) || null;
  const takenAtStr = form.get("takenAt") as string | null;

  const saved = await saveUpload({ id: params.id, file, category: "patients" });

  const attachment = await prisma.attachment.create({
    data: {
      patientId: params.id,
      category,
      subtype,
      url: saved.url,
      filename: saved.filename,
      mime: saved.mime,
      sizeBytes: saved.sizeBytes,
      note,
      takenAt: takenAtStr ? new Date(takenAtStr) : null,
    },
  });

  return NextResponse.json(attachment);
}
