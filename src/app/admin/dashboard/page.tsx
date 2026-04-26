import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Shield,
  AlertCircle,
  CheckCircle2,
  Clock,
  ChevronRight,
  Activity,
  MessageSquare,
} from "lucide-react";

export default async function AdminDashboardPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/login");
  }

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

  // Estadísticas globales
  const [
    totalDentists,
    totalClinics,
    totalPatients,
    totalAppointments,
    monthAppointments,
    pendingVerifications,
    trialEndingSoon,
    recentDentists,
    unreadMessages,
  ] = await Promise.all([
    prisma.dentist.count(),
    prisma.clinic.count(),
    prisma.patient.count(),
    prisma.appointment.count(),
    prisma.appointment.count({
      where: { startAt: { gte: startOfMonth, lte: endOfMonth } },
    }),
    prisma.dentist.count({ where: { verificationStatus: "pending" } }),
    prisma.dentist.count({
      where: {
        plan: "trial",
        createdAt: { lt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.dentist.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        email: true,
        plan: true,
        verificationStatus: true,
        createdAt: true,
      },
    }),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                Online
              </span>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Cerrar sesión
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs Globales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard
            icon={Users}
            label="Total Dentistas"
            value={totalDentists}
            color="blue"
          />
          <KPICard
            icon={Building2}
            label="Clínicas"
            value={totalClinics}
            color="emerald"
          />
          <KPICard
            icon={Users}
            label="Pacientes"
            value={totalPatients}
            color="purple"
          />
          <KPICard
            icon={Calendar}
            label="Citas este mes"
            value={monthAppointments}
            color="orange"
          />
        </div>

        {/* Alertas */}
        {(pendingVerifications > 0 || trialEndingSoon > 0 || unreadMessages > 0) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {unreadMessages > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">
                    {unreadMessages} mensajes nuevos
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Recibidos en la página principal
                  </p>
                  <Link
                    href="/admin/messages"
                    className="inline-flex items-center gap-1 text-sm text-blue-800 font-medium mt-2 hover:underline"
                  >
                    Leer mensajes <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
            {pendingVerifications > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">
                    {pendingVerifications} verificaciones pendientes
                  </p>
                  <p className="text-sm text-amber-700 mt-1">
                    Dentistas esperando verificación manual
                  </p>
                  <Link
                    href="/admin/verifications"
                    className="inline-flex items-center gap-1 text-sm text-amber-800 font-medium mt-2 hover:underline"
                  >
                    Verificar ahora <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
            {trialEndingSoon > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    {trialEndingSoon} trials por vencer
                  </p>
                  <p className="text-sm text-red-700 mt-1">
                    Dentistas que necesitan conversión a plan pago
                  </p>
                  <Link
                    href="/admin/dentists?filter=trial-ending"
                    className="inline-flex items-center gap-1 text-sm text-red-800 font-medium mt-2 hover:underline"
                  >
                    Ver detalles <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layout 2 columnas */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Gráficos y accesos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen mensual */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Actividad del mes</h2>
                <span className="text-sm text-gray-500">
                  {today.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-700">{monthAppointments}</p>
                  <p className="text-sm text-blue-600">Nuevas citas</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-3xl font-bold text-emerald-700">{recentDentists.length}</p>
                  <p className="text-sm text-emerald-600">Nuevos dentistas</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-700">{pendingVerifications}</p>
                  <p className="text-sm text-purple-600">Por verificar</p>
                </div>
              </div>
            </div>

            {/* Accesos rápidos */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Gestión rápida</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <QuickLink
                  href="/admin/dentists"
                  icon={Users}
                  label="Todos los dentistas"
                  description="Ver y gestionar dentistas"
                  color="blue"
                />
                <QuickLink
                  href="/admin/clinics"
                  icon={Building2}
                  label="Clínicas"
                  description="Ver clínicas registradas"
                  color="emerald"
                />
                <QuickLink
                  href="/admin/verifications"
                  icon={Shield}
                  label="Verificaciones"
                  description={`${pendingVerifications} pendientes`}
                  color="amber"
                />
                <QuickLink
                  href="/admin/analytics"
                  icon={TrendingUp}
                  label="Analytics"
                  description="Estadísticas avanzadas"
                  color="purple"
                />
                <QuickLink
                  href="/admin/messages"
                  icon={MessageSquare}
                  label="Mensajes"
                  description={`${unreadMessages} sin leer`}
                  color="blue"
                />
              </div>
            </div>
          </div>

          {/* Columna derecha - Últimos dentistas */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Últimos registros</h2>
                <p className="text-sm text-gray-500">Dentistas nuevos</p>
              </div>
              <div className="divide-y divide-gray-100">
                {recentDentists.map((dentist) => (
                  <div
                    key={dentist.id}
                    className="p-4 hover:bg-gray-50 transition flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-sm font-bold">
                        {dentist.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{dentist.fullName}</p>
                        <p className="text-xs text-gray-500">{dentist.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          dentist.verificationStatus === "verified"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {dentist.verificationStatus === "verified" ? "Verificado" : "Pendiente"}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {dentist.plan === "trial" ? "Trial" : dentist.plan}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <Link
                  href="/admin/dentists"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1"
                >
                  Ver todos <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Estado del sistema */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold">Estado del sistema</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Base de datos</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Activa
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">API</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Operativa
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Total citas</span>
                  <span className="font-semibold">{totalAppointments.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componentes auxiliares

function KPICard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: "blue" | "emerald" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  description,
  color,
}: {
  href: string;
  icon: any;
  label: string;
  description: string;
  color: "blue" | "emerald" | "amber" | "purple";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-100",
  };

  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition group"
    >
      <div className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center transition`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}
