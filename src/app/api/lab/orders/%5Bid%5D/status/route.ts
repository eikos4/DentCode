import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verify } from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback_secret";

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

// PATCH /api/lab/orders/[id]/status
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const labId = await getLabId();
    if (!labId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const body = await req.json();
    const { status } = body;

    if (!["PENDING", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 });
    }

    const order = await prisma.labOrder.update({
      where: { id: params.id },
      data: { status }
    });

    return NextResponse.json({ message: "Estado actualizado", order });
  } catch (error) {
    console.error("Error updating lab order status:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
