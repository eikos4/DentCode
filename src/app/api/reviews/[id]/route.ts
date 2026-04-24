import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDentistFromAuth } from "@/lib/auth";
import { z } from "zod";

async function assertOwner(id: string) {
  const dentist = await getDentistFromAuth();
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review || review.dentistId !== dentist.id) return null;
  return { dentist, review };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const schema = z.object({ published: z.boolean() });
  const { published } = schema.parse(body);

  const updated = await prisma.review.update({
    where: { id },
    data: { published },
  });
  return NextResponse.json({ success: true, review: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const ctx = await assertOwner(id);
  if (!ctx) return NextResponse.json({ message: "No autorizado" }, { status: 403 });

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
