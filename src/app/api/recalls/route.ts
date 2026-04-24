import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const where = dentistId
      ? { dentistId, published: true }
      : { published: true };
    const recalls = await prisma.recall.findMany({
      where: { patient: { dentistId: dentistId || undefined } },
      include: { patient: { select: { fullName: true, phone: true, email: true } } },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(recalls);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
