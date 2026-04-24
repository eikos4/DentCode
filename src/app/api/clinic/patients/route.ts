import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClinicFromAuth } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2),
  rut: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  commune: z.string().optional(),
  occupation: z.string().optional(),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
  dentistId: z.string(),
});

export async function GET(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const dentistId = searchParams.get("dentistId");
    const patients = await prisma.patient.findMany({
      where: {
        clinicId: clinic.id,
        ...(dentistId ? { dentistId } : {}),
        ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { rut: { contains: q } }] } : {}),
      },
      include: { dentist: { select: { fullName: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(patients);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clinic = await getClinicFromAuth();
    const data = schema.parse(await req.json());
    const patient = await prisma.patient.create({
      data: {
        clinicId: clinic.id,
        dentistId: data.dentistId,
        fullName: data.fullName,
        rut: data.rut || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender || null,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        city: data.city || null,
        commune: data.commune || null,
        occupation: data.occupation || null,
        bloodType: data.bloodType || null,
        allergies: data.allergies || null,
        medicalHistory: data.medicalHistory || null,
        medications: data.medications || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(patient, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
