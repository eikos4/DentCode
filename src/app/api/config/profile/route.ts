import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  bio: z.string().optional(),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  rut: z.string().optional(),
  licenseNumber: z.string().optional(),
  photoUrl: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const dentist = await prisma.dentist.findUnique({
      where: { id: user.dentistId },
      include: { publicProfile: true },
    });
    return NextResponse.json(dentist);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const data = schema.partial().parse(await req.json());
    const dentist = await prisma.dentist.update({
      where: { id: user.dentistId },
      data: {
        ...(data.name ? { fullName: data.name } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
        ...(data.rut !== undefined ? { rut: data.rut } : {}),
        ...(data.licenseNumber !== undefined ? { licenseNumber: data.licenseNumber } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
      },
    });
    return NextResponse.json(dentist);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
