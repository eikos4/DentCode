"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Odontogram } from "../../../../components/odontogram";
import {
  FileText, Image as ImageIcon, StickyNote, Bell, Clock, Activity,
  Upload, Trash2, Check, Plus,
} from "lucide-react";

type ISO = string;

export type PatientData = {
  id: string;
  fullName: string;
  rut: string | null;
  birthDate: ISO | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  allergies: string | null;
  medicalHistory: string | null;
  notes: string | null;
};

export type Attachment = {
  id: string; category: string; subtype: string | null; url: string;
  filename: string; mime: string; sizeBytes: number; note: string | null;
  takenAt: ISO | null; createdAt: ISO;
};
export type ClinicalNote = {
  id: string; date: ISO; subjective: string | null; objective: string | null;
  assessment: string | null; plan: string | null;
};
export type Recall = {
  id: string; type: string; dueDate: ISO; notes: string | null;
  doneAt: ISO | null; createdAt: ISO;
};
export type Appt = {
  id: string; startAt: ISO; endAt: ISO; treatment: string | null;
  status: string; priceCLP: number | null;
};
export type ToothRec = { toothCode: string; condition: string };

type Tab = "overview" | "xrays" | "notes" | "recalls" | "timeline" | "odonto";

export function PatientTabs(props: {
  patient: PatientData;
  appointments: Appt[];
  notes: ClinicalNote[];
  attachments: Attachment[];
  recalls: Recall[];
  toothRecords: ToothRec[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "overview", label: "Resumen", icon: FileText },
    { id: "xrays", label: "Radiografías y fotos", icon: ImageIcon },
    { id: "notes", label: "Notas clínicas", icon: StickyNote },
    { id: "recalls", label: "Controles", icon: Bell },
    { id: "timeline", label: "Línea de tiempo", icon: Clock },
    { id: "odonto", label: "Odontograma", icon: Activity },
  ];

  const overdue = props.recalls.filter(r => !r.doneAt && new Date(r.dueDate) < new Date()).length;

  return (
    <div>
      <div className="border-b flex gap-1 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm whitespace-nowrap border-b-2 -mb-px ${
              tab === id ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {id === "recalls" && overdue > 0 && (
              <span className="ml-1 text-[10px] bg-red-500 text-white rounded-full px-1.5 py-0.5">{overdue}</span>
            )}
          </button>
        ))}
      </div>

      <div className="py-4">
        {tab === "overview" && <Overview patient={props.patient} appointments={props.appointments} />}
        {tab === "xrays" && <Attachments patientId={props.patient.id} attachments={props.attachments} />}
        {tab === "notes" && <Notes patientId={props.patient.id} notes={props.notes} />}
        {tab === "recalls" && <Recalls patientId={props.patient.id} recalls={props.recalls} />}
        {tab === "timeline" && <Timeline {...props} />}
        {tab === "odonto" && (
          <div className="p-4 rounded-xl border bg-white">
            <Odontogram patientId={props.patient.id} records={props.toothRecords} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Overview ---------- */
function Overview({ patient, appointments }: { patient: PatientData; appointments: Appt[] }) {
  const last = appointments[0];
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl border bg-white md:col-span-2 space-y-2">
        <h3 className="font-semibold">Datos del paciente</h3>
        <dl className="grid grid-cols-2 gap-y-1 text-sm">
          <dt className="text-muted-foreground">RUT</dt><dd>{patient.rut ?? "—"}</dd>
          <dt className="text-muted-foreground">Nacimiento</dt><dd>{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("es-CL") : "—"}</dd>
          <dt className="text-muted-foreground">Teléfono</dt><dd>{patient.phone ?? "—"}</dd>
          <dt className="text-muted-foreground">Email</dt><dd>{patient.email ?? "—"}</dd>
          <dt className="text-muted-foreground">Dirección</dt><dd>{patient.address ?? "—"}</dd>
        </dl>
        <div className="pt-2 border-t">
          <p className="text-sm text-red-600"><b>Alergias:</b> {patient.allergies ?? "—"}</p>
          <p className="text-sm"><b>Antecedentes:</b> {patient.medicalHistory ?? "—"}</p>
          <p className="text-sm"><b>Notas:</b> {patient.notes ?? "—"}</p>
        </div>
      </div>
      <div className="p-4 rounded-xl border bg-white">
        <h3 className="font-semibold">Última visita</h3>
        {last ? (
          <div className="text-sm mt-2">
            <p>{new Date(last.startAt).toLocaleString("es-CL")}</p>
            <p className="text-muted-foreground">{last.treatment ?? "Consulta"}</p>
            <p className="text-xs mt-1 px-2 py-0.5 rounded-full bg-muted inline-block">{last.status}</p>
          </div>
        ) : <p className="text-sm text-muted-foreground mt-2">Sin visitas.</p>}
      </div>
    </div>
  );
}

/* ---------- Attachments ---------- */
function Attachments({ patientId, attachments }: { patientId: string; attachments: Attachment[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [category, setCategory] = useState("radiograph");
  const [subtype, setSubtype] = useState("panoramic");
  const [note, setNote] = useState("");

  const subtypesByCat: Record<string, string[]> = {
    radiograph: ["panoramic", "periapical", "bitewing", "lateral"],
    photo: ["intraoral", "extraoral", "smile"],
    document: [],
    consent: [],
    prescription: [],
    budget: [],
  };

  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    for (const f of files) {
      const fd = new FormData();
      fd.append("file", f);
      fd.append("category", category);
      if (subtypesByCat[category]?.length) fd.append("subtype", subtype);
      if (note) fd.append("note", note);
      const res = await fetch(`/api/patients/${patientId}/attachments`, { method: "POST", body: fd });
      if (!res.ok) alert(`Error subiendo ${f.name}`);
    }
    setUploading(false);
    setNote("");
    e.target.value = "";
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const groups = attachments.reduce<Record<string, Attachment[]>>((acc, a) => {
    (acc[a.category] ||= []).push(a); return acc;
  }, {});
  const groupLabel: Record<string, string> = {
    radiograph: "Radiografías", photo: "Fotografías", document: "Documentos",
    consent: "Consentimientos", prescription: "Recetas", budget: "Presupuestos",
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border bg-white">
        <h3 className="font-semibold mb-3 flex items-center gap-2"><Upload className="w-4 h-4" /> Subir archivos</h3>
        <div className="grid md:grid-cols-4 gap-2 mb-3">
          <label className="text-sm">
            Categoría
            <select value={category} onChange={(e) => { setCategory(e.target.value); setSubtype(subtypesByCat[e.target.value]?.[0] ?? ""); }} className="mt-1 w-full border rounded-md px-2 py-2">
              <option value="radiograph">Radiografía</option>
              <option value="photo">Fotografía</option>
              <option value="document">Documento</option>
              <option value="consent">Consentimiento</option>
              <option value="prescription">Receta</option>
              <option value="budget">Presupuesto</option>
            </select>
          </label>
          {subtypesByCat[category]?.length > 0 && (
            <label className="text-sm">
              Tipo
              <select value={subtype} onChange={(e) => setSubtype(e.target.value)} className="mt-1 w-full border rounded-md px-2 py-2">
                {subtypesByCat[category].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          )}
          <label className="text-sm md:col-span-2">
            Nota (opcional)
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ej: control post-endodoncia pieza 36" className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
        </div>
        <label className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${uploading ? "opacity-50" : "hover:bg-muted/40"}`}>
          <input type="file" multiple accept="image/*,application/pdf" onChange={upload} disabled={uploading} className="hidden" />
          <Upload className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="text-sm mt-2">{uploading ? "Subiendo..." : "Haz click o arrastra imágenes / PDFs"}</p>
          <p className="text-xs text-muted-foreground">Radiografías, fotos intraorales, consentimientos, etc.</p>
        </label>
      </div>

      {Object.keys(groups).length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin archivos aún.</p>
      ) : (
        Object.entries(groups).map(([cat, list]) => (
          <div key={cat} className="p-4 rounded-xl border bg-white">
            <h3 className="font-semibold mb-3">{groupLabel[cat] ?? cat} <span className="text-xs text-muted-foreground">({list.length})</span></h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {list.map((a) => (
                <div key={a.id} className="group relative rounded-lg border overflow-hidden">
                  {a.mime.startsWith("image/") ? (
                    <a href={a.url} target="_blank" rel="noreferrer">
                      <img src={a.url} alt={a.filename} className="w-full aspect-square object-cover bg-zinc-100" />
                    </a>
                  ) : (
                    <a href={a.url} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center aspect-square bg-muted">
                      <FileText className="w-8 h-8 text-muted-foreground" />
                      <span className="text-xs mt-2 px-2 text-center truncate max-w-full">{a.filename}</span>
                    </a>
                  )}
                  <div className="p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{a.subtype ?? a.filename}</span>
                      <button onClick={() => del(a.id)} className="text-red-500 opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {a.note && <p className="text-muted-foreground truncate">{a.note}</p>}
                    <p className="text-muted-foreground">{new Date(a.createdAt).toLocaleDateString("es-CL")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

/* ---------- Notes ---------- */
function Notes({ patientId, notes }: { patientId: string; notes: ClinicalNote[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    const res = await fetch(`/api/patients/${patientId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (res.ok) { setOpen(false); router.refresh(); }
    else alert("Error al guardar nota");
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar nota?")) return;
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Notas estructuradas en formato SOAP.</p>
        <button onClick={() => setOpen(v => !v)} className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium flex items-center gap-1">
          <Plus className="w-4 h-4" /> Nueva nota
        </button>
      </div>

      {open && (
        <form onSubmit={submit} className="p-4 rounded-xl border bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-sm md:col-span-2">
            Fecha
            <input type="datetime-local" name="date" className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
          <label className="text-sm">
            <b>S</b> — Subjetivo (lo que refiere el paciente)
            <textarea name="subjective" rows={3} className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
          <label className="text-sm">
            <b>O</b> — Objetivo (hallazgos clínicos)
            <textarea name="objective" rows={3} className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
          <label className="text-sm">
            <b>A</b> — Assessment (diagnóstico)
            <textarea name="assessment" rows={3} className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
          <label className="text-sm">
            <b>P</b> — Plan (tratamiento)
            <textarea name="plan" rows={3} className="mt-1 w-full border rounded-md px-2 py-2" />
          </label>
          <div className="md:col-span-2 flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm border rounded-md">Cancelar</button>
            <button disabled={loading} className="px-3 py-2 text-sm bg-primary text-white rounded-md">{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin notas clínicas.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="p-4 rounded-xl border bg-white">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">{new Date(n.date).toLocaleString("es-CL")}</span>
                <button onClick={() => del(n.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="grid md:grid-cols-2 gap-2 mt-2 text-sm">
                {n.subjective && <p><b>S:</b> {n.subjective}</p>}
                {n.objective && <p><b>O:</b> {n.objective}</p>}
                {n.assessment && <p><b>A:</b> {n.assessment}</p>}
                {n.plan && <p><b>P:</b> {n.plan}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Recalls ---------- */
function Recalls({ patientId, recalls }: { patientId: string; recalls: Recall[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const res = await fetch(`/api/patients/${patientId}/recalls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(fd.entries())),
    });
    setLoading(false);
    if (res.ok) { (e.target as HTMLFormElement).reset(); router.refresh(); }
    else alert("Error");
  }

  async function toggle(id: string, done: boolean) {
    await fetch(`/api/recalls/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("¿Eliminar control?")) return;
    await fetch(`/api/recalls/${id}`, { method: "DELETE" });
    router.refresh();
  }

  const now = new Date();
  const pending = recalls.filter(r => !r.doneAt);
  const done = recalls.filter(r => r.doneAt);

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="p-4 rounded-xl border bg-white grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="text-sm">
          Tipo
          <select name="type" className="mt-1 w-full border rounded-md px-2 py-2">
            <option value="limpieza">Limpieza / profilaxis</option>
            <option value="control">Control general</option>
            <option value="ortodoncia">Control ortodoncia</option>
            <option value="endodoncia">Control endodoncia</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="text-sm">
          Fecha esperada
          <input type="date" name="dueDate" required className="mt-1 w-full border rounded-md px-2 py-2" />
        </label>
        <label className="text-sm md:col-span-2">
          Notas
          <input name="notes" placeholder="Ej: Limpieza semestral" className="mt-1 w-full border rounded-md px-2 py-2" />
        </label>
        <div className="md:col-span-4 flex justify-end">
          <button disabled={loading} className="px-3 py-2 rounded-md bg-primary text-white text-sm font-medium flex items-center gap-1">
            <Plus className="w-4 h-4" /> Agregar control
          </button>
        </div>
      </form>

      <div className="p-4 rounded-xl border bg-white">
        <h3 className="font-semibold mb-3">Pendientes</h3>
        {pending.length === 0 ? <p className="text-sm text-muted-foreground">Sin controles pendientes.</p> : (
          <ul className="divide-y">
            {pending.map((r) => {
              const due = new Date(r.dueDate);
              const overdue = due < now;
              return (
                <li key={r.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium capitalize">{r.type}</div>
                    <div className="text-muted-foreground">{r.notes}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${overdue ? "bg-red-100 text-red-700" : "bg-muted"}`}>
                      {due.toLocaleDateString("es-CL")} {overdue ? "· vencido" : ""}
                    </span>
                    <button onClick={() => toggle(r.id, true)} className="text-emerald-600 hover:text-emerald-800" title="Marcar hecho"><Check className="w-4 h-4" /></button>
                    <button onClick={() => del(r.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {done.length > 0 && (
        <div className="p-4 rounded-xl border bg-white">
          <h3 className="font-semibold mb-3 text-muted-foreground">Completados</h3>
          <ul className="divide-y">
            {done.map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between text-sm opacity-70">
                <span className="capitalize">{r.type} — {new Date(r.dueDate).toLocaleDateString("es-CL")}</span>
                <button onClick={() => toggle(r.id, false)} className="text-xs text-muted-foreground hover:underline">Reabrir</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------- Timeline ---------- */
function Timeline({ appointments, notes, attachments, recalls }: {
  appointments: Appt[]; notes: ClinicalNote[]; attachments: Attachment[]; recalls: Recall[];
}) {
  type Event = { at: Date; kind: string; title: string; subtitle?: string; color: string; icon: any };

  const events = useMemo<Event[]>(() => {
    const arr: Event[] = [];
    for (const a of appointments) arr.push({
      at: new Date(a.startAt), kind: "appointment",
      title: `Cita — ${a.treatment ?? "Consulta"}`,
      subtitle: `Estado: ${a.status}${a.priceCLP ? ` · $${a.priceCLP.toLocaleString("es-CL")}` : ""}`,
      color: "bg-sky-500", icon: Clock,
    });
    for (const n of notes) arr.push({
      at: new Date(n.date), kind: "note",
      title: "Nota clínica",
      subtitle: [n.subjective, n.assessment].filter(Boolean).join(" · ").slice(0, 120) || undefined,
      color: "bg-purple-500", icon: StickyNote,
    });
    for (const a of attachments) arr.push({
      at: new Date(a.takenAt ?? a.createdAt), kind: "attachment",
      title: `${a.category}${a.subtype ? ` · ${a.subtype}` : ""}`,
      subtitle: a.filename,
      color: a.category === "radiograph" ? "bg-amber-500" : "bg-emerald-500",
      icon: a.mime.startsWith("image/") ? ImageIcon : FileText,
    });
    for (const r of recalls) arr.push({
      at: new Date(r.doneAt ?? r.dueDate), kind: "recall",
      title: `Control ${r.type}${r.doneAt ? " · completado" : " · programado"}`,
      subtitle: r.notes ?? undefined,
      color: r.doneAt ? "bg-emerald-600" : "bg-red-500", icon: Bell,
    });
    return arr.sort((x, y) => y.at.getTime() - x.at.getTime());
  }, [appointments, notes, attachments, recalls]);

  if (events.length === 0) return <p className="text-sm text-muted-foreground">Sin eventos.</p>;

  return (
    <div className="relative pl-6">
      <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
      <ul className="space-y-4">
        {events.map((e, i) => {
          const Icon = e.icon;
          return (
            <li key={i} className="relative">
              <span className={`absolute -left-[22px] top-1 w-4 h-4 rounded-full ${e.color} grid place-items-center`}>
                <Icon className="w-2.5 h-2.5 text-white" />
              </span>
              <div className="p-3 rounded-lg border bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{e.title}</span>
                  <span className="text-xs text-muted-foreground">{e.at.toLocaleString("es-CL")}</span>
                </div>
                {e.subtitle && <p className="text-sm text-muted-foreground mt-0.5">{e.subtitle}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
