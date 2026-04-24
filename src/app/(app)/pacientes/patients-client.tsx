"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, Filter, MessageCircle, Phone, Mail, AlertTriangle, Clock,
  Cake, UserX, CalendarPlus, Copy, MoreVertical, X, Send, Check,
  ChevronDown, Users, UserPlus, Sparkles, Eye, CheckCircle2,
} from "lucide-react";
import { TEMPLATES, type TemplateId, getTemplate } from "../../../lib/whatsapp-templates";
import { NewPatientDialog } from "./new-patient";

export type EnrichedPatient = {
  id: string;
  fullName: string;
  rut: string | null;
  phone: string | null;
  email: string | null;
  allergies: string | null;
  birthDate: string | null;
  createdAt: string;
  nextAppointmentAt: string | null;
  nextAppointmentTreatment: string | null;
  lastVisitAt: string | null;
  totalSpent: number;
  visits: number;
  overdueRecalls: number;
  hasAllergies: boolean;
  hasPhone: boolean;
  isInactive: boolean;
  isNewThisMonth: boolean;
  birthdayThisMonth: boolean;
};

type Counters = {
  total: number; newThisMonth: number; noPhone: number; allergies: number;
  overdueRecalls: number; inactive: number; birthdayMonth: number;
};

const FILTERS = [
  { id: "all", label: "Todos", icon: Users },
  { id: "new", label: "Nuevos este mes", icon: UserPlus, color: "sky" },
  { id: "birthday", label: "Cumple este mes", icon: Cake, color: "pink" },
  { id: "allergies", label: "Con alergias", icon: AlertTriangle, color: "red" },
  { id: "overdue", label: "Recall vencido", icon: Clock, color: "red" },
  { id: "inactive", label: "Inactivos >6 meses", icon: UserX, color: "amber" },
  { id: "no-phone", label: "Sin teléfono", icon: Phone, color: "slate" },
] as const;

function fmtCLP(n: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" });
}
function relative(iso: string | null): string {
  if (!iso) return "nunca";
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (diff < 0) return `en ${Math.abs(diff)}d`;
  if (diff === 0) return "hoy";
  if (diff === 1) return "ayer";
  if (diff < 30) return `hace ${diff}d`;
  if (diff < 365) return `hace ${Math.floor(diff / 30)}m`;
  return `hace ${Math.floor(diff / 365)}a`;
}
function ageFromIso(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 3600 * 1000));
}

