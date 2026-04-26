import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret";

// Helper para validar sesión de laboratorio (usando cookies personalizadas si no se usa NextAuth para labs)
async function getLabId() {
  const cookieStore = cookies();
  const token = cookieStore.get("lab-token")?.value;
  if (!token) return null;
  try {
    const decoded = verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// GET /api/lab/orders - Obtener órdenes para el laboratorio
export async function GET() {
  try {
    const labId = await getLabId();
    if (!labId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const orders = await prisma.labOrder.findMany({
      where: {
        OR: [
          { labId: labId },
          { labId: null } // Órdenes abiertas (si el sistema las permite)
        ]
      },
      include: {
        patient: { select: { fullName: true, rut: true } },
        dentist: { select: { fullName: true } },
        clinic: { select: { name: true } },
        result: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching lab orders:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
