import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  Users, Calendar, Building2, FlaskConical, TrendingUp, 
  Clock, DollarSign, CheckCircle2, AlertCircle, ArrowUpRight,
  Plus, Search, UserPlus
} from "lucide-react";

export default async function ClinicDashboardPage() {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  const today = new Date();
  const startOfDay = new Date(today); startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today); endOfDay.setHours(23, 59, 59, 999);

  // Datos para KPIs
  const [totalPatients, totalDentists, todayAppointments, pendingUploads, monthAppointments] = await Promise.all([
    prisma.patient.count({ where: { clinicId: clinic.id } }),
    prisma.dentist.count({ where: { clinicId: clinic.id, isActive: true } }),
    prisma.appointment.findMany({
      where: { clinicId: clinic.id, startAt: { gte: startOfDay, lte: endOfDay } },
      include: { patient: { select: { fullName: true } }, dentist: { select: { fullName: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.labUpload.count({ where: { isMatched: false } }),
    prisma.appointment.findMany({
      where: { 
        clinicId: clinic.id, 
        startAt: { gte: new Date(today.getFullYear(), today.getMonth(), 1) } 
      },
      select: { priceCLP: true, status: true }
    })
  ]);

  const monthlyRevenue = monthAppointments.reduce((acc, a) => acc + (a.priceCLP || 0), 0);
  const confirmationRate = monthAppointments.length > 0 
    ? Math.round((monthAppointments.filter(a => a.status === "CONFIRMED" || a.status === "COMPLETED").length / monthAppointments.length) * 100)
    : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Saludo y Acciones Rápidas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Panel de {clinic.name}
          </h1>
          <p className="text-slate-500 font-medium">Visualización estratégica de tu operación clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/clinic/schedule/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95">
            <Plus className="w-4 h-4" />
            Nueva Cita
          </Link>
          <Link href="/clinic/dentistas/invite" className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition active:scale-95">
            <UserPlus className="w-4 h-4" />
            Invitar
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Pacientes Totales" 
          value={totalPatients} 
          icon={Users} 
          color="blue" 
          trend="+12% este mes"
        />
        <KPICard 
          title="Ingresos Mensuales" 
          value={`$${(monthlyRevenue / 1000).toFixed(1)}k`} 
          icon={DollarSign} 
          color="emerald" 
          trend="+8.4% vs mes anterior"
        />
        <KPICard 
          title="Tasa Confirmación" 
          value={`${confirmationRate}%`} 
          icon={CheckCircle2} 
          color="indigo" 
          trend="Estable"
        />
        <KPICard 
          title="Citas Hoy" 
          value={todayAppointments.length} 
          icon={Calendar} 
          color="amber" 
          trend={`${todayAppointments.length} pendientes`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Simulado de Actividad */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Flujo de Citas</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Últimos 7 días</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Atendidas</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-200" /> Canceladas</span>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {[45, 62, 58, 85, 72, 95, 68].map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <div className="relative w-full flex flex-col items-center justify-end h-full group">
                  <div className="absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                    {val} citas
                  </div>
                  <div 
                    className="w-full max-w-[40px] bg-blue-500 rounded-t-xl transition-all duration-500 hover:bg-blue-600 cursor-pointer" 
                    style={{ height: `${val}%` }} 
                  />
                  <div 
                    className="w-full max-w-[40px] bg-slate-100 rounded-b-lg h-[15%]" 
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Día {i + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Citas de Hoy - Lateral */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Agenda de Hoy</h3>
            <Link href="/clinic/schedule" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
              Ver Completa
            </Link>
          </div>
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
            {todayAppointments.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm font-semibold text-slate-400">No hay citas para hoy</p>
              </div>
            ) : (
              todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50 hover:bg-white hover:shadow-md transition cursor-pointer group">
                  <div className="text-center shrink-0">
                    <p className="text-xs font-black text-slate-900">
                      {a.startAt.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="w-1 h-1 bg-blue-500 rounded-full mx-auto mt-1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition">{a.patient.fullName}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase truncate mt-0.5">{a.dentist.fullName}</p>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
                </div>
              ))
            )}
          </div>
          <div className="p-4 bg-slate-50 rounded-b-3xl">
            <div className="flex items-center justify-between text-xs font-bold px-2">
              <span className="text-slate-500">Pendientes</span>
              <span className="text-blue-600">{todayAppointments.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color, trend }: { title: string; value: any; icon: any; color: string; trend: string }) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    indigo: "bg-indigo-50 text-indigo-600",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center shadow-inner transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-slate-900 tracking-tight">{value}</div>
        <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {trend}
        </div>
      </div>
    </div>
  );
}
