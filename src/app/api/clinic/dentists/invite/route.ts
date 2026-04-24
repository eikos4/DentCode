import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../../lib/auth";
import bcrypt from "bcryptjs";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  rut: z.string().optional(),
  message: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    if (clinic.role !== "CLINIC_ADMIN") {
      return NextResponse.json({ error: "Solo el administrador puede invitar dentistas" }, { status: 403 });
    }
    const data = schema.parse(await req.json());
    const existing = await prisma.dentist.findUnique({ where: { email: data.email } });
    if (existing) {
      if (existing.clinicId) {
        return NextResponse.json({ error: "Este dentista ya pertenece a una clinica" }, { status: 409 });
      }
      const updated = await prisma.dentist.update({
        where: { id: existing.id },
        data: { clinicId: clinic.id },
      });
      return NextResponse.json({ ok: true, dentist: updated, isExisting: true });
    }
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const dentist = await prisma.dentist.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        specialty: data.specialty,
        phone: data.phone,
        rut: data.rut,
        passwordHash,
        clinicId: clinic.id,
        isActive: true,
        plan: "dentist",
        verificationStatus: "verified",
        onboardingCompleted: true,
      },
    });
    return NextResponse.json({ ok: true, dentist, tempPassword, isExisting: false }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
