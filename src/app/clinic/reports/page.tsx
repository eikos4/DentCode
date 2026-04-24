import { redirect } from "next/navigation";
import { getClinicFromAuth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { formatCLP } from "../../../lib/utils";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";

export default async function ClinicReportsPage() {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sixMonthsAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

  const [monthAppointments, totalPatients, dentistStats] = await Promise.all([
    prisma.appointment.findMany({
      where: { clinicId: clinic.id, startAt: { gte: startOfMonth }, status: "COMPLETED" },
      select: { priceCLP: true, dentistId: true },
    }),
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.dentist.findMany({
      where: { clinicId: clinic.id, isActive: true },
      include: {
        _count: { select: { patients: true, appointments: true } },
      },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const monthRevenue = monthAppointments.reduce((acc, a) => acc + (a.priceCLP ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm">Estadisticas del mes actual</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          { label: "Ingresos del mes", value: formatCLP(monthRevenue), icon: DollarSign },
          { label: "Citas completadas", value: monthAppointments.length, icon: Calendar },
          { label: "Total pacientes", value: totalPatients, icon: Users },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <kpi.icon className="w-5 h-5 text-gray-400 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Dentistas activos</h2>
        <div className="space-y-3">
          {dentistStats.map((d) => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
              <div>
                <p className="font-medium text-sm text-gray-900">{d.fullName}</p>
                <p className="text-xs text-gray-500">{d.specialty || "General"}</p>
              </div>
              <div className="text-right text-xs text-gray-500">
                <p>{d._count.patients} pacientes</p>
                <p>{d._count.appointments} citas</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
