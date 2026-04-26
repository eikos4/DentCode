import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const daySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string(),
  closeTime: z.string(),
  slotMinutes: z.number().int().default(30),
  enabled: z.boolean().default(true),
  locationId: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const schedule = await prisma.weeklySchedule.findMany({
      where: { dentistId: user.dentistId },
      orderBy: { dayOfWeek: "asc" },
    });
    return NextResponse.json(schedule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const body = await req.json();
    const { blocks } = z.object({ blocks: z.array(daySchema) }).parse(body);
    
    await prisma.weeklySchedule.deleteMany({ where: { dentistId: user.dentistId } });
    const created = await prisma.weeklySchedule.createMany({
      data: blocks.map((d) => ({ dentistId: user.dentistId!, ...d })),
    });
    
    return NextResponse.json({ count: created.count });
  } catch (error: any) {
    console.error("Schedule save error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
