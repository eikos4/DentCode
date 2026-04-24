import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";
import { PatientTabs } from "./patient-tabs";
import { Phone, Mail, IdCard, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

function age(birth: Date | null) {
  if (!birth) return null;
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default async function PatientDetail({ params }: { params: { id: string } }) {
  const dentistId = await getCurrentDentistId();
  const patient = await prisma.patient.findFirst({
    where: { id: params.id, dentistId },
    include: {
      appointments: { orderBy: { startAt: "desc" }, take: 100 },
      clinicalNotes: { orderBy: { date: "desc" } },
      toothRecords: true,
      attachments: { orderBy: { createdAt: "desc" } },
      recalls: { orderBy: { dueDate: "asc" } },
    },
  });
  if (!patient) notFound();

  const y = age(patient.birthDate);
  const overdue = patient.recalls.filter(r => !r.doneAt && r.dueDate < new Date()).length;
  const totalSpent = patient.appointments
    .filter(a => a.status === "COMPLETED")
    .reduce((s, a) => s + (a.priceCLP ?? 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <a href="/pacientes" className="text-sm text-muted-foreground hover:underline">← Pacientes</a>

      <div className="p-5 rounded-xl border bg-white flex flex-wrap items-start gap-5">
        <div className="w-14 h-14 rounded-full bg-primary/10 text-primary grid place-items-center text-xl font-bold">
          {patient.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
        </div>
        <div className="flex-1 min-w-[240px]">
          <h1 className="text-2xl font-bold">{patient.fullName}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
            {patient.rut && <span className="flex items-center gap-1"><IdCard className="w-4 h-4" /> {patient.rut}</span>}
            {y != null && <span>{y} años</span>}
            {patient.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {patient.phone}</span>}
            {patient.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {patient.email}</span>}
          </div>
          {patient.allergies && (
            <div className="mt-2 inline-flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
              <AlertTriangle className="w-3.5 h-3.5" /> Alergias: {patient.allergies}
            </div>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Visitas</div>
            <div className="text-xl font-bold">{patient.appointments.length}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Controles vencidos</div>
            <div className={`text-xl font-bold ${overdue > 0 ? "text-red-600" : ""}`}>{overdue}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Gastado</div>
            <div className="text-xl font-bold">${totalSpent.toLocaleString("es-CL")}</div>
          </div>
        </div>
      </div>

      <PatientTabs
        patient={{
          id: patient.id,
          fullName: patient.fullName,
          rut: patient.rut,
          birthDate: patient.birthDate ? patient.birthDate.toISOString() : null,
          phone: patient.phone,
          email: patient.email,
          address: patient.address,
          allergies: patient.allergies,
          medicalHistory: patient.medicalHistory,
          notes: patient.notes,
        }}
        appointments={patient.appointments.map(a => ({
          id: a.id, startAt: a.startAt.toISOString(), endAt: a.endAt.toISOString(),
          treatment: a.treatment, status: a.status, priceCLP: a.priceCLP,
        }))}
        notes={patient.clinicalNotes.map(n => ({
          id: n.id, date: n.date.toISOString(),
          subjective: n.subjective, objective: n.objective,
          assessment: n.assessment, plan: n.plan,
        }))}
        attachments={patient.attachments.map(a => ({
          id: a.id, category: a.category, subtype: a.subtype, url: a.url,
          filename: a.filename, mime: a.mime, sizeBytes: a.sizeBytes,
          note: a.note, takenAt: a.takenAt ? a.takenAt.toISOString() : null,
          createdAt: a.createdAt.toISOString(),
        }))}
        recalls={patient.recalls.map(r => ({
          id: r.id, type: r.type, dueDate: r.dueDate.toISOString(),
          notes: r.notes, doneAt: r.doneAt ? r.doneAt.toISOString() : null,
          createdAt: r.createdAt.toISOString(),
        }))}
        toothRecords={patient.toothRecords.map(r => ({ toothCode: r.toothCode, condition: r.condition }))}
      />
    </div>
  );
}
