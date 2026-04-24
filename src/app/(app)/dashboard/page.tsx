import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Users, MessageCircle, Star, TrendingUp, Clock } from "lucide-react";
import { formatCLP, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  const [totalPatients, todayAppointments, pendingRecalls, recentReviews] = await Promise.all([
    prisma.patient.count({ where: { dentistId: user.dentistId } }),
    prisma.appointment.findMany({
      where: { dentistId: user.dentistId, startAt: { gte: startOfDay, lte: endOfDay } },
      include: { patient: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.recall.count({ where: { patient: { dentistId: user.dentistId }, dueDate: { lte: today }, doneAt: null } }),
    prisma.review.findMany({ where: { dentistId: user.dentistId, published: true }, orderBy: { date: "desc" }, take: 3 }),
  ]);

  const avgRating = recentReviews.length > 0
    ? (recentReviews.reduce((acc, r) => acc + r.rating, 0) / recentReviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">{today.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pacientes", value: totalPatients, icon: Users, color: "blue" },
          { label: "Citas hoy", value: todayAppointments.length, icon: Calendar, color: "green" },
          { label: "Recalls pendientes", value: pendingRecalls, icon: Clock, color: "orange" },
          { label: "Valoracion media", value: avgRating ? `${avgRating} ★` : "—", icon: Star, color: "yellow" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <kpi.icon className="w-5 h-5 text-gray-400 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
            <div className="text-xs text-gray-500 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Citas de hoy */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">Citas de hoy</h2>
          <Link href="/agenda" className="text-sm text-blue-600 hover:underline">Ver agenda</Link>
        </div>
        {todayAppointments.length === 0 ? (
          <p className="text-gray-400 text-sm py-4 text-center">No hay citas para hoy</p>
        ) : (
          <div className="space-y-2">
            {todayAppointments.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm text-gray-900">{a.patient.fullName}</p>
                  <p className="text-xs text-gray-500">{a.treatment || "Consulta"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    {a.startAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    a.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    a.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{a.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
