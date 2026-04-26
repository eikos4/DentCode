import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Calendar,
  Users,
  Clock,
  Star,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Plus,
  Bell,
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Sparkles,
  Target,
  Activity,
} from "lucide-react";
import { formatCLP, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  const [
    totalPatients,
    newPatientsThisMonth,
    todayAppointments,
    pendingRecalls,
    recentReviews,
    upcomingAppointments,
    monthStats,
  ] = await Promise.all([
    prisma.patient.count({ where: { dentistId: user.dentistId } }),
    prisma.patient.count({ where: { dentistId: user.dentistId, createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
    prisma.appointment.findMany({
      where: { dentistId: user.dentistId, startAt: { gte: startOfDay, lte: endOfDay } },
      include: { patient: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.recall.count({ where: { patient: { dentistId: user.dentistId }, dueDate: { lte: today }, doneAt: null } }),
    prisma.review.findMany({ where: { dentistId: user.dentistId, published: true }, orderBy: { date: "desc" }, take: 5 }),
    prisma.appointment.findMany({
      where: { dentistId: user.dentistId, startAt: { gt: endOfDay } },
      include: { patient: true },
      orderBy: { startAt: "asc" },
      take: 3,
    }),
    prisma.appointment.aggregate({
      where: { dentistId: user.dentistId, startAt: { gte: startOfMonth, lte: endOfMonth }, status: "COMPLETED" },
      _count: { id: true },
      _sum: { priceCLP: true },
    }),
  ]);

  const avgRating = recentReviews.length > 0
    ? (recentReviews.reduce((acc, r) => acc + r.rating, 0) / recentReviews.length).toFixed(1)
    : null;

  const monthRevenue = monthStats._sum.priceCLP || 0;
  const monthCompleted = monthStats._count.id || 0;

  const hour = today.getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 18 ? "Buenas tardes" : "Buenas noches";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Profesional */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {greeting}, {user.fullName?.split(" ")[0] || "Doctor"} 👋
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200">
              Verificado
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            {today.toLocaleDateString("es-CL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/agenda?nueva=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nueva cita
          </Link>
          <Link
            href="/pacientes?nuevo=true"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Users className="w-4 h-4" />
            Nuevo paciente
          </Link>
        </div>
      </div>

      {/* KPIs Profesionales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total pacientes"
          value={totalPatients}
          trend={{ value: newPatientsThisMonth, label: "este mes" }}
          icon={Users}
          color="blue"
        />
        <KPICard
          label="Citas hoy"
          value={todayAppointments.length}
          trend={{ value: todayAppointments.filter(a => a.status === "CONFIRMED").length, label: "confirmadas" }}
          icon={Calendar}
          color="emerald"
        />
        <KPICard
          label="Recalls pendientes"
          value={pendingRecalls}
          trend={{ value: pendingRecalls > 5 ? -2 : 0, label: "vs semana pasada", isNegative: pendingRecalls > 5 }}
          icon={Clock}
          color="amber"
        />
        <KPICard
          label="Valoración"
          value={avgRating ? `${avgRating}/5` : "N/A"}
          trend={{ value: recentReviews.length, label: "reseñas" }}
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Layout 2 columnas */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Citas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Citas de hoy */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Citas de hoy</h2>
                  <p className="text-xs text-gray-500">{todayAppointments.length} programadas</p>
                </div>
              </div>
              <Link
                href="/agenda"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todo
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">Sin citas para hoy</p>
                <p className="text-xs text-gray-400 mt-1">Aprovecha para organizar tu agenda</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {todayAppointments.map((a, i) => (
                  <AppointmentRow key={a.id} appointment={a} index={i} />
                ))}
              </div>
            )}
          </div>

          {/* Próximas citas */}
          {upcomingAppointments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Próximas citas</h2>
                    <p className="text-xs text-gray-500">{upcomingAppointments.length} próximos días</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {upcomingAppointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center">
                        <p className="text-xs text-gray-400 uppercase">{a.startAt.toLocaleDateString("es-CL", { weekday: "short" })}</p>
                        <p className="text-lg font-bold text-gray-900">{a.startAt.getDate()}</p>
                      </div>
                      <div className="w-px h-10 bg-gray-200" />
                      <div>
                        <p className="font-medium text-gray-900">{a.patient.fullName}</p>
                        <p className="text-sm text-gray-500">{a.treatment || "Consulta"}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {a.startAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Estadísticas y acciones */}
        <div className="space-y-6">
          {/* Estadísticas del mes */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-200" />
              <h3 className="font-semibold">Resumen del mes</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold">{formatCLP(monthRevenue)}</p>
                <p className="text-sm text-blue-200">Ingresos estimados</p>
              </div>
              <div className="pt-4 border-t border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">{monthCompleted}</p>
                    <p className="text-xs text-blue-200">Citas completadas</p>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{newPatientsThisMonth}</p>
                    <p className="text-xs text-blue-200">Pacientes nuevos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Accesos rápidos</h3>
            <div className="space-y-2">
              <QuickLink href="/agenda" icon={Calendar} label="Agenda completa" color="blue" />
              <QuickLink href="/pacientes" icon={Users} label="Lista de pacientes" color="emerald" />
              <QuickLink href="/configuracion" icon={Activity} label="Configuración" color="purple" />
            </div>
          </div>

          {/* Recordatorios */}
          {pendingRecalls > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="font-medium text-amber-900">{pendingRecalls} recalls pendientes</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Pacientes que necesitan seguimiento de control.
                  </p>
                  <Link href="/pacientes?filter=recall" className="inline-flex items-center gap-1 text-sm text-amber-800 font-medium mt-2 hover:underline">
                    Ver pacientes <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Reseñas recientes */}
          {recentReviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Últimas reseñas</h3>
              <div className="space-y-3">
                {recentReviews.slice(0, 2).map((review) => (
                  <div key={review.id} className="border-l-2 border-yellow-400 pl-3">
                    <div className="flex items-center gap-1 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{review.comment || "Sin comentario"}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {review.patientName} · {formatDate(review.date)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares

function KPICard({
  label,
  value,
  trend,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  trend: { value: number; label: string; isNegative?: boolean };
  icon: any;
  color: "blue" | "emerald" | "amber" | "yellow";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend.isNegative ? (
          <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
            <ArrowDownRight className="w-3 h-3" />
            {Math.abs(trend.value)}
          </div>
        ) : trend.value > 0 ? (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <ArrowUpRight className="w-3 h-3" />
            {trend.value}
          </div>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        {trend.label && <p className="text-[10px] text-gray-400 mt-1">{trend.label}</p>}
      </div>
    </div>
  );
}

function AppointmentRow({ appointment: a, index }: { appointment: any; index: number }) {
  const statusConfig = {
    COMPLETED: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", icon: CheckCircle2, label: "Completada" },
    CONFIRMED: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: CheckCircle2, label: "Confirmada" },
    SCHEDULED: { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600", icon: Clock, label: "Pendiente" },
    CANCELLED: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: AlertCircle, label: "Cancelada" },
  };

  const status = statusConfig[a.status as keyof typeof statusConfig] || statusConfig.SCHEDULED;
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition group">
      <div className="flex items-center gap-4">
        <div className="w-14 text-center">
          <p className="text-lg font-bold text-gray-900">
            {a.startAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </p>
          <p className="text-xs text-gray-400">
            {a.endAt ? `-${a.endAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}` : "60 min"}
          </p>
        </div>
        <div className="w-px h-12 bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-sm font-bold">
            {a.patient.fullName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{a.patient.fullName}</p>
            <p className="text-sm text-gray-500">{a.treatment || "Consulta general"}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} border ${status.border}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {status.label}
        </span>
        <Link
          href={`/pacientes/${a.patient.id}`}
          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 opacity-0 group-hover:opacity-100 transition"
        >
          <MoreHorizontal className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  color: "blue" | "emerald" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
    >
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center transition`}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="flex-1 font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400" />
    </Link>
  );
}
