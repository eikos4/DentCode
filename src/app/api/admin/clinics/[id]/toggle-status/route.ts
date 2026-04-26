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
    const body = await request.json();
    const { isActive } = body;

    // Actualizar clínica
    const clinic = await prisma.clinic.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Clínica ${isActive ? "activada" : "desactivada"} correctamente`,
      clinic,
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Clínica no encontrada" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
