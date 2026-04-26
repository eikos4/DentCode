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
    const { status, notes } = body;

    // Validar status
    if (!["verified", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Estado de verificación inválido" },
        { status: 400 }
      );
    }

    // Actualizar dentista
    const dentist = await prisma.dentist.update({
      where: { id },
      data: {
        verificationStatus: status,
        emailVerified: status === "verified",
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        verificationStatus: true,
        emailVerified: true,
      },
    });

    // TODO: Enviar email al dentista notificando el cambio de verificación

    return NextResponse.json({
      success: true,
      message: `Dentista ${status === "verified" ? "verificado" : "rechazado"} correctamente`,
      dentist,
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
