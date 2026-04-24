import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  durationMin: z.number().int().default(30),
  priceCLP: z.number().int().optional(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const services = await prisma.serviceOffering.findMany({
      where: { dentistId: user.dentistId },
      orderBy: { order: "asc" },
    });
    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const data = schema.parse(await req.json());
    const service = await prisma.serviceOffering.create({
      data: { dentistId: user.dentistId, ...data },
    });
    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
