"use client";

import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";
import { Calendar, Clock, AlertTriangle, Filter, Plus, Search, ChevronLeft, ChevronRight, User } from "lucide-react";
import Link from "next/link";

interface Dentist {
  id: string;
  fullName: string;
  specialty: string | null;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  treatment: string | null;
  status: string;
  priceCLP: number | null;
  dentist: { id: string; fullName: string; specialty: string | null };
  patient: { fullName: string; phone: string | null };
}

export const dynamic = "force-dynamic";

export default function ClinicSchedulePage() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDentist, setSelectedDentist] = useState<string>("all");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [dateRange, setDateRange] = useState(30); // días a mostrar

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dRes, aRes] = await Promise.all([
        fetch("/api/clinic/dentists"),
        fetch(`/api/clinic/appointments?days=${dateRange}`),
      ]);
      
      if (dRes.ok) {
        const dData = await dRes.json();
        setDentists(dData.dentists || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAppointments(aData.appointments || []);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filtrar citas por dentista seleccionado
  const filteredAppointments = selectedDentist === "all" 
    ? appointments 
    : appointments.filter(a => a.dentist.id === selectedDentist);

  // Agrupar citas por fecha
  const appointmentsByDate = filteredAppointments.reduce((acc, apt) => {
    const date = new Date(apt.startAt).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  // Calendario mensual
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay(); // 0 = domingo

  // Navegación del calendario
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Generar días del calendario
  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) calendarDays.push(null); // espacios vacíos
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Verificar si un día tiene citas
  const getDayAppointments = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return appointmentsByDate[dateStr] || [];
  };

  const today = new Date().toISOString().split("T")[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Agenda de Citas
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {filteredAppointments.length} citas próximas · {dentists.length} dentistas
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          {/* Filtro por dentista */}
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">Todos los dentistas</option>
            {dentists.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>

          {/* Selector de vista */}
          <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === "calendar" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm font-medium transition ${
                viewMode === "list" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
              }`}
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/clinic/schedule/new"
            className="flex-1 sm:flex-initial justify-center px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nueva cita
          </Link>
        </div>
      </div>

      {/* Calendario Mensual */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {/* Navegación del calendario */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-lg">
              {currentDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Cabecera días */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Grid de días */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              
              const dayApps = getDayAppointments(day);
              const hasAppointments = dayApps.length > 0;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isToday = dateStr === today;
              
              return (
                <div
                  key={day}
                  className={`aspect-square p-2 rounded-lg border transition cursor-pointer hover:border-blue-300 ${
                    isToday ? "bg-blue-50 border-blue-200" : "border-slate-100 hover:bg-slate-50"
                  }`}
                >
                  <div className={`text-sm font-medium ${isToday ? "text-blue-700" : "text-slate-700"}`}>
                    {day}
                  </div>
                  {hasAppointments && (
                    <div className="mt-1 space-y-1">
                      {selectedDentist === "all" ? (
                        // Mostrar indicadores por dentista
                        <div className="flex flex-wrap gap-1">
                          {dayApps.slice(0, 4).map((apt, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 rounded-full ${
                                apt.status === "CONFIRMED" ? "bg-emerald-500" :
                                apt.status === "COMPLETED" ? "bg-sky-500" :
                                apt.status === "CANCELLED" ? "bg-red-400" :
                                "bg-amber-400"
                              }`}
                              title={`${apt.patient.fullName} - ${apt.dentist.fullName}`}
                            />
                          ))}
                          {dayApps.length > 4 && (
                            <span className="text-[10px] text-slate-500">+{dayApps.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        // Mostrar lista de citas del dentista filtrado
                        dayApps.slice(0, 2).map((apt, i) => (
                          <div key={i} className="text-[10px] truncate text-slate-600">
                            {new Date(apt.startAt).getHours()}:00 {apt.patient.fullName.split(" ")[0]}
                          </div>
                        ))
                      )}
                      <div className="text-[10px] font-medium text-slate-500">
                        {dayApps.length} cita{dayApps.length > 1 ? "s" : ""}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Confirmada</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Pendiente</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500" /> Completada</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Cancelada</span>
          </div>
        </div>
      )}

      {/* Vista de Lista por Fecha */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {Object.entries(appointmentsByDate).length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="font-medium text-slate-900 mb-2">Sin citas programadas</h3>
              <p className="text-sm text-slate-500 mb-6">
                No hay citas en el período seleccionado
              </p>
              <Link
                href="/clinic/schedule/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" /> Programar cita
              </Link>
            </div>
          ) : (
            Object.entries(appointmentsByDate)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dayAppointments]) => {
                const dateObj = new Date(date);
                const isToday = date === today;
                const isPast = dateObj < new Date(today);
                
                return (
                  <div key={date} className={`bg-white rounded-2xl border ${isToday ? "border-blue-300" : "border-slate-200"}`}>
                    <div className={`p-4 border-b ${isToday ? "bg-blue-50 border-blue-100" : "border-slate-100"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`text-center min-w-[50px] ${isToday ? "text-blue-700" : "text-slate-700"}`}>
                          <div className="text-2xl font-bold">{dateObj.getDate()}</div>
                          <div className="text-xs uppercase">{dateObj.toLocaleDateString("es-CL", { month: "short" })}</div>
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold ${isToday ? "text-blue-900" : "text-slate-900"}`}>
                            {isToday ? "Hoy" : dateObj.toLocaleDateString("es-CL", { weekday: "long" })}
                          </h3>
                          <p className="text-sm text-slate-500">{dayAppointments.length} citas</p>
                        </div>
                        {isToday && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded-full">
                            HOY
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {dayAppointments.map((appt) => {
                        const start = new Date(appt.startAt);
                        const end = new Date(appt.endAt);
                        const now = new Date();
                        const isNow = start <= now && end >= now && isToday;
                        
                        return (
                          <div
                            key={appt.id}
                            className={`p-4 flex items-center gap-4 transition hover:bg-slate-50 ${
                              isNow ? "bg-blue-50/50" : ""
                            }`}
                          >
                            <div className="text-center min-w-[56px]">
                              <div className="font-mono text-sm font-semibold">{formatTime(start)}</div>
                              <div className="text-[10px] text-slate-400">{formatTime(end)}</div>
                            </div>
                            
                            <div className="w-1 h-10 rounded-full">
                              <span className={`block w-full h-full rounded-full ${
                                appt.status === "COMPLETED" ? "bg-sky-500" :
                                appt.status === "CONFIRMED" ? "bg-emerald-500" :
                                appt.status === "CANCELLED" ? "bg-red-400" :
                                appt.status === "NO_SHOW" ? "bg-zinc-400" :
                                "bg-amber-400"
                              }`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                <p className="font-medium truncate">{appt.patient.fullName}</p>
                                {isNow && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-600 text-white font-semibold">AHORA</span>}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                <span className="font-medium text-slate-700">{appt.dentist.fullName}</span>
                                <span>·</span>
                                <span>{appt.treatment ?? "Consulta"}</span>
                                {appt.priceCLP && <span>· ${appt.priceCLP.toLocaleString("es-CL")}</span>}
                              </div>
                            </div>

                            <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                              appt.status === "COMPLETED" ? "bg-sky-50 text-sky-700" :
                              appt.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700" :
                              appt.status === "CANCELLED" ? "bg-red-50 text-red-700" :
                              appt.status === "NO_SHOW" ? "bg-zinc-100 text-zinc-700" :
                              "bg-amber-50 text-amber-700"
                            }`}>
                              {appt.status === "SCHEDULED" ? "Pendiente" :
                               appt.status === "CONFIRMED" ? "Confirmada" :
                               appt.status === "COMPLETED" ? "Atendida" :
                               appt.status === "CANCELLED" ? "Cancelada" :
                               appt.status === "NO_SHOW" ? "No-show" : appt.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

    </div>
  );
}
