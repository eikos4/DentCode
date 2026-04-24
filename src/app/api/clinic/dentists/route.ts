import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClinicFromAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

const schema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  specialty: z.string().optional(),
  phone: z.string().optional(),
  rut: z.string().optional(),
});

export async function GET() {
  try {
    const clinic = await getClinicFromAuth();
    const dentists = await prisma.dentist.findMany({
      where: { clinicId: clinic.id },
      include: {
        _count: { select: { patients: true, appointments: true } },
      },
      orderBy: { fullName: "asc" },
    });
    return NextResponse.json(dentists);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    if (clinic.role !== "CLINIC_ADMIN") {
      return NextResponse.json({ error: "Solo el administrador puede agregar dentistas" }, { status: 403 });
    }
    const data = schema.parse(await req.json());
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
    return NextResponse.json({ ...dentist, tempPassword }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
