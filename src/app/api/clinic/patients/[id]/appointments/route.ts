import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../../../lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await getClinicFromAuth();
    const { id: patientId } = params;

    // Verificar que el paciente pertenezca a la clínica
    const patient = await prisma.patient.findFirst({
      where: { id: patientId, clinicId: clinic.id }
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    const appointments = await prisma.appointment.findMany({
      where: { patientId, clinicId: clinic.id },
      include: {
        dentist: { select: { fullName: true } }
      },
      orderBy: { startAt: "desc" }
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