export function PatientsClient({
  patients, counters, dentistName, initialQuery, initialFilter, initialSort,
}: {
  patients: EnrichedPatient[]; counters: Counters; dentistName: string;
  initialQuery: string; initialFilter: string; initialSort: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState(initialFilter);
  const [sort, setSort] = useState(initialSort);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [actionsFor, setActionsFor] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = patients;
    if (filter === "new") list = list.filter(p => p.isNewThisMonth);
    else if (filter === "birthday") list = list.filter(p => p.birthdayThisMonth);
    else if (filter === "allergies") list = list.filter(p => p.hasAllergies);
    else if (filter === "overdue") list = list.filter(p => p.overdueRecalls > 0);
    else if (filter === "inactive") list = list.filter(p => p.isInactive && p.lastVisitAt);
    else if (filter === "no-phone") list = list.filter(p => !p.hasPhone);

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.rut?.toLowerCase().includes(q) ||
        p.phone?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q),
      );
    }

    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.fullName.localeCompare(b.fullName));
    else if (sort === "recent") sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === "lastvisit") sorted.sort((a, b) => (b.lastVisitAt ?? "").localeCompare(a.lastVisitAt ?? ""));
    else if (sort === "spent") sorted.sort((a, b) => b.totalSpent - a.totalSpent);
    return sorted;
  }, [patients, query, filter, sort]);

  const allSelected = filtered.length > 0 && filtered.every(p => selected.has(p.id));
  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(p => p.id)));
  }
  function toggle(id: string) {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 anim-fade-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-sm text-slate-600 mt-1">
            {counters.total} pacientes · <span className="text-sky-700 font-medium">+{counters.newThisMonth} este mes</span>
            {counters.overdueRecalls > 0 && <> · <span className="text-red-600 font-medium">{counters.overdueRecalls} con recall vencido</span></>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setModalOpen(true)}
            className="px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-900 font-semibold hover:border-blue-600 hover:text-blue-700 transition flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp masivo
          </button>
          <NewPatientDialog />
        </div>
      </div>

      {/* Search + Sort */}
      <div className="flex items-center gap-2 flex-wrap anim-fade-up delay-100">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, RUT, teléfono, email..."
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 text-sm"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2.5 border border-slate-200 rounded-lg bg-white text-sm focus:outline-none focus:border-blue-600"
        >
          <option value="name">Ordenar: Nombre A-Z</option>
          <option value="recent">Más recientes</option>
          <option value="lastvisit">Última visita</option>
          <option value="spent">Más gastado</option>
        </select>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap anim-fade-up delay-200">
        {FILTERS.map(f => {
          const Icon = f.icon;
          const active = filter === f.id;
          const count = f.id === "all" ? counters.total
            : f.id === "new" ? counters.newThisMonth
            : f.id === "birthday" ? counters.birthdayMonth
            : f.id === "allergies" ? counters.allergies
            : f.id === "overdue" ? counters.overdueRecalls
            : f.id === "inactive" ? counters.inactive
            : f.id === "no-phone" ? counters.noPhone : 0;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition ${
                active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {f.label}
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                active ? "bg-white/20" : "bg-slate-100 text-slate-600"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="flex items-center justify-between p-3 rounded-xl border border-blue-300 bg-blue-50 anim-fade-up">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-700" />
            <b>{selected.size}</b> paciente{selected.size === 1 ? "" : "s"} seleccionado{selected.size === 1 ? "" : "s"}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-md transition flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Enviar WhatsApp
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden anim-fade-up delay-300">
        <div className="hidden md:grid grid-cols-[32px_1fr_180px_180px_140px_120px_60px] gap-3 px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide bg-slate-50 border-b border-slate-200">
          <label className="flex items-center">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded" />
          </label>
          <span>Paciente</span>
          <span>Contacto</span>
          <span>Última / próxima visita</span>
          <span>Total</span>
          <span>Alertas</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-700">Sin resultados</p>
            <p className="text-xs text-slate-500 mt-1">Ajusta los filtros o crea un nuevo paciente.</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <PatientRow
                key={p.id}
                p={p}
                checked={selected.has(p.id)}
                onToggle={() => toggle(p.id)}
                showActions={actionsFor === p.id}
                onToggleActions={() => setActionsFor(actionsFor === p.id ? null : p.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {modalOpen && (
        <BulkModal
          selectedIds={Array.from(selected)}
          allPatients={patients}
          dentistName={dentistName}
          onClose={() => setModalOpen(false)}
          onDone={() => { setSelected(new Set()); setModalOpen(false); }}
        />
      )}
    </div>
  );
}

/* -------- Row -------- */

function PatientRow({
  p, checked, onToggle, showActions, onToggleActions,
}: {
  p: EnrichedPatient; checked: boolean; onToggle: () => void;
  showActions: boolean; onToggleActions: () => void;
}) {
  const age = ageFromIso(p.birthDate);
  const initials = p.fullName.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const waUrl = p.phone ? `https://wa.me/${p.phone.replace(/\D/g, "")}` : null;

  const alerts = [
    p.hasAllergies && { icon: AlertTriangle, label: "Alergias", color: "bg-red-50 text-red-700 border-red-200", title: p.allergies },
    p.overdueRecalls > 0 && { icon: Clock, label: `${p.overdueRecalls} recall`, color: "bg-amber-50 text-amber-700 border-amber-200", title: "Control vencido" },
    !p.hasPhone && { icon: Phone, label: "Sin tel.", color: "bg-slate-100 text-slate-600 border-slate-200", title: "Sin teléfono registrado" },
    p.birthdayThisMonth && { icon: Cake, label: "Cumple", color: "bg-pink-50 text-pink-700 border-pink-200", title: "Cumple este mes" },
  ].filter(Boolean) as { icon: any; label: string; color: string; title?: string | null }[];

  return (
    <li className="relative group hover:bg-slate-50/70 transition">
      <div className="md:grid md:grid-cols-[32px_1fr_180px_180px_140px_120px_60px] gap-3 px-4 py-3 items-center flex flex-wrap">
        <label className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={checked} onChange={onToggle} className="rounded" />
        </label>

        {/* Paciente */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center text-sm font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <Link href={`/pacientes/${p.id}`} className="font-medium hover:text-blue-700 block truncate">
              {p.fullName}
            </Link>
            <div className="text-xs text-slate-500 truncate">
              {p.rut ?? "Sin RUT"}{age != null && ` · ${age}a`}
              {p.isNewThisMonth && <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">Nuevo</span>}
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="min-w-0 text-sm">
          {p.phone ? (
            <a href={waUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{p.phone}</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400 italic">Sin teléfono</span>
          )}
          {p.email && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
              <Mail className="w-3 h-3" />
              <span className="truncate">{p.email}</span>
            </div>
          )}
        </div>

        {/* Visitas */}
        <div className="text-xs text-slate-600 min-w-0">
          <div>
            <span className="text-slate-400">Última:</span>{" "}
            <span className="font-medium">{relative(p.lastVisitAt)}</span>
          </div>
          {p.nextAppointmentAt ? (
            <div className="text-blue-700 truncate">
              <span className="text-slate-400">Próx:</span>{" "}
              <span className="font-medium">{fmtDate(p.nextAppointmentAt)}</span>
              {p.nextAppointmentTreatment && <span className="text-slate-500"> · {p.nextAppointmentTreatment}</span>}
            </div>
          ) : (
            <div className="text-slate-400 text-xs">Sin próxima cita</div>
          )}
        </div>

        {/* Gastado */}
        <div className="text-sm">
          <div className="font-semibold">{fmtCLP(p.totalSpent)}</div>
          <div className="text-xs text-slate-500">{p.visits} visitas</div>
        </div>

        {/* Alertas */}
        <div className="flex items-center gap-1 flex-wrap">
          {alerts.map((a, i) => {
            const Icon = a.icon;
            return (
              <span
                key={i}
                title={a.title ?? a.label}
                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border ${a.color}`}
              >
                <Icon className="w-3 h-3" />
                {a.label}
              </span>
            );
          })}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 justify-end">
          <Link href={`/pacientes/${p.id}`} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900" title="Ver ficha">
            <Eye className="w-4 h-4" />
          </Link>
          {waUrl && (
            <a href={waUrl} target="_blank" rel="noreferrer" className="p-1.5 rounded-md text-blue-700 hover:bg-blue-50" title="WhatsApp">
              <MessageCircle className="w-4 h-4" />
            </a>
          )}
          <button onClick={onToggleActions} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 relative" title="Más acciones">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showActions && (
        <div className="absolute right-4 top-12 z-10 w-60 rounded-lg border border-slate-200 bg-white shadow-lg py-1 anim-fade-up">
          <Link href={`/pacientes/${p.id}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
            <Eye className="w-4 h-4 text-slate-500" /> Ver ficha completa
          </Link>
          <Link href={`/agenda`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
            <CalendarPlus className="w-4 h-4 text-slate-500" /> Agendar nueva cita
          </Link>
          {p.phone && (
            <>
              <a href={waUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
                <MessageCircle className="w-4 h-4 text-blue-700" /> Abrir chat WhatsApp
              </a>
              <button
                onClick={() => { navigator.clipboard.writeText(p.phone!); onToggleActions(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <Copy className="w-4 h-4 text-slate-500" /> Copiar teléfono
              </button>
            </>
          )}
          {p.email && (
            <a href={`mailto:${p.email}`} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50">
              <Mail className="w-4 h-4 text-slate-500" /> Enviar email
            </a>
          )}
        </div>
      )}
    </li>
  );
}

/* -------- Bulk WhatsApp Modal -------- */

function BulkModal({
  selectedIds, allPatients, dentistName, onClose, onDone,
}: {
  selectedIds: string[]; allPatients: EnrichedPatient[]; dentistName: string;
  onClose: () => void; onDone: () => void;
}) {
  const [templateId, setTemplateId] = useState<TemplateId>("reminder");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number; skipped: number; total: number } | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const targets = selectedIds.length > 0
    ? allPatients.filter(p => selectedIds.includes(p.id))
    : allPatients;

  const template = getTemplate(templateId);
  const withPhone = targets.filter(p => p.hasPhone);
  const withoutPhone = targets.length - withPhone.length;

  const preview = withPhone[0] ? template.build(
    {
      fullName: withPhone[0].fullName,
      firstName: withPhone[0].fullName.split(" ")[0],
      nextAppointmentAt: withPhone[0].nextAppointmentAt ? new Date(withPhone[0].nextAppointmentAt) : null,
      lastVisitAt: withPhone[0].lastVisitAt ? new Date(withPhone[0].lastVisitAt) : null,
    },
    { dentistName },
    { customMessage },
  ) : "Selecciona pacientes con teléfono para ver el preview.";

  async function send() {
    if (withPhone.length === 0) { alert("Ningún paciente seleccionado tiene teléfono"); return; }
    if (!confirm(`¿Enviar a ${withPhone.length} pacientes?`)) return;
    setLoading(true);
    const res = await fetch("/api/whatsapp/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        patientIds: withPhone.map(p => p.id),
        templateId,
        customMessage,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setResult(data);
      start(() => router.refresh());
    } else {
      alert("Error: " + JSON.stringify(data));
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 grid place-items-center p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        <div className="p-5 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-700" /> Envío masivo por WhatsApp
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {withPhone.length} pacientes con teléfono
              {withoutPhone > 0 && ` · ${withoutPhone} se omitirán sin teléfono`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>

        {result ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">¡Envío completado!</h3>
            <div className="mt-4 grid grid-cols-3 gap-3 max-w-md mx-auto text-center">
              <div className="p-3 rounded-lg bg-emerald-50">
                <div className="text-2xl font-bold text-emerald-700">{result.sent}</div>
                <div className="text-xs text-emerald-600">Enviados</div>
              </div>
              <div className="p-3 rounded-lg bg-amber-50">
                <div className="text-2xl font-bold text-amber-700">{result.skipped}</div>
                <div className="text-xs text-amber-600">Omitidos</div>
              </div>
              <div className="p-3 rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-700">{result.failed}</div>
                <div className="text-xs text-red-600">Fallidos</div>
              </div>
            </div>
            <p className="mt-5 text-xs text-slate-500">
              Los mensajes se envían vía WhatsApp Cloud API. Si no hay credenciales configuradas se registran como <code>simulated</code> en /mensajes.
            </p>
            <button
              onClick={onDone}
              className="mt-6 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-700"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="p-5 space-y-5">
              {/* Template grid */}
              <div>
                <label className="text-sm font-semibold block mb-2">Elige una plantilla</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTemplateId(t.id)}
                      className={`text-left p-3 rounded-lg border-2 transition ${
                        templateId === t.id
                          ? "border-blue-600 bg-blue-50/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xl mb-1">{t.icon}</div>
                      <div className="text-sm font-semibold">{t.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {templateId === "custom" && (
                <div>
                  <label className="text-sm font-semibold block mb-2">
                    Mensaje personalizado{" "}
                    <span className="text-xs text-slate-500 font-normal">
                      (usa <code>{"{nombre}"}</code> para personalizar)
                    </span>
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    rows={5}
                    placeholder="Hola {nombre}, te escribimos para..."
                    className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              {/* Preview */}
              <div>
                <label className="text-sm font-semibold block mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Preview
                  {withPhone[0] && <span className="text-xs text-slate-500 font-normal">({withPhone[0].fullName})</span>}
                </label>
                <div className="rounded-xl bg-[#e5ddd5] p-4 max-h-[260px] overflow-y-auto">
                  <div className="ml-auto max-w-[85%] bg-[#d9fdd3] rounded-lg p-3 shadow text-sm text-slate-800 whitespace-pre-wrap">
                    {preview}
                    <div className="text-[10px] text-slate-500 text-right mt-1">
                      {new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })} ✓✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0">
              <div className="text-xs text-slate-500">
                Al enviar se registrará en <b>/mensajes</b>. Los pacientes sin teléfono serán omitidos.
              </div>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50">Cancelar</button>
                <button
                  disabled={loading || withPhone.length === 0 || (templateId === "custom" && !customMessage.trim())}
                  onClick={send}
                  className="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-lg font-semibold hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {loading ? "Enviando..." : `Enviar a ${withPhone.length}`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
