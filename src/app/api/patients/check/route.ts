import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getAuthUser } from "../../../../../lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const rut = searchParams.get("rut");
    const email = searchParams.get("email");
    if (!rut && !email) return NextResponse.json({ error: "Se requiere rut o email" }, { status: 400 });
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const patient = await prisma.patient.findFirst({
      where: {
        dentistId: user.dentistId,
        OR: [
          ...(rut ? [{ rut }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });
    return NextResponse.json({ exists: !!patient, patient });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
