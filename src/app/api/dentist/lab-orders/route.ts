import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/dentist/lab-orders - Obtener órdenes del dentista o su clínica
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "DENTIST" && session.user.role !== "CLINIC_ADMIN" && session.user.role !== "CLINIC_STAFF")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get("patientId");

    const where: any = {};
    
    if (session.user.clinicId) {
      where.clinicId = session.user.clinicId;
    } else if (session.user.dentistId) {
      where.dentistId = session.user.dentistId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    const orders = await prisma.labOrder.findMany({
      where,
      include: {
        patient: { select: { fullName: true, rut: true } },
        laboratory: { select: { name: true } },
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

// POST /api/dentist/lab-orders - Crear una nueva orden
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.dentistId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { patientId, labId, examType, notes } = body;

    if (!patientId || !examType) {
      return NextResponse.json({ error: "Paciente y tipo de examen son requeridos" }, { status: 400 });
    }

    const order = await prisma.labOrder.create({
      data: {
        patientId,
        dentistId: session.user.dentistId,
        clinicId: session.user.clinicId,
        labId: labId || null,
        examType,
        notes,
        status: "PENDING"
      }
    });

    return NextResponse.json({ message: "Orden creada exitosamente", order });
  } catch (error) {
    console.error("Error creating lab order:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
