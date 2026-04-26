import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const dentist = await prisma.dentist.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        fullName: true,
        specialty: true,
        photoUrl: true,
        clinic: {
          select: { name: true }
        }
      }
    });

    if (!dentist) {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ dentist });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
