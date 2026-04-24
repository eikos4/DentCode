import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../lib/auth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  commune: z.string().optional(),
  region: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function GET() {
  try {
    const clinic = await getClinicFromAuth();
    const data = await prisma.clinic.findUnique({
      where: { id: clinic.id },
      include: {
        locations: { where: { isActive: true } },
        services: { where: { active: true }, orderBy: { order: "asc" } },
      },
    });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    if (clinic.role !== "CLINIC_ADMIN") {
      return NextResponse.json({ error: "Solo el administrador puede cambiar la configuracion" }, { status: 403 });
    }
    const data = schema.partial().parse(await req.json());
    const updated = await prisma.clinic.update({
      where: { id: clinic.id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.commune !== undefined ? { commune: data.commune } : {}),
        ...(data.region !== undefined ? { region: data.region } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
      },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
