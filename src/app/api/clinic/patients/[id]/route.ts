import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../../lib/prisma";
import { getClinicFromAuth } from "../../../../../lib/auth";

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
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  medications: z.string().optional(),
  notes: z.string().optional(),
  dentistId: z.string().optional(),
});

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const clinic = await getClinicFromAuth();
    const patient = await prisma.patient.findFirst({
      where: { id: params.id, clinicId: clinic.id },
      include: {
        dentist: { select: { fullName: true, specialty: true } },
        appointments: { orderBy: { startAt: "desc" }, include: { dentist: { select: { fullName: true } } } },
        clinicalNotes: { orderBy: { date: "desc" } },
        toothRecords: true,
        recalls: { orderBy: { dueDate: "asc" } },
        attachments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!patient) return NextResponse.json({ error: "Paciente no encontrado" }, { status: 404 });
    return NextResponse.json(patient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const clinic = await getClinicFromAuth();
    const existing = await prisma.patient.findFirst({ where: { id: params.id, clinicId: clinic.id } });
    if (!existing) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
    const data = schema.partial().parse(await req.json());
    const patient = await prisma.patient.update({
      where: { id: params.id },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.rut !== undefined ? { rut: data.rut } : {}),
        ...(data.birthDate !== undefined ? { birthDate: data.birthDate ? new Date(data.birthDate) : null } : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.email !== undefined ? { email: data.email } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.commune !== undefined ? { commune: data.commune } : {}),
        ...(data.bloodType !== undefined ? { bloodType: data.bloodType } : {}),
        ...(data.allergies !== undefined ? { allergies: data.allergies } : {}),
        ...(data.medicalHistory !== undefined ? { medicalHistory: data.medicalHistory } : {}),
        ...(data.medications !== undefined ? { medications: data.medications } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
        ...(data.dentistId ? { dentistId: data.dentistId } : {}),
      },
    });
    return NextResponse.json(patient);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
