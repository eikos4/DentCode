"use client";
import { useMemo, useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays, ChevronLeft, ChevronRight, Plus, Clock, TrendingUp,
  CheckCircle2, AlertCircle, MessageCircle, AlertTriangle, Phone,
  X, MoreVertical, Filter,
} from "lucide-react";
import { NewAppointmentDialog } from "./new-appointment";
import { AppointmentActions } from "./appointment-actions";

export type Appt = {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string | null;
  hasAllergies: boolean;
  startAt: string;
  endAt: string;
  treatment: string | null;
  status: string;
  priceCLP: number | null;
  notes: string | null;
};
export type PatientLite = { id: string; fullName: string; phone: string | null };

type View = "day" | "week" | "month";

const HOUR_START = 7;
const HOUR_END = 22;
const HOUR_HEIGHT = 64; // px per hour (Day view)
const WEEK_HOUR_HEIGHT = 48;
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const MONTHS_FULL = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const STATUS_STYLE: Record<string, { label: string; bg: string; border: string; text: string; bar: string; dot: string }> = {
  SCHEDULED: { label: "Pendiente",  bg: "bg-amber-50",    border: "border-amber-300",    text: "text-amber-800",    bar: "bg-amber-400",    dot: "bg-amber-400" },
  CONFIRMED: { label: "Confirmada", bg: "bg-emerald-50",  border: "border-emerald-300",  text: "text-emerald-800",  bar: "bg-emerald-500",  dot: "bg-emerald-500" },
  COMPLETED: { label: "Atendida",   bg: "bg-blue-50",     border: "border-blue-300",     text: "text-blue-800",     bar: "bg-blue-500",     dot: "bg-blue-500" },
  CANCELLED: { label: "Cancelada",  bg: "bg-red-50",      border: "border-red-200",      text: "text-red-700",      bar: "bg-red-400",      dot: "bg-red-400" },
  NO_SHOW:   { label: "No-show",    bg: "bg-zinc-100",    border: "border-zinc-300",     text: "text-zinc-700",     bar: "bg-zinc-400",     dot: "bg-zinc-400" },
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
}
function fmtCLP(n: number | null) {
  if (n == null) return null;
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function startOfWeek(d: Date) {
  const x = new Date(d); x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export function AgendaClient({
  view, focusISO, appointments, patients, todayStats, nextAppt,
}: {
  view: View; focusISO: string;
  appointments: Appt[]; patients: PatientLite[];
  todayStats: { total: number; confirmed: number; pending: number; completed: number; revenue: number };
  nextAppt: { id: string; patientName: string; patientPhone: string | null; startAt: string; treatment: string | null } | null;
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const focus = useMemo(() => new Date(focusISO), [focusISO]);
  const [selected, setSelected] = useState<Appt | null>(null);
  const [prefillTime, setPrefillTime] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const navigate = (newView: View, date?: Date) => {
    const params = new URLSearchParams();
    params.set("view", newView);
    if (date) params.set("date", date.toISOString());
    start(() => router.push(`/agenda?${params.toString()}`));
  };
  const shift = (dir: 1 | -1) => {
    const d = new Date(focus);
    if (view === "day") d.setDate(d.getDate() + dir);
    else if (view === "week") d.setDate(d.getDate() + 7 * dir);
    else d.setMonth(d.getMonth() + dir);
    navigate(view, d);
  };

  const goToday = () => navigate(view, new Date());

  function openNew(time?: Date) {
    if (time) setPrefillTime(time.toISOString().slice(0, 16));
    else setPrefillTime(null);
    setNewOpen(true);
  }

  // Title for header
  const title = useMemo(() => {
    if (view === "day") {
      return focus.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }
    if (view === "week") {
      const ws = startOfWeek(focus);
      const we = new Date(ws); we.setDate(ws.getDate() + 6);
      const sameMonth = ws.getMonth() === we.getMonth();
      return sameMonth
        ? `${ws.getDate()} – ${we.getDate()} de ${MONTHS_FULL[ws.getMonth()]} ${we.getFullYear()}`
        : `${ws.getDate()} ${MONTHS_FULL[ws.getMonth()].slice(0, 3)} – ${we.getDate()} ${MONTHS_FULL[we.getMonth()].slice(0, 3)} ${we.getFullYear()}`;
    }
    return `${MONTHS_FULL[focus.getMonth()]} ${focus.getFullYear()}`;
  }, [view, focus]);

  return (
    <div className="p-3 md:p-6 max-w-[1500px] mx-auto">
      {/* Top bar */}
      <div className="flex items-start justify-between flex-wrap gap-3 mb-4 md:mb-5 anim-fade-up">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight capitalize truncate">{title}</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Agenda · {todayStats.total} citas hoy · <span className="text-emerald-700 font-medium">{todayStats.confirmed} confirmadas</span>
            {todayStats.pending > 0 && <> · <span className="text-amber-700 font-medium">{todayStats.pending} por confirmar</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => openNew()}
            className="px-2.5 md:px-3 py-2 text-xs md:text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Nueva cita</span><span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-5 anim-fade-up delay-100">
        <Kpi icon={Clock} label="Hoy" value={todayStats.total} accent="blue" />
        <Kpi icon={CheckCircle2} label="Confirmadas" value={todayStats.confirmed} accent="emerald" />
        <Kpi icon={AlertCircle} label="Por confirmar" value={todayStats.pending} accent="amber" />
        <Kpi icon={TrendingUp} label="Ingreso hoy" value={fmtCLP(todayStats.revenue) ?? "$0"} accent="blue" />
      </div>

      <div className="grid xl:grid-cols-[260px_1fr] gap-4 md:gap-5">
        {/* Sidebar */}
        <aside className="space-y-4 anim-fade-up delay-200">
          {/* View switcher */}
          <div className="p-1 rounded-lg border border-slate-200 bg-slate-50 flex gap-1">
            {(["day", "week", "month"] as View[]).map(v => (
              <button
                key={v}
                onClick={() => navigate(v, focus)}
                className={`flex-1 py-1.5 text-sm rounded-md font-medium transition ${
                  view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {v === "day" ? "Día" : v === "week" ? "Semana" : "Mes"}
              </button>
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-1">
            <button onClick={() => shift(-1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={goToday} className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-semibold">Hoy</button>
            <button onClick={() => shift(1)} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
          </div>

          {/* Mini calendar */}
          <MiniCalendar focus={focus} onPick={(d) => navigate(view === "month" ? "day" : view, d)} />

          {/* Próxima cita */}
          {nextAppt && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 text-white shadow-lg shadow-blue-500/20">
              <div className="text-xs uppercase tracking-wider opacity-80">Próxima cita</div>
              <div className="mt-1 text-lg font-bold leading-tight">{nextAppt.patientName}</div>
              <div className="text-sm opacity-90 mt-0.5">{nextAppt.treatment ?? "Consulta"}</div>
              <div className="mt-3 text-xs font-mono bg-white/10 rounded px-2 py-1 inline-block">
                {new Date(nextAppt.startAt).toLocaleString("es-CL", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </div>
              {nextAppt.patientPhone && (
                <a
                  href={`https://wa.me/${nextAppt.patientPhone.replace(/\D/g, "")}`}
                  target="_blank" rel="noreferrer"
                  className="mt-3 w-full flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg py-2 transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Enviar WhatsApp
                </a>
              )}
            </div>
          )}

          {/* Leyenda */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Estados</h3>
            <ul className="space-y-1.5 text-xs">
              {Object.entries(STATUS_STYLE).map(([k, s]) => (
                <li key={k} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${s.dot}`} />
                  <span>{s.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main view */}
        <div className="anim-fade-up delay-300">
          {view === "day" && <DayView focus={focus} appointments={appointments} onSlotClick={openNew} onApptClick={setSelected} />}
          {view === "week" && <WeekView focus={focus} appointments={appointments} onDayClick={(d) => navigate("day", d)} onApptClick={setSelected} onSlotClick={openNew} />}
          {view === "month" && <MonthView focus={focus} appointments={appointments} onDayClick={(d) => navigate("day", d)} />}
        </div>
      </div>

      {/* Detalle cita */}
      {selected && (
        <AppointmentPopover appt={selected} onClose={() => setSelected(null)} />
      )}

      {/* Dialog nueva cita (portal drawer interno) */}
      <NewAppointmentDialog
        patients={patients}
        externalOpen={newOpen}
        onExternalOpenChange={setNewOpen}
        prefillStartAt={prefillTime}
        hideButton
      />
    </div>
  );
}

/* ========== Day view ========== */
function DayView({
  focus, appointments, onSlotClick, onApptClick,
}: {
  focus: Date; appointments: Appt[];
  onSlotClick: (t: Date) => void;
  onApptClick: (a: Appt) => void;
}) {
  const dayAppts = useMemo(
    () => appointments.filter(a => isSameDay(new Date(a.startAt), focus)),
    [appointments, focus],
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();
  const isToday = isSameDay(now, focus);
  const nowTop = isToday ? minsFromHourStart(now) * (HOUR_HEIGHT / 60) : null;

  // autoscroll to 8am or current time
  useEffect(() => {
    if (!containerRef.current) return;
    const target = isToday && nowTop != null ? nowTop - 100 : (8 - HOUR_START) * HOUR_HEIGHT - 20;
    containerRef.current.scrollTop = Math.max(0, target);
  }, [focus.toDateString()]); // eslint-disable-line

  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 350 }}>
      {/* All-day / header */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold">
            {focus.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
          </span>
        </div>
        <span className="text-xs text-slate-500">{dayAppts.length} citas</span>
      </div>

      {/* Scrollable timeline */}
      <div ref={containerRef} className="flex-1 overflow-y-auto relative">
        <div className="grid grid-cols-[64px_1fr] relative" style={{ minHeight: (HOUR_END - HOUR_START + 1) * HOUR_HEIGHT }}>
          {/* Hour labels */}
          <div>
            {hours.map(h => (
              <div key={h} style={{ height: HOUR_HEIGHT }} className="text-[11px] text-slate-400 pr-2 text-right pt-0 border-b border-slate-100 font-mono">
                {String(h).padStart(2, "0")}:00
              </div>
            ))}
          </div>

          {/* Slots + appointments */}
          <div className="relative">
            {hours.map(h => (
              <div
                key={h}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-slate-100 relative cursor-pointer group hover:bg-blue-50/30"
                onClick={(e) => {
                  const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                  const y = e.clientY - rect.top;
                  const mins = Math.floor((y / HOUR_HEIGHT) * 60 / 15) * 15;
                  const t = new Date(focus);
                  t.setHours(h, mins, 0, 0);
                  onSlotClick(t);
                }}
              >
                {[15, 30, 45].map(m => (
                  <div key={m} style={{ top: (m / 60) * HOUR_HEIGHT }} className="absolute left-0 right-0 border-b border-dashed border-slate-50" />
                ))}
                <span className="absolute right-2 bottom-1 text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition">+ agendar</span>
              </div>
            ))}

            {/* Now line */}
            {isToday && nowTop != null && (
              <div
                style={{ top: nowTop }}
                className="absolute left-0 right-0 z-20 pointer-events-none"
              >
                <div className="flex items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1.5 shadow-md anim-pulse-glow" style={{ animationName: "pulseGlow" }} />
                  <span className="flex-1 h-[2px] bg-red-500" />
                  <span className="text-[10px] font-mono text-red-600 bg-white px-1 rounded border border-red-200 -mr-1">
                    {now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )}

            {/* Appointments */}
            {dayAppts.map((a) => {
              const s = new Date(a.startAt);
              const e = new Date(a.endAt);
              const top = minsFromHourStart(s) * (HOUR_HEIGHT / 60);
              const height = Math.max(30, ((e.getTime() - s.getTime()) / 60000) * (HOUR_HEIGHT / 60) - 2);
              const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.SCHEDULED;
              return (
                <div
                  key={a.id}
                  onClick={(ev) => { ev.stopPropagation(); onApptClick(a); }}
                  style={{ top, height }}
                  className={`absolute left-2 right-2 z-10 rounded-lg border-l-4 ${st.bar.replace("bg-", "border-l-")} ${st.bg} ${st.border} border p-2 cursor-pointer hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-mono ${st.text} opacity-80`}>{fmtTime(a.startAt)} – {fmtTime(a.endAt)}</div>
                      <div className="text-sm font-semibold truncate flex items-center gap-1">
                        {a.patientName}
                        {a.hasAllergies && <span title="Alergias"><AlertTriangle className="w-3 h-3 text-red-600 shrink-0" /></span>}
                      </div>
                      {height > 50 && a.treatment && (
                        <div className="text-xs text-slate-600 truncate">{a.treatment}</div>
                      )}
                    </div>
                    {height > 45 && a.priceCLP && (
                      <span className="text-xs font-semibold text-slate-700">{fmtCLP(a.priceCLP)}</span>
                    )}
                  </div>
                </div>
              );
            })}

            {dayAppts.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <CalendarDays className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Sin citas este día</p>
                  <p className="text-xs text-slate-400 mt-0.5">Click en un horario para agendar</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function minsFromHourStart(d: Date) {
  return (d.getHours() - HOUR_START) * 60 + d.getMinutes();
}

/* ========== Week view ========== */
function WeekView({
  focus, appointments, onDayClick, onApptClick, onSlotClick,
}: {
  focus: Date; appointments: Appt[];
  onDayClick: (d: Date) => void;
  onApptClick: (a: Appt) => void;
  onSlotClick: (t: Date) => void;
}) {
  const ws = startOfWeek(focus);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(ws); d.setDate(ws.getDate() + i); return d;
  });
  const now = new Date();
  const hours: number[] = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) hours.push(h);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: 400 }}>
      {/* Days header - scrollable on mobile */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="grid grid-cols-[48px_repeat(7,minmax(100px,1fr))] border-b border-slate-100 bg-slate-50/50 shrink-0 min-w-[600px]">
          <div />
          {days.map((d) => {
            const isToday = isSameDay(d, now);
            return (
              <button
                key={d.toISOString()}
                onClick={() => onDayClick(d)}
                className={`py-2.5 text-center border-l border-slate-100 hover:bg-white transition ${isToday ? "bg-blue-50" : ""}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}</div>
                <div className={`text-base font-bold ${isToday ? "text-blue-700" : "text-slate-900"}`}>{d.getDate()}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Body scroll */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[48px_repeat(7,minmax(100px,1fr))] relative min-w-[600px]" style={{ minHeight: (HOUR_END - HOUR_START + 1) * WEEK_HOUR_HEIGHT }}>
          {/* Hours column */}
          <div>
            {hours.map(h => (
              <div key={h} style={{ height: WEEK_HOUR_HEIGHT }} className="text-[10px] text-slate-400 pr-1.5 text-right border-b border-slate-100 font-mono">
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* 7 day columns */}
          {days.map((d) => {
            const dayAppts = appointments.filter(a => isSameDay(new Date(a.startAt), d));
            const isToday = isSameDay(d, now);
            const nowTop = isToday ? minsFromHourStart(now) * (WEEK_HOUR_HEIGHT / 60) : null;
            return (
              <div key={d.toISOString()} className="relative border-l border-slate-100">
                {hours.map(h => (
                  <div
                    key={h}
                    style={{ height: WEEK_HOUR_HEIGHT }}
                    className="border-b border-slate-100 hover:bg-blue-50/40 cursor-pointer"
                    onClick={(e) => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const y = e.clientY - rect.top;
                      const mins = Math.floor((y / WEEK_HOUR_HEIGHT) * 60 / 15) * 15;
                      const t = new Date(d); t.setHours(h, mins, 0, 0);
                      onSlotClick(t);
                    }}
                  />
                ))}

                {isToday && nowTop != null && (
                  <div style={{ top: nowTop }} className="absolute left-0 right-0 z-20 pointer-events-none">
                    <div className="h-[2px] bg-red-500" />
                  </div>
                )}

                {dayAppts.map((a) => {
                  const s = new Date(a.startAt); const e = new Date(a.endAt);
                  const top = minsFromHourStart(s) * (WEEK_HOUR_HEIGHT / 60);
                  const height = Math.max(22, ((e.getTime() - s.getTime()) / 60000) * (WEEK_HOUR_HEIGHT / 60) - 2);
                  const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.SCHEDULED;
                  return (
                    <div
                      key={a.id}
                      onClick={(ev) => { ev.stopPropagation(); onApptClick(a); }}
                      style={{ top, height }}
                      className={`absolute left-1 right-1 z-10 rounded-md border-l-2 ${st.bar.replace("bg-", "border-l-")} ${st.bg} ${st.border} border p-1 cursor-pointer hover:shadow-sm overflow-hidden`}
                    >
                      <div className={`text-[10px] font-mono ${st.text} opacity-80 leading-tight`}>{fmtTime(a.startAt)}</div>
                      <div className="text-[11px] font-semibold truncate leading-tight">{a.patientName}</div>
                      {height > 36 && a.treatment && <div className="text-[10px] text-slate-600 truncate leading-tight">{a.treatment}</div>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ========== Month view ========== */
function MonthView({
  focus, appointments, onDayClick,
}: {
  focus: Date; appointments: Appt[];
  onDayClick: (d: Date) => void;
}) {
  const monthStart = new Date(focus.getFullYear(), focus.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - ((gridStart.getDay() + 6) % 7));
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); cells.push(d);
  }
  const now = new Date();
  const byDay = new Map<string, Appt[]>();
  for (const a of appointments) {
    const d = new Date(a.startAt);
    const k = d.toDateString();
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(a);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
        {WEEKDAYS.map(w => (
          <div key={w} className="py-2 text-center text-[11px] uppercase tracking-wider text-slate-500 font-semibold">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {cells.map((d) => {
          const isCurMonth = d.getMonth() === focus.getMonth();
          const isToday = isSameDay(d, now);
          const list = byDay.get(d.toDateString()) ?? [];
          return (
            <button
              key={d.toISOString()}
              onClick={() => onDayClick(d)}
              className={`min-h-[60px] sm:min-h-[100px] p-1.5 sm:p-2 border-t border-l border-slate-100 text-left hover:bg-slate-50 transition flex flex-col ${
                !isCurMonth ? "bg-slate-50/40 opacity-60" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs sm:text-sm font-semibold w-5 h-5 sm:w-6 sm:h-6 grid place-items-center rounded-full ${
                    isToday ? "bg-blue-600 text-white" : "text-slate-700"
                  }`}
                >
                  {d.getDate()}
                </span>
                {list.length > 0 && (
                  <span className="text-[9px] sm:text-[10px] text-slate-500">{list.length}</span>
                )}
              </div>
              <div className="mt-0.5 sm:mt-1 space-y-0.5 flex-1 hidden sm:block">
                {list.slice(0, 3).map(a => {
                  const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.SCHEDULED;
                  return (
                    <div key={a.id} className={`text-[10px] px-1 py-0.5 rounded truncate ${st.bg} ${st.text} border ${st.border}`}>
                      <span className="font-mono opacity-70">{fmtTime(a.startAt)}</span> {a.patientName}
                    </div>
                  );
                })}
                {list.length > 3 && (
                  <div className="text-[10px] text-slate-500 px-1">+{list.length - 3} más</div>
                )}
              </div>
              {/* Mobile: dots indicator */}
              <div className="mt-0.5 flex gap-0.5 flex-wrap sm:hidden">
                {list.slice(0, 4).map((a, i) => {
                  const st = STATUS_STYLE[a.status] ?? STATUS_STYLE.SCHEDULED;
                  return <div key={i} className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />;
                })}
                {list.length > 4 && <span className="text-[8px] text-slate-400">+</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========== Mini calendar ========== */
function MiniCalendar({ focus, onPick }: { focus: Date; onPick: (d: Date) => void }) {
  const [month, setMonth] = useState(new Date(focus.getFullYear(), focus.getMonth(), 1));
  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(1 - ((gridStart.getDay() + 6) % 7));
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) { const d = new Date(gridStart); d.setDate(gridStart.getDate() + i); cells.push(d); }
  const now = new Date();

  return (
    <div className="p-3 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold capitalize">
          {MONTHS_FULL[month.getMonth()]} {month.getFullYear()}
        </span>
        <div className="flex items-center gap-0.5">
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="p-1 rounded hover:bg-slate-100"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="p-1 rounded hover:bg-slate-100"><ChevronRight className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-[10px] text-slate-400 mb-1">
        {WEEKDAYS.map(w => <div key={w} className="text-center">{w.charAt(0)}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map(d => {
          const isCur = d.getMonth() === month.getMonth();
          const isToday = isSameDay(d, now);
          const isFocus = isSameDay(d, focus);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onPick(d)}
              className={`h-7 text-xs rounded transition ${
                isFocus ? "bg-blue-600 text-white font-bold" :
                isToday ? "ring-1 ring-blue-400 text-blue-700 font-bold" :
                isCur ? "hover:bg-slate-100 text-slate-700" :
                "text-slate-300 hover:bg-slate-50"
              }`}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ========== KPI card ========== */
function Kpi({ icon: Icon, label, value, accent }: {
  icon: any; label: string; value: React.ReactNode;
  accent: "blue" | "emerald" | "amber";
}) {
  const palette: Record<string, { bg: string; text: string }> = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-700" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-700" },
  };
  const p = palette[accent];
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3">
      <span className={`w-10 h-10 rounded-lg grid place-items-center ${p.bg} ${p.text}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-lg font-bold truncate">{value}</div>
      </div>
    </div>
  );
}

/* ========== Popover detalle cita ========== */
function AppointmentPopover({ appt, onClose }: { appt: Appt; onClose: () => void }) {
  const st = STATUS_STYLE[appt.status] ?? STATUS_STYLE.SCHEDULED;
  const waUrl = appt.patientPhone ? `https://wa.me/${appt.patientPhone.replace(/\D/g, "")}` : null;

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []); // eslint-disable-line

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm anim-fade" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className={`p-5 border-b ${st.bg} ${st.border}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${st.bg} ${st.text} border ${st.border}`}>
              {st.label}
            </span>
            <button onClick={onClose} className="p-1 rounded hover:bg-white/60"><X className="w-4 h-4" /></button>
          </div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            {appt.patientName}
            {appt.hasAllergies && <AlertTriangle className="w-4 h-4 text-red-600" />}
          </h3>
          <p className="text-sm text-slate-600 mt-0.5">{appt.treatment ?? "Consulta"}</p>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <Row icon={Clock} label="Horario"
            value={`${new Date(appt.startAt).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })} · ${fmtTime(appt.startAt)} – ${fmtTime(appt.endAt)}`}
          />
          {appt.priceCLP && <Row icon={TrendingUp} label="Precio" value={fmtCLP(appt.priceCLP)!} />}
          {appt.patientPhone && <Row icon={Phone} label="Teléfono" value={appt.patientPhone} />}
          {appt.notes && <Row icon={MoreVertical} label="Notas" value={appt.notes} />}
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          <AppointmentActions id={appt.id} status={appt.status} phone={appt.patientPhone ?? ""} />
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer"
              className="px-3 py-1.5 text-xs rounded-md bg-emerald-600 text-white font-semibold hover:bg-emerald-700 flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-slate-500">{label}</div>
        <div className="text-sm text-slate-800">{value}</div>
      </div>
    </div>
  );
}
