import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/auth";

const patch = z.object({
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"]).optional(),
  notes: z.string().optional(),
  priceCLP: z.number().int().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const data = patch.parse(await req.json());
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, dentistId } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  const updated = await prisma.appointment.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const existing = await prisma.appointment.findFirst({ where: { id: params.id, dentistId } });
  if (!existing) return NextResponse.json({ error: "not found" }, { status: 404 });
  await prisma.appointment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
