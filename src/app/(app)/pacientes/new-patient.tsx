"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  UserPlus, X, ArrowLeft, ArrowRight, Check, User, Phone, Mail,
  MapPin, Cake, IdCard, AlertTriangle, Heart, Pill, Activity, Briefcase,
  MessageCircle, Sparkles, CheckCircle2, Eye, CalendarPlus, Loader2,
} from "lucide-react";
import { formatRut, isValidRut, cleanRut, formatPhone } from "../../../lib/rut";

type FormData = {
  fullName: string;
  rut: string;
  birthDate: string;
  gender: "" | "F" | "M" | "O";
  phone: string;
  email: string;
  address: string;
  commune: string;
  city: string;
  occupation: string;
  referredBy: string;
  emergencyContact: string;
  bloodType: string;
  allergies: string;
  medicalHistory: string;
  medications: string;
  notes: string;
  sendWelcome: boolean;
};

const INITIAL: FormData = {
  fullName: "", rut: "", birthDate: "", gender: "",
  phone: "", email: "", address: "", commune: "", city: "Santiago",
  occupation: "", referredBy: "", emergencyContact: "",
  bloodType: "", allergies: "", medicalHistory: "", medications: "", notes: "",
  sendWelcome: true,
};

type Duplicate = { id: string; fullName: string; rut: string | null; phone: string | null; matchedBy: string };

const STEPS = [
  { id: 0, label: "Personal", icon: User, description: "Datos básicos" },
  { id: 1, label: "Contacto", icon: Phone, description: "Teléfono y dirección" },
  { id: 2, label: "Clínica", icon: Heart, description: "Info médica" },
  { id: 3, label: "Revisar", icon: CheckCircle2, description: "Confirmar y crear" },
];

