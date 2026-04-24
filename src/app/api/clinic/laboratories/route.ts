import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getClinicFromAuth } from "@/lib/auth";

export async function GET() {
  try {
    const clinic = await getClinicFromAuth();
    const labs = await prisma.laboratory.findMany({
      where: { isActive: true },
      select: { id: true, name: true, rut: true, email: true, phone: true, city: true, contactName: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(labs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
