import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";
import { buildConfirmationMessage, sendWhatsAppText } from "@/lib/whatsapp";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const appt = await prisma.appointment.findFirst({
    where: { id: params.id, dentistId },
    include: { patient: true, dentist: true },
  });
  if (!appt) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!appt.patient.phone) return NextResponse.json({ error: "patient has no phone" }, { status: 400 });

  const body = buildConfirmationMessage({
    patientName: appt.patient.fullName.split(" ")[0],
    dentistName: appt.dentist.fullName,
    startAt: appt.startAt,
  });
  const result = await sendWhatsAppText(appt.patient.phone, body, appt.id);
  return NextResponse.json(result);
}
