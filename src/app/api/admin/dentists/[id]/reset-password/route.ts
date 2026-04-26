import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Solo SUPER_ADMIN puede acceder
    await requireRole("SUPER_ADMIN");

    const { id } = params;
    const body = await request.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Hashear nueva contraseña
    const passwordHash = await bcrypt.hash(password, 12);

    // Actualizar dentista
    const dentist = await prisma.dentist.update({
      where: { id },
      data: { passwordHash },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    });

    // TODO: Enviar email al dentista notificando el cambio de contraseña

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada correctamente",
      dentist: {
        id: dentist.id,
        fullName: dentist.fullName,
        email: dentist.email,
      },
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
