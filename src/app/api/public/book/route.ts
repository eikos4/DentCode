import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";

const schema = z.object({
  dentistSlug: z.string(),
  date: z.string(),
  time: z.string(),
  duration: z.number().int().default(30),
  patientName: z.string().min(2),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().optional().or(z.literal("")),
  treatment: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const dentist = await prisma.dentist.findUnique({
      where: { slug: data.dentistSlug },
    });
    if (!dentist || !dentist.isPublished) {
      return NextResponse.json({ error: "Dentista no disponible" }, { status: 404 });
    }
    const [year, month, day] = data.date.split("-").map(Number);
    const [hour, minute] = data.time.split(":").map(Number);
    const startAt = new Date(year, month - 1, day, hour, minute, 0);
    const endAt = new Date(startAt.getTime() + data.duration * 60000);

    let patient = await prisma.patient.findFirst({
      where: {
        dentistId: dentist.id,
        OR: [
          ...(data.patientPhone ? [{ phone: data.patientPhone }] : []),
          ...(data.patientEmail ? [{ email: data.patientEmail }] : []),
        ],
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          dentistId: dentist.id,
          fullName: data.patientName,
          phone: data.patientPhone || null,
          email: data.patientEmail || null,
        },
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        dentistId: dentist.id,
        patientId: patient.id,
        startAt,
        endAt,
        treatment: data.treatment || null,
        notes: data.notes || null,
        status: "SCHEDULED",
      },
    });

    return NextResponse.json({ ok: true, appointmentId: appointment.id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
