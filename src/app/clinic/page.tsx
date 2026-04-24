import { redirect } from "next/navigation";
import { getClinicFromAuth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { Users, Calendar, Building2, FlaskConical, TrendingUp, Clock } from "lucide-react";

export default async function ClinicDashboardPage() {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [totalPatients, totalDentists, todayAppointments, pendingUploads] = await Promise.all([
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.dentist.count({ where: { clinicId: clinic.id, isActive: true } }),
    prisma.appointment.findMany({
      where: { clinicId: clinic.id, startAt: { gte: startOfDay, lte: endOfDay } },
      include: { patient: { select: { fullName: true } }, dentist: { select: { fullName: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.labUpload.count({ where: { isMatched: false } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{clinic.name}</h1>
        <p className="text-gray-500 text-sm">Panel de administracion</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pacientes", value: totalPatients, icon: Users, href: "/clinic/pacientes" },
          { label: "Dentistas", value: totalDentists, icon: Building2, href: "/clinic/dentistas" },
          { label: "Citas hoy", value: todayAppointments.length, icon: Calendar, href: "/clinic/schedule" },
          { label: "Uploads pendientes", value: pendingUploads, icon: FlaskConical, href: "/clinic/lab-uploads" },
        ].map((kpi) => (
          <Link key={kpi.label} href={kpi.href} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
            <kpi.icon className="w-5 h-5 text-gray-400 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Citas de hoy</h2>
          <Link href="/clinic/schedule" className="text-sm text-blue-600 hover:underline">Ver agenda</Link>
        </div>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No hay citas para hoy</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm text-gray-900">{a.patient.fullName}</p>
                  <p className="text-xs text-gray-500">{a.dentist.fullName} · {a.treatment || "Consulta"}</p>
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {a.startAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
