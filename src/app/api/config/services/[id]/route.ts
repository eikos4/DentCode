import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistFromAuth } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  durationMin: z.number().int().min(5).max(480).optional(),
  priceCLP: z.number().int().min(0).nullable().optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

async function assertOwner(id: string) {
  const dentist = await getDentistFromAuth();
  const s = await prisma.serviceOffering.findUnique({ where: { id } });
  if (!s || s.dentistId !== dentist.id) return null;
  return { dentist, service: s };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  const data = patchSchema.parse(await req.json());
  const updated = await prisma.serviceOffering.update({
    where: { id },
    data,
  });
  return NextResponse.json({ success: true, service: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  await prisma.serviceOffering.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
