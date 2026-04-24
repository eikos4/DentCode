import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getDentistFromAuth } from "../../../../../lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().nullable().optional(),
  commune: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
});

async function assertOwner(id: string) {
  const dentist = await getDentistFromAuth();
  const l = await prisma.clinicLocation.findUnique({ where: { id } });
  if (!l || l.dentistId !== dentist.id) return null;
  return { dentist, location: l };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  const data = schema.parse(await req.json());
  const updated = await prisma.clinicLocation.update({ where: { id }, data });
  return NextResponse.json({ success: true, location: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });
  await prisma.clinicLocation.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
