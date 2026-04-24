import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const note = await prisma.clinicalNote.findUnique({ where: { id: params.id }, include: { patient: true } });
  if (!note || note.patient.dentistId !== dentistId) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  await prisma.clinicalNote.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
