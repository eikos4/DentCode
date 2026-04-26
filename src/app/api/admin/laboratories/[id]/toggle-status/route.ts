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

    // Actualizar laboratorio
    const lab = await prisma.laboratory.update({
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
      message: `Laboratorio ${isActive ? "activado" : "desactivado"} correctamente`,
      laboratory: lab,
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Laboratorio no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
