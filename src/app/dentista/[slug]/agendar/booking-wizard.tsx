"use client";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, Stethoscope, Calendar as CalIcon, User, AlertCircle, PartyPopper } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  priceCLP: number | null;
}

interface Location {
  id: string;
  name: string;
  address: string | null;
  commune: string | null;
  city: string | null;
}

interface Props {
  slug: string;
  services: Service[];
  preselectedServiceId?: string;
  locations: Location[];
}

type Step = 1 | 2 | 3 | 4;

const MONTHS_ES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS_SHORT = ["D", "L", "M", "M", "J", "V", "S"];

function formatCLP(n: number | null) {
  if (n === null) return "Consultar";
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}

function toDateStr(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function BookingWizard({ slug, services, preselectedServiceId }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string>(preselectedServiceId || services[0]?.id || "");
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<{ iso: string; time: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedIso, setSelectedIso] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+56 9 ");
  const [email, setEmail] = useState("");
  const [rut, setRut] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successAppt, setSuccessAppt] = useState<{ id: string; startAt: string } | null>(null);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [serviceId, services],
  );

  // Cargar slots al elegir fecha
  useEffect(() => {
    if (!selectedDate || !selectedService) return;
    setLoadingSlots(true);
    setSlots([]);
    setSelectedIso(null);
    const dateStr = toDateStr(selectedDate);
    fetch(
      `/api/public/availability?slug=${encodeURIComponent(slug)}&date=${dateStr}&duration=${selectedService.durationMin}`,
    )
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, selectedService, slug]);

  const canGoNext = () => {
    if (step === 1) return !!serviceId;
    if (step === 2) return !!selectedIso;
    if (step === 3) return fullName.trim().length >= 2 && phone.replace(/\D/g, "").length >= 8;
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedService || !selectedIso) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          serviceId: selectedService.id,
          startIso: selectedIso,
          durationMin: selectedService.durationMin,
          patient: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            email: email.trim(),
            rut: rut.trim(),
            notes: notes.trim(),
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessAppt({ id: data.appointmentId, startAt: data.startAt });
        setStep(4);
      } else {
        setError(data.message || "Error al agendar. Intenta nuevamente.");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  // === RENDER ===
  if (step === 4 && successAppt) {
    const date = new Date(successAppt.startAt);
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-4">
          <PartyPopper className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Cita confirmada!</h2>
        <p className="text-slate-600 mb-6">
          Te esperamos el{" "}
          <span className="font-semibold">
            {date.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
          </span>{" "}
          a las{" "}
          <span className="font-semibold">
            {date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </p>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left text-sm mb-6">
          <p className="font-semibold text-blue-900 mb-1">Próximos pasos:</p>
          <ul className="text-blue-800 space-y-1">
            <li>• Recibirás un recordatorio por WhatsApp un día antes</li>
            <li>• Llega 10 min antes de tu cita</li>
            <li>• Si necesitas cancelar, avísanos con al menos 24h de anticipación</li>
          </ul>
        </div>
        <a
          href={`/dentista/${slug}`}
          className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition"
        >
          Volver al perfil
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Stepper */}
      <div className="border-b border-slate-200 p-4 bg-slate-50">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <StepPill n={1} label="Servicio" icon={Stethoscope} active={step === 1} done={step > 1} />
          <div className="flex-1 h-0.5 bg-slate-200 mx-2"><div className={`h-full bg-blue-600 transition-all ${step > 1 ? "w-full" : "w-0"}`} /></div>
          <StepPill n={2} label="Fecha" icon={CalIcon} active={step === 2} done={step > 2} />
          <div className="flex-1 h-0.5 bg-slate-200 mx-2"><div className={`h-full bg-blue-600 transition-all ${step > 2 ? "w-full" : "w-0"}`} /></div>
          <StepPill n={3} label="Datos" icon={User} active={step === 3} done={step > 3} />
        </div>
      </div>

      <div className="p-6">
        {/* STEP 1: SERVICIO */}
        {step === 1 && (
          <div>
            <h2 className="font-semibold text-slate-900 mb-1">¿Qué necesitas?</h2>
            <p className="text-sm text-slate-500 mb-4">Elige el tipo de consulta o tratamiento.</p>

            {services.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
                Este profesional aún no tiene servicios publicados. Intenta contactarlo directamente.
              </div>
            ) : (
              <div className="space-y-2">
                {services.map((s) => {
                  const sel = s.id === serviceId;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setServiceId(s.id)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition ${
                        sel
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900">{s.name}</p>
                          {s.description && (
                            <p className="text-sm text-slate-500 mt-0.5">{s.description}</p>
                          )}
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {s.durationMin} min
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-slate-900">{formatCLP(s.priceCLP)}</p>
                          {sel && <CheckCircle2 className="w-5 h-5 text-blue-600 ml-auto mt-1" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: FECHA + HORA */}
        {step === 2 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-slate-900 mb-1">Elige una fecha</h2>
              <p className="text-sm text-slate-500 mb-4">
                {selectedService?.name} · {selectedService?.durationMin} min
              </p>
              <Calendar
                year={viewMonth.year}
                month={viewMonth.month}
                selected={selectedDate}
                onSelect={setSelectedDate}
                onPrev={() => {
                  const m = viewMonth.month - 1;
                  setViewMonth(m < 0 ? { year: viewMonth.year - 1, month: 11 } : { year: viewMonth.year, month: m });
                }}
                onNext={() => {
                  const m = viewMonth.month + 1;
                  setViewMonth(m > 11 ? { year: viewMonth.year + 1, month: 0 } : { year: viewMonth.year, month: m });
                }}
              />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 mb-1">
                {selectedDate ? "Horarios disponibles" : "Selecciona una fecha"}
              </h2>
              <p className="text-sm text-slate-500 mb-4">
                {selectedDate
                  ? selectedDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
                  : "Primero elige un día en el calendario"}
              </p>

              {selectedDate && (
                <>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-12 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Buscando horarios...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
                      No hay horas disponibles este día. Elige otra fecha.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((s) => (
                        <button
                          key={s.iso}
                          type="button"
                          onClick={() => setSelectedIso(s.iso)}
                          className={`px-3 py-2 rounded-lg border text-sm font-medium transition ${
                            selectedIso === s.iso
                              ? "border-blue-600 bg-blue-600 text-white"
                              : "border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {s.time}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: DATOS PACIENTE */}
        {step === 3 && selectedIso && selectedService && (
          <div className="max-w-xl mx-auto">
            <h2 className="font-semibold text-slate-900 mb-1">Tus datos</h2>
            <p className="text-sm text-slate-500 mb-4">
              Para confirmar tu cita necesitamos algunos datos básicos.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-sm text-blue-900">
              <b>{selectedService.name}</b> ·{" "}
              {new Date(selectedIso).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}{" "}
              a las{" "}
              {new Date(selectedIso).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
            </div>

            <div className="space-y-3">
              <Field label="Nombre completo *">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Ej: María González"
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Teléfono *">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="+56 9 1234 5678"
                  />
                </Field>
                <Field label="RUT (opcional)">
                  <input
                    type="text"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="12.345.678-9"
                  />
                </Field>
              </div>

              <Field label="Email (opcional)">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="tu@email.com"
                />
              </Field>

              <Field label="Motivo de consulta (opcional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="Cuéntale al dentista qué te pasa o qué necesitas..."
                />
              </Field>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <p className="text-xs text-slate-500 mt-4">
              Al confirmar aceptas recibir recordatorios de tu cita. Tus datos están protegidos según la Ley 19.628.
            </p>
          </div>
        )}

        {/* Botones */}
        {step < 4 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => step > 1 && setStep((step - 1) as Step)}
              disabled={step === 1}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={() => canGoNext() && setStep((step + 1) as Step)}
                disabled={!canGoNext()}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canGoNext() || submitting}
                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Confirmar cita
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepPill({ n, label, icon: Icon, active, done }: { n: number; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean; done: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full grid place-items-center text-xs font-semibold transition ${
          done
            ? "bg-blue-600 text-white"
            : active
            ? "bg-blue-600 text-white ring-4 ring-blue-100"
            : "bg-slate-200 text-slate-500"
        }`}
      >
        {done ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      </div>
      <span className={`text-xs font-medium hidden sm:inline ${active || done ? "text-slate-900" : "text-slate-500"}`}>
        {label}
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-700 mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Calendar({
  year, month, selected, onSelect, onPrev, onNext,
}: {
  year: number; month: number;
  selected: Date | null;
  onSelect: (d: Date) => void;
  onPrev: () => void; onNext: () => void;
}) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay.getDay();
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isToday = new Date();
  const canPrev = !(year === isToday.getFullYear() && month === isToday.getMonth());

  return (
    <div className="border border-slate-200 rounded-xl p-3">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!canPrev}
          className="p-1 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <p className="font-semibold text-slate-900 text-sm">
          {MONTHS_ES[month]} {year}
        </p>
        <button type="button" onClick={onNext} className="p-1 hover:bg-slate-100 rounded">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_SHORT.map((d, i) => (
          <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const isPast = d < today;
          const isSel = selected && toDateStr(selected) === toDateStr(d);
          const isTodayCell = toDateStr(d) === toDateStr(today);
          return (
            <button
              key={i}
              type="button"
              onClick={() => !isPast && onSelect(d)}
              disabled={isPast}
              className={`aspect-square rounded-lg text-sm transition relative ${
                isPast
                  ? "text-slate-300 cursor-not-allowed"
                  : isSel
                  ? "bg-blue-600 text-white font-semibold"
                  : "hover:bg-blue-50 text-slate-700"
              }`}
            >
              {d.getDate()}
              {isTodayCell && !isSel && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
