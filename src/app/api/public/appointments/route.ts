import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addMinutes } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      dentistId, 
      startAt, 
      treatment, 
      patientData: { fullName, rut, phone, email } 
    } = body;

    if (!dentistId || !startAt || !fullName || !phone) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
    }

    // 1. Obtener datos del dentista para saber la duración del slot y clinicId
    const dentist = await prisma.dentist.findUnique({
      where: { id: dentistId },
      include: { weeklySchedule: true }
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }

    const slotMinutes = dentist.weeklySchedule[0]?.slotMinutes || 30;
    const endAt = addMinutes(new Date(startAt), slotMinutes);

    // 2. Buscar o Crear Paciente (vinculado a este dentista/clínica)
    // Buscamos por RUT dentro del contexto del dentista/clínica
    let patient = await prisma.patient.findFirst({
      where: {
        rut: rut,
        OR: [
          { dentistId: dentistId },
          { clinicId: dentist.clinicId }
        ]
      }
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          fullName,
          rut,
          phone,
          email,
          dentistId: dentistId,
          clinicId: dentist.clinicId,
        }
      });
    }

    // 3. Crear la Cita
    const appointment = await prisma.appointment.create({
      data: {
        dentistId,
        patientId: patient.id,
        clinicId: dentist.clinicId,
        startAt: new Date(startAt),
        endAt: endAt,
        treatment: treatment || "Consulta General",
        status: "SCHEDULED",
        notes: "Agendado vía portal público"
      }
    });

    // 4. (Simulación) Log de mensaje de WhatsApp de confirmación
    await prisma.messageLog.create({
      data: {
        appointmentId: appointment.id,
        channel: "whatsapp",
        direction: "out",
        to: phone,
        body: `Hola ${fullName}, tu cita con el Dr(a). ${dentist.fullName} ha sido confirmada para el ${new Date(startAt).toLocaleString('es-CL')}.`,
        status: "sent"
      }
    });

    return NextResponse.json({ 
      message: "Cita agendada con éxito", 
      appointmentId: appointment.id 
    }, { status: 201 });

  } catch (error) {
    console.error("Error creating public appointment:", error);
    return NextResponse.json({ error: "No se pudo procesar la cita" }, { status: 500 });
  }
}
