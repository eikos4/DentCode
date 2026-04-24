import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const to = searchParams.get("to");
    const template = searchParams.get("template");
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const logs = await prisma.messageLog.findMany({
      where: {
        ...(dentistId ? { appointment: { dentistId } } : {}),
        ...(template ? { template } : {}),
      },
      include: { appointment: { select: { startAt: true, patient: { select: { fullName: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const body = await req.json();
    const { appointmentIds } = body;
    if (!Array.isArray(appointmentIds) || appointmentIds.length === 0) {
      return NextResponse.json({ error: "Se requiere appointmentIds" }, { status: 400 });
    }
    const appointments = await prisma.appointment.findMany({
      where: { id: { in: appointmentIds }, dentistId: user.dentistId },
      include: { patient: true },
    });
    const results = [];
    for (const appt of appointments) {
      const log = await prisma.messageLog.create({
        data: {
          appointmentId: appt.id,
          channel: "whatsapp",
          direction: "out",
          to: appt.patient.phone || "",
          body: `Recordatorio de cita el ${appt.startAt.toLocaleDateString("es-CL")}`,
          status: "queued",
          template: "reminder",
        },
      });
      results.push(log);
    }
    return NextResponse.json({ sent: results.length, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
