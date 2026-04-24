import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";

const patch = z.object({
  done: z.boolean().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

async function authorize(id: string) {
  const dentistId = await getCurrentDentistId();
  const r = await prisma.recall.findUnique({ where: { id }, include: { patient: true } });
  if (!r || r.patient.dentistId !== dentistId) return null;
  return r;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const r = await authorize(params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  const data = patch.parse(await req.json());
  const updated = await prisma.recall.update({
    where: { id: params.id },
    data: {
      doneAt: data.done === true ? new Date() : data.done === false ? null : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      notes: data.notes,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const r = await authorize(params.id);
  if (!r) return NextResponse.json({ error: "not found" }, { status: 404 });
  await prisma.recall.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
