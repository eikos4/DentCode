"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe, Eye, EyeOff, ExternalLink, Loader2, Copy, ShieldCheck, AlertCircle } from "lucide-react";
import type { DentistData, PublicProfileData } from "../config-client";
import { TagsInput } from "./tags-input";

export function ProfileTab({
  dentist: initialDentist,
  publicProfile: initialPublic,
}: {
  dentist: DentistData;
  publicProfile: PublicProfileData;
}) {
  const router = useRouter();
  const [d, setD] = useState(initialDentist);
  const [p, setP] = useState(initialPublic);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const save = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/config/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: d.fullName,
          specialty: d.specialty || "",
          phone: d.phone || "",
          photoUrl: d.photoUrl || "",
          bio: d.bio || "",
          slug: d.slug || "",
          isPublished: d.isPublished,
          bioPublic: p.bioPublic,
          experience: p.experience,
          languages: p.languages,
          paymentMethods: p.paymentMethods,
          insuranceProviders: p.insuranceProviders,
          education: p.education,
          acceptsInsurance: p.acceptsInsurance,
          emergencyCare: p.emergencyCare,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ type: "ok", text: "Cambios guardados" });
        router.refresh();
      } else {
        setMsg({ type: "err", text: data.message || "Error al guardar" });
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl =
    typeof window !== "undefined" && d.slug
      ? `${window.location.origin}/dentista/${d.slug}`
      : d.slug
      ? `/dentista/${d.slug}`
      : null;

  return (
    <div className="space-y-5">
      {/* Publicación */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Perfil público</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Controla si tu perfil aparece en la búsqueda pública.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setD({ ...d, isPublished: !d.isPublished })}
            className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition ${
              d.isPublished
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {d.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {d.isPublished ? "Publicado" : "Oculto"}
          </button>
        </div>

        {d.verificationStatus !== "verified" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900 mb-4 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Tu cuenta aún no está verificada</p>
              <p className="text-xs opacity-80 mt-0.5">
                Los perfiles verificados generan más confianza y aparecen antes en la búsqueda.
              </p>
            </div>
          </div>
        )}

        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <Field label="URL pública (slug)" hint="Solo letras, números y guiones. Ej: camila-rojas">
            <div className="flex items-center">
              <span className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-l-lg text-sm text-slate-500 border-r-0">
                /dentista/
              </span>
              <input
                value={d.slug || ""}
                onChange={(e) => setD({ ...d, slug: e.target.value })}
                placeholder="tu-nombre"
                className="flex-1 px-3 py-2 border border-slate-200 rounded-r-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </Field>
          {publicUrl && (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => { navigator.clipboard.writeText(publicUrl); setMsg({ type: "ok", text: "Link copiado" }); }}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-1"
                title="Copiar"
              >
                <Copy className="w-4 h-4" />
              </button>
              <a
                href={publicUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 flex items-center gap-1"
                title="Abrir"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Datos básicos */}
      <section className="bg-white rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Información profesional</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre completo *">
            <input
              value={d.fullName}
              onChange={(e) => setD({ ...d, fullName: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Especialidad">
            <input
              value={d.specialty || ""}
              onChange={(e) => setD({ ...d, specialty: e.target.value })}
              placeholder="Ej: Odontología general, Ortodoncia"
              className="input"
            />
          </Field>
          <Field label="Teléfono">
            <input
              value={d.phone || ""}
              onChange={(e) => setD({ ...d, phone: e.target.value })}
              placeholder="+56 9 1234 5678"
              className="input"
            />
          </Field>
          <Field label="Años de experiencia">
            <input
              value={p.experience}
              onChange={(e) => setP({ ...p, experience: e.target.value })}
              placeholder="Ej: 10 años"
              className="input"
            />
          </Field>
        </div>

        <Field label="Foto de perfil (URL)" hint="Pega la URL de tu foto. Próximamente podrás subirla directamente.">
          <input
            value={d.photoUrl || ""}
            onChange={(e) => setD({ ...d, photoUrl: e.target.value })}
            placeholder="https://..."
            className="input"
          />
        </Field>

        <Field label="Bio pública" hint="Este texto aparece en tu perfil público. Háblale directamente a tus pacientes.">
          <textarea
            value={p.bioPublic || d.bio || ""}
            onChange={(e) => setP({ ...p, bioPublic: e.target.value })}
            rows={4}
            className="input resize-none"
            placeholder="Ej: Soy dentista con 10 años de experiencia enfocada en odontología preventiva..."
          />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Idiomas">
            <TagsInput
              value={p.languages}
              onChange={(v) => setP({ ...p, languages: v })}
              placeholder="Español, Inglés..."
              suggestions={["Español", "Inglés", "Portugués", "Francés", "Mapudungun"]}
            />
          </Field>
          <Field label="Formación académica">
            <TagsInput
              value={p.education}
              onChange={(v) => setP({ ...p, education: v })}
              placeholder="U. de Chile 2014..."
            />
          </Field>
          <Field label="Métodos de pago">
            <TagsInput
              value={p.paymentMethods}
              onChange={(v) => setP({ ...p, paymentMethods: v })}
              suggestions={["Efectivo", "Débito", "Crédito", "Transferencia", "Webpay", "Cheque"]}
            />
          </Field>
          <Field label="Seguros / Convenios">
            <TagsInput
              value={p.insuranceProviders}
              onChange={(v) => setP({ ...p, insuranceProviders: v })}
              suggestions={["Banmédica", "Colmena", "Consalud", "Cruz Blanca", "Vida Tres", "Fonasa"]}
            />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <Toggle
            label="Acepta seguros / convenios"
            checked={p.acceptsInsurance}
            onChange={(v) => setP({ ...p, acceptsInsurance: v })}
          />
          <Toggle
            label="Atiende emergencias 24/7"
            checked={p.emergencyCare}
            onChange={(v) => setP({ ...p, emergencyCare: v })}
          />
        </div>
      </section>

      {/* Datos de cuenta (read-only) */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3 text-sm">Datos de cuenta</h2>
        <dl className="grid sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
          <InfoRow k="Email" v={d.email} />
          <InfoRow k="RUT" v={d.rut || "—"} />
          <InfoRow k="Registro SIS" v={d.licenseNumber || "—"} />
          <InfoRow k="Plan" v={d.plan === "trial" ? "Prueba gratuita" : d.plan} />
          <InfoRow
            k="Verificación"
            v={
              d.verificationStatus === "verified" ? (
                <span className="text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verificado
                </span>
              ) : d.verificationStatus === "pending" ? (
                <span className="text-amber-700">Pendiente</span>
              ) : (
                <span className="text-red-700">Rechazado</span>
              )
            }
          />
        </dl>
      </section>

      {/* Guardar */}
      <div className="sticky bottom-4 z-10">
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-3 flex items-center justify-between gap-3">
          {msg ? (
            <p className={`text-sm flex items-center gap-1.5 ${msg.type === "ok" ? "text-emerald-700" : "text-red-700"}`}>
              {msg.type === "ok" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msg.text}
            </p>
          ) : (
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> Los cambios se aplican en tu perfil público
            </p>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 flex-shrink-0"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgb(226 232 240);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        :global(.input:focus) {
          border-color: rgb(59 130 246);
          box-shadow: 0 0 0 3px rgb(219 234 254);
        }
      `}</style>
    </div>
  );
}

function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block mt-4 first:mt-0">
      <span className="text-xs font-medium text-slate-700 mb-1 block">{label}</span>
      {children}
      {hint && <span className="text-[11px] text-slate-500 mt-1 block">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition ${
          checked ? "bg-blue-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition ${
            checked ? "translate-x-5" : ""
          }`}
        />
      </span>
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

function InfoRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <>
      <dt className="text-slate-500 text-xs">{k}</dt>
      <dd className="text-slate-900 font-medium">{v}</dd>
    </>
  );
}
