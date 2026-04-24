import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClinicFromAuth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const clinic = await getClinicFromAuth();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const appointments = await prisma.appointment.findMany({
      where: {
        dentistId: params.id,
        clinicId: clinic.id,
        ...(from && to ? { startAt: { gte: new Date(from), lte: new Date(to) } } : {}),
      },
      include: { patient: { select: { fullName: true, phone: true } } },
      orderBy: { startAt: "asc" },
    });
    return NextResponse.json(appointments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
