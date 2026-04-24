import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const att = await prisma.attachment.findUnique({ where: { id: params.id }, include: { patient: true } });
  if (!att || att.patient.dentistId !== dentistId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  try {
    const rel = att.url.replace(/^\//, "");
    await unlink(path.join(process.cwd(), "public", rel));
  } catch {}
  await prisma.attachment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
