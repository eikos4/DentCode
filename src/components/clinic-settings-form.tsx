"use client";
import { useState } from "react";
import { Edit, Save, X, Loader2, CheckCircle } from "lucide-react";

interface ClinicData {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  commune: string | null;
  region: string | null;
  rut: string | null;
}

export function ClinicSettingsForm({ clinic }: { clinic: ClinicData }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: clinic.name,
    phone: clinic.phone ?? "",
    email: clinic.email ?? "",
    address: clinic.address ?? "",
    city: clinic.city ?? "",
    commune: clinic.commune ?? "",
    region: clinic.region ?? "",
  });

  const set = (key: string) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function cancel() {
    setForm({
      name: clinic.name,
      phone: clinic.phone ?? "",
      email: clinic.email ?? "",
      address: clinic.address ?? "",
      city: clinic.city ?? "",
      commune: clinic.commune ?? "",
      region: clinic.region ?? "",
    });
    setEditing(false);
    setError("");
  }

  async function save() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const Field = ({
    label,
    fieldKey,
    type = "text",
    placeholder = "",
    disabled = false,
  }: {
    label: string;
    fieldKey: keyof typeof form;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[fieldKey]}
        onChange={set(fieldKey)}
        disabled={!editing || disabled}
        placeholder={editing ? placeholder : "—"}
        className={`w-full px-4 py-3 border rounded-lg transition ${
          editing && !disabled
            ? "border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            : "border-slate-200 bg-slate-50 text-slate-700 cursor-default"
        }`}
      />
    </div>
  );

  return (
    <div className="space-y-1">
      {/* Barra de acciones */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 h-8">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
              <CheckCircle className="w-4 h-4" /> Cambios guardados
            </span>
          )}
          {error && (
            <span className="text-sm text-red-600">{error}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={cancel}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                <X className="w-3.5 h-3.5" /> Cancelar
              </button>
              <button
                onClick={save}
                disabled={loading || !form.name}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              <Edit className="w-3.5 h-3.5" /> Editar
            </button>
          )}
        </div>
      </div>

      {/* Campos */}
      <div className="grid md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nombre de la clínica {editing && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={set("name")}
            disabled={!editing}
            className={`w-full px-4 py-3 border rounded-lg transition ${
              editing
                ? "border-slate-300 bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                : "border-slate-200 bg-slate-50 text-slate-700 cursor-default"
            }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">RUT</label>
          <input
            type="text"
            value={clinic.rut ?? "—"}
            disabled
            className="w-full px-4 py-3 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 cursor-default"
          />
          {editing && <p className="text-xs text-slate-400 mt-1">El RUT no se puede modificar.</p>}
        </div>

        <Field label="Email de contacto" fieldKey="email" type="email" placeholder="contacto@clinica.cl" />
        <Field label="Teléfono" fieldKey="phone" placeholder="+56 2 2345 6789" />
        <div className="md:col-span-2">
          <Field label="Dirección" fieldKey="address" placeholder="Av. Providencia 1234" />
        </div>
        <Field label="Ciudad" fieldKey="city" placeholder="Santiago" />
        <Field label="Comuna" fieldKey="commune" placeholder="Providencia" />
        <Field label="Región" fieldKey="region" placeholder="Metropolitana" />
      </div>
    </div>
  );
}
