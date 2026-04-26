import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { buildConfirmationMessage, sendWhatsAppText } from "@/lib/whatsapp";

const schema = z.object({
  patientId: z.string(),
  startAt: z.string(),
  endAt: z.string().optional(),
  durationMin: z.number().int().optional(),
  treatment: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  priceCLP: z.number().int().optional().nullable(),
  locationId: z.string().optional().nullable(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "CANCELLED", "NO_SHOW", "COMPLETED"]).default("SCHEDULED"),
  notifyWhatsApp: z.boolean().default(false),
});

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId: user.dentistId,
        ...(from && to ? { startAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { patient: { select: { id: true, fullName: true, phone: true } }, location: true },
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
    
    const json = await req.json();
    const data = schema.parse(json);
    
    const start = new Date(data.startAt);
    let end: Date;
    
    if (data.endAt) {
      end = new Date(data.endAt);
    } else {
      const duration = data.durationMin || 30;
      end = new Date(start.getTime() + duration * 60000);
    }

    const appointment = await prisma.appointment.create({
      data: {
        dentistId: user.dentistId,
        patientId: data.patientId,
        startAt: start,
        endAt: end,
        treatment: data.treatment,
        notes: data.notes,
        priceCLP: data.priceCLP,
        locationId: data.locationId,
        status: data.status,
      },
      include: { 
        patient: { select: { id: true, fullName: true, phone: true } },
        dentist: { select: { fullName: true } }
      },
    });

    // Notificación opcional
    if (data.notifyWhatsApp && appointment.patient.phone) {
      try {
        const body = buildConfirmationMessage({
          patientName: appointment.patient.fullName.split(" ")[0],
          dentistName: appointment.dentist.fullName,
          startAt: appointment.startAt,
        });
        // No bloqueamos la respuesta principal si el WhatsApp falla o es lento
        sendWhatsAppText(appointment.patient.phone, body, appointment.id).catch(err => {
          console.error("Error enviando WhatsApp en background:", err);
        });
      } catch (err) {
        console.error("Error preparando mensaje WhatsApp:", err);
      }
    }

    return NextResponse.json(appointment, { status: 201 });
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

