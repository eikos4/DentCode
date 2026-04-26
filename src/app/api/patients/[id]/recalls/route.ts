import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/auth";

const schema = z.object({
  type: z.string().min(1),
  dueDate: z.string(),
  notes: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const patient = await prisma.patient.findFirst({ where: { id: params.id, dentistId } });
  if (!patient) return NextResponse.json({ error: "not found" }, { status: 404 });

  const data = schema.parse(await req.json());
  const recall = await prisma.recall.create({
    data: {
      patientId: params.id,
      type: data.type,
      dueDate: new Date(data.dueDate),
      notes: data.notes || null,
    },
  });
  return NextResponse.json(recall);
}
