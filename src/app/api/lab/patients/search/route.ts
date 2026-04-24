import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireLabAuth } from "@/lib/lab-auth";

export async function GET(req: NextRequest) {
  try {
    const lab = requireLabAuth(req);
    const { searchParams } = new URL(req.url);
    const rut = searchParams.get("rut");
    if (!rut) return NextResponse.json({ error: "Se requiere RUT" }, { status: 400 });
    const patient = await prisma.patient.findFirst({
      where: { rut },
      select: { id: true, fullName: true, rut: true, dentist: { select: { fullName: true } } },
    });
    return NextResponse.json({ found: !!patient, patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
