import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../../../lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await getClinicFromAuth();
    const { id: dentistId } = params;

    // Verificar que el dentista pertenezca a la clínica
    const dentist = await prisma.dentist.findFirst({
      where: { id: dentistId, clinicId: clinic.id, isActive: true },
    });
    if (!dentist) {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }

    // Obtener fecha de query params
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    let whereClause: any = { dentistId, clinicId: clinic.id };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      whereClause.startAt = { gte: startOfDay, lte: endOfDay };
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: { select: { fullName: true, phone: true } },
      },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
