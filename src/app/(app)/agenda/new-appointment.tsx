"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  CalendarPlus, X, User, Clock, Stethoscope, DollarSign, MessageCircle,
  Loader2, Check, Search,
} from "lucide-react";

type Patient = { id: string; fullName: string; phone?: string | null };

const COMMON_TREATMENTS = [
  { label: "Limpieza", duration: 30, price: 35000 },
  { label: "Control", duration: 20, price: 20000 },
  { label: "Consulta inicial", duration: 45, price: 30000 },
  { label: "Obturación", duration: 45, price: 55000 },
  { label: "Endodoncia", duration: 90, price: 180000 },
  { label: "Extracción", duration: 45, price: 60000 },
  { label: "Ortodoncia (control)", duration: 30, price: 35000 },
  { label: "Blanqueamiento", duration: 60, price: 120000 },
];

export function NewAppointmentDialog({
  patients,
  externalOpen,
  onExternalOpenChange,
  prefillStartAt,
  hideButton = false,
}: {
  patients: Patient[];
  externalOpen?: boolean;
  onExternalOpenChange?: (v: boolean) => void;
  prefillStartAt?: string | null;
  hideButton?: boolean;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const open = externalOpen ?? internalOpen;
  const setOpen = (v: boolean) => {
    if (onExternalOpenChange) onExternalOpenChange(v);
    else setInternalOpen(v);
  };

  const [patientQuery, setPatientQuery] = useState("");
  const [patientId, setPatientId] = useState("");
  const [startAt, setStartAt] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [treatment, setTreatment] = useState("");
  const [priceCLP, setPriceCLP] = useState<string>("");
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Apply prefill when opening
  useEffect(() => {
    if (open && prefillStartAt) setStartAt(prefillStartAt);
  }, [open, prefillStartAt]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setPatientQuery(""); setPatientId(""); setStartAt(prefillStartAt ?? "");
        setDurationMin(30); setTreatment(""); setPriceCLP(""); setNotifyWhatsApp(true);
      }, 250);
    }
  }, [open]); // eslint-disable-line

  // Body scroll lock + Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, [open]); // eslint-disable-line

  const filteredPatients = patientQuery
    ? patients.filter(p => p.fullName.toLowerCase().includes(patientQuery.toLowerCase())).slice(0, 6)
    : [];

  const selectedPatient = patients.find(p => p.id === patientId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!patientId || !startAt) { alert("Completa paciente y fecha"); return; }
    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientId, startAt, durationMin,
        treatment: treatment || null,
        priceCLP: priceCLP ? Number(priceCLP) : null,
        notifyWhatsApp,
      }),
    });
    setLoading(false);
    if (res.ok) { setOpen(false); router.refresh(); }
    else alert("Error al crear la cita");
  }

  const drawer = open && (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm anim-fade" onClick={() => setOpen(false)} />

      <form
        onSubmit={submit}
        className="absolute top-0 right-0 h-full w-full sm:w-[560px] max-w-full bg-white shadow-2xl flex flex-col anim-slide-right"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-white grid place-items-center shadow-lg shadow-blue-500/25 shrink-0">
            <CalendarPlus className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">Nueva cita</h2>
            <p className="text-xs text-slate-500">Agenda una hora para tu paciente</p>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-5">
          {/* Paciente */}
          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" /> Paciente
            </label>
            {selectedPatient ? (
              <div className="flex items-center justify-between p-3 rounded-lg border-2 border-blue-200 bg-blue-50/50">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center text-sm font-bold">
                    {selectedPatient.fullName.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{selectedPatient.fullName}</div>
                    {selectedPatient.phone && <div className="text-xs text-slate-500 truncate">{selectedPatient.phone}</div>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { setPatientId(""); setPatientQuery(""); }}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >Cambiar</button>
              </div>
            ) : (
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                {filteredPatients.length > 0 && (
                  <div className="mt-1 rounded-lg border border-slate-200 bg-white shadow-sm divide-y divide-slate-100">
                    {filteredPatients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => { setPatientId(p.id); setPatientQuery(""); }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center gap-2"
                      >
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-[10px] font-bold">
                          {p.fullName.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <span className="truncate flex-1">{p.fullName}</span>
                        {p.phone && <span className="text-xs text-slate-500">{p.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {patientQuery && filteredPatients.length === 0 && (
                  <p className="mt-2 text-xs text-slate-500">Sin resultados. Crea el paciente primero desde la lista.</p>
                )}
              </div>
            )}
          </div>

          {/* Fecha + Duración */}
          <div className="grid grid-cols-[1fr_120px] gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" /> Fecha y hora
              </label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Duración</label>
              <div className="relative">
                <input
                  type="number" min={10} step={5}
                  value={durationMin}
                  onChange={(e) => setDurationMin(Number(e.target.value) || 30)}
                  className="w-full px-3 pr-10 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">min</span>
              </div>
            </div>
          </div>

          {/* Tratamientos comunes */}
          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-slate-400" /> Tratamiento
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
              {COMMON_TREATMENTS.map(t => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => { setTreatment(t.label); setDurationMin(t.duration); setPriceCLP(String(t.price)); }}
                  className={`text-[11px] px-2 py-1.5 rounded-md border transition ${
                    treatment === t.label ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >{t.label}</button>
              ))}
            </div>
            <input
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="O escribe uno personalizado..."
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Precio */}
          <div>
            <label className="text-sm font-medium block mb-1.5 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-slate-400" /> Precio
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
              <input
                type="number" min={0} step={1000}
                value={priceCLP}
                onChange={(e) => setPriceCLP(e.target.value)}
                placeholder="35000"
                className="w-full pl-7 pr-14 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">CLP</span>
            </div>
          </div>

          {/* WhatsApp toggle */}
          <label className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition ${
            notifyWhatsApp ? "border-blue-300 bg-blue-50/50" : "border-slate-200 bg-white"
          }`}>
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => setNotifyWhatsApp(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-blue-600"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                Enviar confirmación por WhatsApp
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Se enviará un mensaje automático al paciente con los detalles de la cita.
              </div>
            </div>
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || !patientId || !startAt}
            className="px-5 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Check className="w-4 h-4" /> Crear cita</>}
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {!hideButton && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center gap-1.5"
        >
          <CalendarPlus className="w-4 h-4" /> Nueva cita
        </button>
      )}
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
