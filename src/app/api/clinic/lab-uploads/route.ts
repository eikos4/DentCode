import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../lib/auth";

export async function GET() {
  try {
    const clinic = await getClinicFromAuth();
    const uploads = await prisma.labUpload.findMany({
      where: { laboratory: { uploads: { some: {} } } },
      include: { laboratory: { select: { name: true, email: true } }, patient: { select: { fullName: true, rut: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return NextResponse.json(uploads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
