import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";

const schema = z.object({
  toothCode: z.string().min(2).max(3),
  surface: z.string().optional(),
  condition: z.string(),
  note: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const data = schema.parse(await req.json());
  const dentistId = await getCurrentDentistId();
  const patient = await prisma.patient.findFirst({ where: { id: params.id, dentistId } });
  if (!patient) return NextResponse.json({ error: "not found" }, { status: 404 });

  const existing = await prisma.toothRecord.findFirst({
    where: { patientId: params.id, toothCode: data.toothCode, surface: data.surface ?? null },
  });

  const record = existing
    ? await prisma.toothRecord.update({ where: { id: existing.id }, data })
    : await prisma.toothRecord.create({ data: { patientId: params.id, ...data } });

  return NextResponse.json(record);
}
