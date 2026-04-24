import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../../../../lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await getClinicFromAuth();
    const { id } = params;

    const patient = await prisma.patient.findFirst({
      where: { id, clinicId: clinic.id },
      include: {
        dentist: {
          select: { id: true, fullName: true }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
