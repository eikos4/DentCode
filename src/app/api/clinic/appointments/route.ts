import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../lib/auth";

const schema = z.object({
  patientId: z.string(),
  dentistId: z.string(),
  startAt: z.string(),
  endAt: z.string(),
  treatment: z.string().optional(),
  notes: z.string().optional(),
  priceCLP: z.number().int().optional(),
  locationId: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"]).default("SCHEDULED"),
});

export async function GET(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const dentistId = searchParams.get("dentistId");
    const appointments = await prisma.appointment.findMany({
      where: {
        clinicId: clinic.id,
        ...(dentistId ? { dentistId } : {}),
        ...(from && to ? { startAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { patient: true, dentist: true, location: true },
      orderBy: { startAt: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    const data = schema.parse(await req.json());
    const appointment = await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        dentistId: data.dentistId,
        patientId: data.patientId,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        treatment: data.treatment,
        notes: data.notes,
        priceCLP: data.priceCLP,
        locationId: data.locationId,
        status: data.status,
      },
      include: { patient: true, dentist: true },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
