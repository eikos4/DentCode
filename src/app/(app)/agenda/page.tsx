import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/utils";
import { AgendaClient, type Appt, type PatientLite } from "./agenda-client";

export const dynamic = "force-dynamic";

function parseDate(s?: string) {
  if (!s) return new Date();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date() : d;
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { view?: "day" | "week" | "month"; date?: string };
}) {
  const dentistId = await getCurrentDentistId();
  const view = (searchParams.view ?? "week") as "day" | "week" | "month";
  const focus = parseDate(searchParams.date);

  // Compute range based on view
  let rangeStart: Date;
  let rangeEnd: Date;
  if (view === "day") {
    rangeStart = new Date(focus); rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(rangeStart); rangeEnd.setDate(rangeEnd.getDate() + 1);
  } else if (view === "week") {
    rangeStart = new Date(focus); rangeStart.setHours(0, 0, 0, 0);
    rangeStart.setDate(rangeStart.getDate() - ((rangeStart.getDay() + 6) % 7));
    rangeEnd = new Date(rangeStart); rangeEnd.setDate(rangeEnd.getDate() + 7);
  } else {
    rangeStart = new Date(focus.getFullYear(), focus.getMonth(), 1);
    rangeStart.setDate(1 - ((rangeStart.getDay() + 6) % 7));
    rangeStart.setHours(0, 0, 0, 0);
    rangeEnd = new Date(rangeStart); rangeEnd.setDate(rangeEnd.getDate() + 42);
  }

  const [appts, patients, nextAppt, todayStats] = await Promise.all([
    prisma.appointment.findMany({
      where: { dentistId, startAt: { gte: rangeStart, lt: rangeEnd } },
      include: { patient: { select: { id: true, fullName: true, phone: true, allergies: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.patient.findMany({
      where: { dentistId },
      select: { id: true, fullName: true, phone: true },
      orderBy: { fullName: "asc" },
      take: 500,
    }),
    prisma.appointment.findFirst({
      where: { dentistId, startAt: { gte: new Date() } },
      include: { patient: { select: { fullName: true, phone: true } } },
      orderBy: { startAt: "asc" },
    }),
    (async () => {
      const now = new Date();
      const start = new Date(now); start.setHours(0, 0, 0, 0);
      const end = new Date(now); end.setHours(23, 59, 59, 999);
      const today = await prisma.appointment.findMany({
        where: { dentistId, startAt: { gte: start, lte: end } },
        select: { status: true, priceCLP: true },
      });
      return {
        total: today.length,
        confirmed: today.filter(a => a.status === "CONFIRMED").length,
        pending: today.filter(a => a.status === "SCHEDULED").length,
        completed: today.filter(a => a.status === "COMPLETED").length,
        revenue: today.filter(a => a.status === "COMPLETED").reduce((s, a) => s + (a.priceCLP ?? 0), 0),
      };
    })(),
  ]);

  const serialized: Appt[] = appts.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    patientName: a.patient.fullName,
    patientPhone: a.patient.phone,
    hasAllergies: !!a.patient.allergies,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    treatment: a.treatment,
    status: a.status,
    priceCLP: a.priceCLP,
    notes: a.notes,
  }));

  const serializedPatients: PatientLite[] = patients.map((p) => ({
    id: p.id, fullName: p.fullName, phone: p.phone,
  }));

  return (
    <AgendaClient
      view={view}
      focusISO={focus.toISOString()}
      appointments={serialized}
      patients={serializedPatients}
      todayStats={todayStats}
      nextAppt={
        nextAppt
          ? {
              id: nextAppt.id,
              patientName: nextAppt.patient.fullName,
              patientPhone: nextAppt.patient.phone,
              startAt: nextAppt.startAt.toISOString(),
              treatment: nextAppt.treatment,
            }
          : null
      }
    />
  );
}
