import { getClinicFromAuth } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { ArrowLeft, Mail, Phone, Calendar, Users, Clock, Stethoscope, TrendingUp, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ResetPasswordButton } from "../../../../components/reset-password-button";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function DentistProfilePage({ params }: PageProps) {
  const clinic = await getClinicFromAuth();
  const { id } = params;

  // Obtener dentista con toda su información
  const dentist = await prisma.dentist.findFirst({
    where: { id, clinicId: clinic.id, isActive: true },
    include: {
      _count: {
        select: { patients: true, appointments: true }
      },
      appointments: {
        where: { startAt: { gte: new Date() }, status: { not: "CANCELLED" } },
        orderBy: { startAt: "asc" },
        take: 5,
        include: {
          patient: { select: { fullName: true, phone: true } }
        }
      },
      patients: {
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, fullName: true, phone: true, createdAt: true }
      }
    }
  });

  if (!dentist) {
    notFound();
  }

  // Estadísticas del dentista
  const totalAppointments = dentist._count.appointments;
  const totalPatients = dentist._count.patients;
  const upcomingAppointments = dentist.appointments.length;

  // Citas completadas este mes
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  
  const completedThisMonth = await prisma.appointment.count({
    where: {
      dentistId: id,
      clinicId: clinic.id,
      status: "COMPLETED",
      startAt: { gte: startOfMonth }
    }
  });

  const initials = dentist.fullName.split(" ").map(s => s[0]).slice(0, 2).join("");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic/dentistas"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Perfil del Dentista
          </h1>
          <p className="text-sm text-slate-600">Información y actividad profesional</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 text-white grid place-items-center text-3xl font-bold">
              {initials}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{dentist.fullName}</h2>
                <p className="text-slate-600 flex items-center gap-2 mt-1">
                  <Stethoscope className="w-4 h-4" />
                  {dentist.specialty || "Odontólogo general"}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" /> {dentist.email}
                  </span>
                  {dentist.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" /> {dentist.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`mailto:${dentist.email}`}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
                {dentist.phone && (
                  <a
                    href={`https://wa.me/${dentist.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> WhatsApp
                  </a>
                )}
                {clinic.role === "CLINIC_ADMIN" && (
                  <ResetPasswordButton dentistId={dentist.id} dentistName={dentist.fullName} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Pacientes totales</p>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Citas totales</p>
          <p className="text-2xl font-bold">{totalAppointments}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Clock className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Próximas citas</p>
          <p className="text-2xl font-bold">{upcomingAppointments}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Atendidos este mes</p>
          <p className="text-2xl font-bold">{completedThisMonth}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Próximas Citas
            </h3>
          </div>
          
          {dentist.appointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sin citas programadas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dentist.appointments.map((apt) => {
                const date = new Date(apt.startAt);
                return (
                  <div key={apt.id} className="p-4 flex items-center gap-4">
                    <div className="text-center min-w-[56px]">
                      <div className="text-sm font-bold text-blue-600">
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-slate-500 uppercase">
                        {date.toLocaleDateString("es-CL", { month: "short" })}
                      </div>
                    </div>
                    <div className="w-1 h-10 rounded-full bg-gradient-to-b from-blue-500 to-sky-400" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate">
                        {apt.patient.fullName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {apt.treatment || "Consulta"} · {date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                      apt.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700" :
                      apt.status === "SCHEDULED" ? "bg-amber-50 text-amber-700" :
                      "bg-slate-50 text-slate-700"
                    }`}>
                      {apt.status === "CONFIRMED" ? "Confirmada" :
                       apt.status === "SCHEDULED" ? "Pendiente" : apt.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pacientes Recientes */}
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              Pacientes Recientes
            </h3>
          </div>
          
          {dentist.patients.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500">Sin pacientes registrados</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {dentist.patients.map((patient) => (
                <div key={patient.id} className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white grid place-items-center text-sm font-bold flex-shrink-0">
                    {patient.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">
                      {patient.fullName}
                    </p>
                    {patient.phone && (
                      <p className="text-xs text-slate-500">{patient.phone}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(patient.createdAt).toLocaleDateString("es-CL")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
