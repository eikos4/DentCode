import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getAuthUser } from "../../../../lib/auth";

const schema = z.object({
  patientId: z.string(),
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
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId: user.dentistId,
        ...(from && to ? { startAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { patient: true, location: true },
      orderBy: { startAt: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const data = schema.parse(await req.json());
    const appointment = await prisma.appointment.create({
      data: {
        dentistId: user.dentistId,
        patientId: data.patientId,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        treatment: data.treatment,
        notes: data.notes,
        priceCLP: data.priceCLP,
        locationId: data.locationId,
        status: data.status,
      },
      include: { patient: true },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