export function NewPatientDialog() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [loading, setLoading] = useState(false);
  const [created, setCreated] = useState<{ id: string; fullName: string; welcomeSent: boolean } | null>(null);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const reset = () => { setStep(0); setData(INITIAL); setErrors({}); setDuplicates([]); setCreated(null); };
  const close = () => { setOpen(false); setTimeout(reset, 300); };
  const update = <K extends keyof FormData>(k: K, v: FormData[K]) => setData(d => ({ ...d, [k]: v }));

  // Lock body scroll + close on Escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Duplicate detection con debounce
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      const params = new URLSearchParams();
      if (data.rut && cleanRut(data.rut).length >= 7) params.set("rut", data.rut);
      if (data.phone && data.phone.replace(/\D/g, "").length >= 8) params.set("phone", data.phone);
      if (!params.toString()) { setDuplicates([]); return; }
      try {
        const res = await fetch(`/api/patients/check?${params}`);
        const j = await res.json();
        setDuplicates(j.duplicates ?? []);
      } catch {}
    }, 400);
    return () => clearTimeout(t);
  }, [data.rut, data.phone, open]);

  function validateStep(s: number): boolean {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (!data.fullName.trim() || data.fullName.trim().split(" ").length < 2) {
        e.fullName = "Ingresa nombre y apellido";
      }
      if (data.rut && !isValidRut(data.rut)) e.rut = "RUT inválido";
    }
    if (s === 1) {
      if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = "Email inválido";
      if (data.phone && data.phone.replace(/\D/g, "").length < 8) e.phone = "Teléfono incompleto";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const next = () => { if (validateStep(step)) setStep(s => Math.min(STEPS.length - 1, s + 1)); };
  const back = () => setStep(s => Math.max(0, s - 1));

  async function submit() {
    if (!validateStep(step)) return;
    setLoading(true);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        gender: data.gender || null,
        rut: data.rut ? formatRut(data.rut) : null,
      }),
    });
    setLoading(false);
    if (!res.ok) { alert("Error al crear el paciente"); return; }
    const j = await res.json();
    setCreated({ id: j.id, fullName: j.fullName, welcomeSent: !!j.welcomeSent });
    router.refresh();
  }

  const drawer = open && (
    <div className="fixed inset-0 z-[1000]" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm anim-fade"
        onClick={close}
      />

      {/* Drawer panel */}
      <div className="absolute top-0 right-0 h-full w-full sm:w-[720px] max-w-full bg-white shadow-2xl flex flex-col anim-slide-right">
        {/* Header */}
        <div className="relative px-6 py-5 border-b border-slate-100 bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 text-white grid place-items-center shadow-lg shadow-blue-500/25 shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">
              {created ? "¡Paciente creado!" : "Nuevo paciente"}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {created ? "Todo listo para agendar o contactar." : `Paso ${step + 1} de ${STEPS.length} · ${STEPS[step].description}`}
            </p>
          </div>
          <button
            onClick={close}
            className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 transition shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body: sidebar stepper + content */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* Stepper vertical (desktop) */}
          {!created && (
            <aside className="hidden md:block w-56 border-r border-slate-100 bg-slate-50/60 px-4 py-6 shrink-0">
              <ol className="space-y-1">
                {STEPS.map((s, i) => {
                  const Icon = s.icon;
                  const done = i < step;
                  const active = i === step;
                  return (
                    <li key={s.id}>
                      <button
                        onClick={() => done && setStep(i)}
                        disabled={!done && !active}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                          active ? "bg-white shadow-sm ring-1 ring-blue-200" :
                          done ? "hover:bg-white cursor-pointer" :
                          "opacity-60"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full grid place-items-center text-xs shrink-0 transition ${
                            done ? "bg-blue-600 text-white" :
                            active ? "bg-blue-600 text-white ring-4 ring-blue-100" :
                            "bg-white border border-slate-200 text-slate-400"
                          }`}
                        >
                          {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <div className={`text-sm font-semibold ${active ? "text-blue-700" : done ? "text-slate-700" : "text-slate-400"}`}>
                            {s.label}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{s.description}</div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-6 p-3 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 text-white">
                <Sparkles className="w-4 h-4 mb-1.5" />
                <p className="text-xs font-semibold leading-tight">
                  Completa todos los datos para enviar WhatsApp de bienvenida automático.
                </p>
              </div>
            </aside>
          )}

          {/* Stepper mobile (horizontal) */}
          {!created && (
            <div className="md:hidden border-b border-slate-100 px-4 py-3 bg-slate-50/60 w-full absolute top-[88px] left-0 z-10">
              <div className="flex items-center gap-1">
                {STEPS.map((s, i) => {
                  const done = i < step; const active = i === step;
                  return (
                    <div key={s.id} className="flex-1 flex items-center gap-1">
                      <div className={`h-1.5 flex-1 rounded-full ${done || active ? "bg-blue-600" : "bg-slate-200"}`} />
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-xs font-semibold text-blue-700">{STEPS[step].label}</p>
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 min-w-0 overflow-y-auto px-6 py-6 ${!created ? "md:pt-6 pt-[72px]" : ""}`}>
            {created ? (
              <SuccessScreen patient={created} onClose={close} onNew={reset} />
            ) : (
              <>
                {step === 0 && <StepPersonal data={data} update={update} errors={errors} duplicates={duplicates} />}
                {step === 1 && <StepContact data={data} update={update} errors={errors} duplicates={duplicates} />}
                {step === 2 && <StepMedical data={data} update={update} />}
                {step === 3 && <StepReview data={data} update={update} />}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        {!created && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={step === 0 ? close : back}
              className="px-4 py-2.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 font-medium flex items-center gap-1.5 transition"
            >
              {step === 0 ? "Cancelar" : <><ArrowLeft className="w-4 h-4" /> Atrás</>}
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={next}
                className="px-5 py-2.5 text-sm rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-700 flex items-center gap-1.5 transition"
              >
                Continuar <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled={loading}
                onClick={submit}
                className="px-5 py-2.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 flex items-center gap-1.5 transition"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</> : <><Check className="w-4 h-4" /> Crear paciente</>}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition flex items-center gap-1.5"
      >
        <UserPlus className="w-4 h-4" /> Nuevo paciente
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}

/* ---------- Steps ---------- */

function StepPersonal({
  data, update, errors, duplicates,
}: {
  data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  errors: Record<string, string>; duplicates: Duplicate[];
}) {
  const initials = data.fullName.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="space-y-5 anim-fade-up">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center text-lg font-bold">
          {initials || <User className="w-6 h-6" />}
        </div>
        <div className="flex-1">
          <Field
            label="Nombre completo *"
            icon={User}
            placeholder="Juan Pérez Soto"
            value={data.fullName}
            onChange={(v) => update("fullName", v)}
            error={errors.fullName}
            autoFocus
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="RUT"
          icon={IdCard}
          placeholder="12.345.678-9"
          value={data.rut}
          onChange={(v) => update("rut", formatRut(v))}
          error={errors.rut}
          valid={data.rut.length > 0 && isValidRut(data.rut)}
        />
        <Field
          label="Fecha de nacimiento"
          icon={Cake}
          type="date"
          value={data.birthDate}
          onChange={(v) => update("birthDate", v)}
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">Género</label>
        <div className="flex gap-2">
          {[
            { v: "F", label: "Femenino" },
            { v: "M", label: "Masculino" },
            { v: "O", label: "Otro / Prefiero no decir" },
          ].map(opt => (
            <button
              key={opt.v}
              onClick={() => update("gender", data.gender === opt.v ? "" : (opt.v as FormData["gender"]))}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition ${
                data.gender === opt.v
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-semibold"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {duplicates.length > 0 && <DuplicatesBanner duplicates={duplicates} />}
    </div>
  );
}

function StepContact({
  data, update, errors, duplicates,
}: {
  data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  errors: Record<string, string>; duplicates: Duplicate[];
}) {
  return (
    <div className="space-y-5 anim-fade-up">
      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Teléfono / WhatsApp"
          icon={Phone}
          placeholder="+56 9 1234 5678"
          value={data.phone}
          onChange={(v) => update("phone", formatPhone(v))}
          error={errors.phone}
          hint="Usado para recordatorios por WhatsApp"
        />
        <Field
          label="Email"
          icon={Mail}
          type="email"
          placeholder="juan@example.cl"
          value={data.email}
          onChange={(v) => update("email", v)}
          error={errors.email}
        />
      </div>

      <Field
        label="Dirección"
        icon={MapPin}
        placeholder="Av. Providencia 1234, Depto 5"
        value={data.address}
        onChange={(v) => update("address", v)}
      />

      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Comuna"
          placeholder="Providencia"
          value={data.commune}
          onChange={(v) => update("commune", v)}
        />
        <Field
          label="Ciudad"
          placeholder="Santiago"
          value={data.city}
          onChange={(v) => update("city", v)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field
          label="Ocupación"
          icon={Briefcase}
          placeholder="Ej: Ingeniera"
          value={data.occupation}
          onChange={(v) => update("occupation", v)}
        />
        <Field
          label="¿Cómo nos conoció?"
          icon={Sparkles}
          placeholder="Instagram, recomendación..."
          value={data.referredBy}
          onChange={(v) => update("referredBy", v)}
        />
      </div>

      <Field
        label="Contacto de emergencia"
        icon={Phone}
        placeholder="María Pérez · +56 9 8765 4321"
        value={data.emergencyContact}
        onChange={(v) => update("emergencyContact", v)}
      />

      {duplicates.length > 0 && <DuplicatesBanner duplicates={duplicates} />}
    </div>
  );
}

function StepMedical({
  data, update,
}: {
  data: FormData; update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  return (
    <div className="space-y-5 anim-fade-up">
      <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-red-900">Información crítica</h4>
          <p className="text-xs text-red-700 mt-0.5">
            Las alergias se mostrarán destacadas en la ficha del paciente. Revisa antes de cualquier procedimiento.
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Alergias conocidas</label>
        <textarea
          rows={2}
          placeholder="Ej: Penicilina, látex, lidocaína..."
          value={data.allergies}
          onChange={(e) => update("allergies", e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-2">Tipo de sangre</label>
          <div className="grid grid-cols-4 gap-1.5">
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(bt => (
              <button
                key={bt}
                onClick={() => update("bloodType", data.bloodType === bt ? "" : bt)}
                className={`py-2 text-xs font-semibold rounded-md border transition ${
                  data.bloodType === bt
                    ? "border-red-400 bg-red-50 text-red-700"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >{bt}</button>
            ))}
          </div>
        </div>
        <Field
          label="Medicación habitual"
          icon={Pill}
          placeholder="Losartán 50mg, omeprazol..."
          value={data.medications}
          onChange={(v) => update("medications", v)}
          multiline
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Antecedentes médicos relevantes</label>
        <textarea
          rows={3}
          placeholder="Diabetes, hipertensión, cirugías, embarazo..."
          value={data.medicalHistory}
          onChange={(e) => update("medicalHistory", e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1">Notas generales</label>
        <textarea
          rows={2}
          placeholder="Prefiere horarios de mañana. Ansioso en procedimientos..."
          value={data.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
      </div>
    </div>
  );
}

function StepReview({ data, update }: {
  data: FormData;
  update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
}) {
  const initials = data.fullName.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="space-y-4 anim-fade-up">
      <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 via-sky-50 to-white border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-sky-400 text-white grid place-items-center text-xl font-bold shadow-lg shadow-blue-500/25">
            {initials || "?"}
          </div>
          <div>
            <h3 className="text-lg font-bold">{data.fullName || "Sin nombre"}</h3>
            <div className="text-xs text-slate-600 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
              {data.rut && <span>{data.rut}</span>}
              {data.birthDate && <span>Nace {new Date(data.birthDate).toLocaleDateString("es-CL")}</span>}
              {data.gender && <span>{data.gender === "F" ? "Femenino" : data.gender === "M" ? "Masculino" : "Otro"}</span>}
            </div>
          </div>
        </div>
      </div>

      <ReviewSection title="Contacto">
        <ReviewItem icon={Phone} label="Teléfono" value={data.phone} />
        <ReviewItem icon={Mail} label="Email" value={data.email} />
        <ReviewItem icon={MapPin} label="Dirección" value={[data.address, data.commune, data.city].filter(Boolean).join(", ")} />
        <ReviewItem icon={Briefcase} label="Ocupación" value={data.occupation} />
        <ReviewItem icon={Phone} label="Emergencia" value={data.emergencyContact} />
        <ReviewItem icon={Sparkles} label="Referido por" value={data.referredBy} />
      </ReviewSection>

      <ReviewSection title="Información clínica">
        {data.allergies ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-semibold text-red-900">Alergias</div>
              <div className="text-sm text-red-800">{data.allergies}</div>
            </div>
          </div>
        ) : (
          <ReviewItem icon={AlertTriangle} label="Alergias" value="" />
        )}
        <ReviewItem icon={Activity} label="Tipo de sangre" value={data.bloodType} />
        <ReviewItem icon={Pill} label="Medicación" value={data.medications} />
        <ReviewItem icon={Heart} label="Antecedentes" value={data.medicalHistory} />
        <ReviewItem label="Notas" value={data.notes} />
      </ReviewSection>

      <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-blue-200 bg-blue-50/50 cursor-pointer hover:border-blue-400 transition">
        <input
          type="checkbox"
          checked={data.sendWelcome}
          onChange={(e) => update("sendWelcome", e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-blue-600"
        />
        <div className="flex-1">
          <div className="text-sm font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            Enviar WhatsApp de bienvenida automáticamente
          </div>
          <div className="text-xs text-slate-600 mt-0.5">
            Se enviará un mensaje de bienvenida al teléfono registrado (si hay).
          </div>
        </div>
      </label>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white">
      <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ icon: Icon, label, value }: { icon?: any; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon ? <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /> : <span className="w-3.5 shrink-0" />}
      <span className="text-slate-500 min-w-[80px]">{label}:</span>
      <span className={`flex-1 ${value ? "text-slate-900" : "text-slate-400 italic"}`}>
        {value || "—"}
      </span>
    </div>
  );
}

function SuccessScreen({ patient, onClose, onNew }: {
  patient: { id: string; fullName: string; welcomeSent: boolean };
  onClose: () => void; onNew: () => void;
}) {
  return (
    <div className="text-center py-8 anim-fade-up">
      <div className="relative inline-block">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 grid place-items-center mx-auto shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-emerald-200 anim-pulse-glow" />
      </div>
      <h3 className="mt-5 text-2xl font-bold">{patient.fullName}</h3>
      <p className="text-sm text-slate-500 mt-1">creado exitosamente</p>

      {patient.welcomeSent && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-200">
          <MessageCircle className="w-3.5 h-3.5" /> WhatsApp de bienvenida enviado
        </div>
      )}

      <div className="mt-8 grid grid-cols-3 gap-2 max-w-lg mx-auto">
        <Link
          href={`/pacientes/${patient.id}`}
          onClick={onClose}
          className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <Eye className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-semibold">Ver ficha</span>
        </Link>
        <Link
          href="/agenda"
          onClick={onClose}
          className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <CalendarPlus className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-semibold">Agendar cita</span>
        </Link>
        <button
          onClick={onNew}
          className="flex flex-col items-center gap-1 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition"
        >
          <UserPlus className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-semibold">Otro paciente</span>
        </button>
      </div>

      <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:text-slate-700">
        Cerrar
      </button>
    </div>
  );
}

/* ---------- Reusable field ---------- */

function Field({
  label, value, onChange, type = "text", placeholder, icon: Icon, error, hint, multiline, autoFocus, valid,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; icon?: any; error?: string; hint?: string;
  multiline?: boolean; autoFocus?: boolean; valid?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium block mb-1">{label}</label>
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />}
        {multiline ? (
          <textarea
            rows={1}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
          />
        ) : (
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            autoFocus={autoFocus}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-9 py-2.5 border rounded-lg text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-100 ${
              error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-600"
            }`}
          />
        )}
        {valid && <Check className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />}
      </div>
      {error && <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
      {!error && hint && <p className="text-xs text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function DuplicatesBanner({ duplicates }: { duplicates: Duplicate[] }) {
  return (
    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
      <div className="text-xs flex-1">
        <div className="font-semibold text-amber-900">Posible paciente duplicado</div>
        <ul className="mt-1 space-y-0.5">
          {duplicates.map(d => (
            <li key={d.id}>
              <Link href={`/pacientes/${d.id}`} className="text-amber-800 hover:underline">
                {d.fullName} {d.rut && `· ${d.rut}`} {d.phone && `· ${d.phone}`}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
