import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentDentistId } from "../../../../../lib/utils";

const schema = z.object({
  date: z.string().optional(),
  subjective: z.string().optional(),
  objective: z.string().optional(),
  assessment: z.string().optional(),
  plan: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const patient = await prisma.patient.findFirst({ where: { id: params.id, dentistId } });
  if (!patient) return NextResponse.json({ error: "not found" }, { status: 404 });

  const data = schema.parse(await req.json());
  const note = await prisma.clinicalNote.create({
    data: {
      patientId: params.id,
      date: data.date ? new Date(data.date) : new Date(),
      subjective: data.subjective || null,
      objective: data.objective || null,
      assessment: data.assessment || null,
      plan: data.plan || null,
    },
  });
  return NextResponse.json(note);
}
