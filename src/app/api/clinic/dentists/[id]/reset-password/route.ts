import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClinicFromAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Generar contraseña aleatoria
function generateTempPassword(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await getClinicFromAuth();
    const { id } = params;

    // Solo CLINIC_ADMIN puede resetear contraseñas
    if (clinic.role !== "CLINIC_ADMIN") {
      return NextResponse.json(
        { error: "Solo el administrador puede cambiar contraseñas" },
        { status: 403 }
      );
    }

    // Verificar que el dentista pertenezca a la clínica
    const dentist = await prisma.dentist.findFirst({
      where: { id, clinicId: clinic.id },
    });
    if (!dentist) {
      return NextResponse.json(
        { error: "Dentista no encontrado" },
        { status: 404 }
      );
    }

    // Generar nueva contraseña temporal
    const tempPassword = generateTempPassword(8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Actualizar contraseña
    await prisma.dentist.update({
      where: { id },
      data: { passwordHash: hashedPassword },
    });

    return NextResponse.json({
      message: "Contraseña actualizada",
      tempPassword,
      dentistName: dentist.fullName,
      dentistEmail: dentist.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
