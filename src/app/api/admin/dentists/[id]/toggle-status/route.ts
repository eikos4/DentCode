import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Solo SUPER_ADMIN puede acceder
    await requireRole("SUPER_ADMIN");

    const { id } = params;

    // Obtener el estado actual
    const dentist = await prisma.dentist.findUnique({
      where: { id },
      select: { isActive: true }
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }

    const newStatus = !dentist.isActive;

    // Actualizar Dentista y Usuario asociado en una transacción
    await prisma.$transaction([
      prisma.dentist.update({
        where: { id },
        data: { isActive: newStatus }
      }),
      prisma.user.updateMany({
        where: { dentistId: id },
        data: { isActive: newStatus }
      })
    ]);

    return NextResponse.json({
      message: `Dentista ${newStatus ? "habilitado" : "deshabilitado"} correctamente`,
      isActive: newStatus
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
