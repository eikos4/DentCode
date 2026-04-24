"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react";
import type { LocationData } from "../config-client";

interface LocationForm {
  name: string;
  address: string;
  commune: string;
  city: string;
  region: string;
  phone: string;
}

const empty: LocationForm = {
  name: "",
  address: "",
  commune: "",
  city: "",
  region: "",
  phone: "",
};

const REGIONES = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana",
  "O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén",
  "Magallanes",
];

export function LocationsTab({ initial }: { initial: LocationData[] }) {
  const [locations, setLocations] = useState<LocationData[]>(initial);
  const [form, setForm] = useState<LocationForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (l: LocationData) => {
    setForm({
      name: l.name,
      address: l.address || "",
      commune: l.commune || "",
      city: l.city || "",
      region: l.region || "",
      phone: l.phone || "",
    });
    setEditId(l.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        name: form.name,
        address: form.address || "",
        commune: form.commune || "",
        city: form.city || "",
        region: form.region || "",
        phone: form.phone || "",
      };

      if (editId) {
        const res = await fetch(`/api/config/locations/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
          setLocations((prev) =>
            prev.map((l) =>
              l.id === editId ? { ...l, ...body } : l
            )
          );
          setMsg({ type: "ok", text: "Sede actualizada" });
          resetForm();
        } else {
          setMsg({ type: "err", text: data.message || "Error" });
        }
      } else {
        const res = await fetch("/api/config/locations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
          setLocations((prev) => [...prev, data.location]);
          setMsg({ type: "ok", text: "Sede creada" });
          resetForm();
        } else {
          setMsg({ type: "err", text: data.message || "Error" });
        }
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta sede?")) return;
    try {
      const res = await fetch(`/api/config/locations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLocations((prev) => prev.filter((l) => l.id !== id));
        setMsg({ type: "ok", text: "Sede eliminada" });
      }
    } catch {
      setMsg({ type: "err", text: "Error al eliminar" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sedes</h2>
          <p className="text-sm text-slate-500">
            Administra las ubicaciones de tus consultas
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Agregar sede
          </button>
        )}
      </div>

      {msg && (
        <div
          className={`px-4 py-2 rounded-lg text-sm ${
            msg.type === "ok"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="font-medium text-slate-900">
            {editId ? "Editar sede" : "Nueva sede"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Consulta principal"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+56 9 1234 5678"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Dirección
            </label>
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ej: Av. Providencia 1234, Of. 501"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Comuna
              </label>
              <input
                value={form.commune}
                onChange={(e) => setForm({ ...form, commune: e.target.value })}
                placeholder="Ej: Providencia"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ciudad
              </label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ej: Santiago"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Región
              </label>
              <select
                value={form.region}
                onChange={(e) => setForm({ ...form, region: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="">Seleccionar...</option>
                {REGIONES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editId ? "Guardar cambios" : "Crear sede"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {locations.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">
            Aún no tienes sedes configuradas
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((l) => (
            <div
              key={l.id}
              className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3"
            >
              <MapPin className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-medium text-slate-900 text-sm">
                  {l.name}
                </span>
                <div className="text-xs text-slate-500 mt-0.5 space-y-0.5">
                  {l.address && <p>{l.address}</p>}
                  <p>
                    {[l.commune, l.city, l.region].filter(Boolean).join(", ") ||
                      "Sin ubicación"}
                  </p>
                  {l.phone && <p>{l.phone}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(l)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(l.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
