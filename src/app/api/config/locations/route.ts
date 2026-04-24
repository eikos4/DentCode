import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  commune: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const locations = await prisma.clinicLocation.findMany({
      where: { dentistId: user.dentistId, isActive: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const data = schema.parse(await req.json());
    const location = await prisma.clinicLocation.create({
      data: { dentistId: user.dentistId, ...data },
    });
    return NextResponse.json(location, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
