import { redirect } from "next/navigation";
import { getAuthUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { PatientsClient, type EnrichedPatient } from "./patients-client";

export default async function PacientesPage({ searchParams }: { searchParams: { q?: string; filter?: string; sort?: string } }) {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const patients = await prisma.patient.findMany({
    where: { dentistId: user.dentistId },
    include: {
      appointments: {
        where: { status: { in: ["COMPLETED", "CONFIRMED", "SCHEDULED"] } },
        orderBy: { startAt: "asc" },
        select: { startAt: true, status: true, treatment: true, priceCLP: true },
      },
      recalls: {
        where: { doneAt: null, dueDate: { lt: now } },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const dentist = await prisma.dentist.findUnique({
    where: { id: user.dentistId },
    select: { fullName: true },
  });

  const enriched: EnrichedPatient[] = patients.map((p) => {
    const completed = p.appointments.filter((a) => a.status === "COMPLETED");
    const upcoming = p.appointments.filter((a) => a.status !== "COMPLETED" && new Date(a.startAt) > now);
    const lastVisit = completed.length > 0 ? completed[completed.length - 1].startAt : null;
    const nextAppt = upcoming.length > 0 ? upcoming[0] : null;
    const totalSpent = completed.reduce((acc, a) => acc + (a.priceCLP ?? 0), 0);
    const birthDate = p.birthDate ? p.birthDate.toISOString() : null;
    const birthdayThisMonth = birthDate
      ? new Date(birthDate).getMonth() === now.getMonth()
      : false;

    return {
      id: p.id,
      fullName: p.fullName,
      rut: p.rut,
      phone: p.phone,
      email: p.email,
      allergies: p.allergies,
      birthDate,
      createdAt: p.createdAt.toISOString(),
      nextAppointmentAt: nextAppt ? nextAppt.startAt.toISOString() : null,
      nextAppointmentTreatment: nextAppt?.treatment ?? null,
      lastVisitAt: lastVisit ? lastVisit.toISOString() : null,
      totalSpent,
      visits: completed.length,
      overdueRecalls: p.recalls.length,
      hasAllergies: !!(p.allergies && p.allergies.trim()),
      hasPhone: !!p.phone,
      isInactive: lastVisit ? new Date(lastVisit) < sixMonthsAgo : false,
      isNewThisMonth: p.createdAt >= startOfMonth,
      birthdayThisMonth,
    };
  });

  const counters = {
    total: enriched.length,
    newThisMonth: enriched.filter((p) => p.isNewThisMonth).length,
    noPhone: enriched.filter((p) => !p.hasPhone).length,
    allergies: enriched.filter((p) => p.hasAllergies).length,
    overdueRecalls: enriched.filter((p) => p.overdueRecalls > 0).length,
    inactive: enriched.filter((p) => p.isInactive).length,
    birthdayMonth: enriched.filter((p) => p.birthdayThisMonth).length,
  };

  return (
    <PatientsClient
      patients={enriched}
      counters={counters}
      dentistName={dentist?.fullName ?? ""}
      initialQuery={searchParams.q ?? ""}
      initialFilter={searchParams.filter ?? "all"}
      initialSort={searchParams.sort ?? "name"}
    />
  );
}
