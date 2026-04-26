"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, GripVertical, ToggleLeft, ToggleRight } from "lucide-react";
import type { ServiceData } from "../config-client";

interface ServiceForm {
  name: string;
  description: string;
  durationMin: number;
  priceCLP: string;
}

const empty: ServiceForm = { name: "", description: "", durationMin: 30, priceCLP: "" };

export function ServicesTab({ initial }: { initial: ServiceData[] }) {
  const [services, setServices] = useState<ServiceData[]>(initial);
  const [form, setForm] = useState<ServiceForm>(empty);
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const resetForm = () => {
    setForm(empty);
    setEditId(null);
    setShowForm(false);
  };

  const openEdit = (s: ServiceData) => {
    setForm({
      name: s.name,
      description: s.description || "",
      durationMin: s.durationMin,
      priceCLP: s.priceCLP != null ? String(s.priceCLP) : "",
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setMsg(null);
    try {
      const body = {
        name: form.name,
        description: form.description || "",
        durationMin: form.durationMin,
        priceCLP: form.priceCLP ? parseInt(form.priceCLP) : null,
      };

      if (editId) {
        const res = await fetch(`/api/config/services/${editId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
          setServices((prev) =>
            prev.map((s) => (s.id === editId ? { ...s, ...body } : s))
          );
          setMsg({ type: "ok", text: "Servicio actualizado" });
          resetForm();
        } else {
          setMsg({ type: "err", text: data.message || "Error" });
        }
      } else {
        const res = await fetch("/api/config/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...body, order: services.length }),
        });
        const data = await res.json();
        if (res.ok) {
          setServices((prev) => [...prev, data]);
          setMsg({ type: "ok", text: "Servicio creado" });
          resetForm();
        } else {
          setMsg({ type: "err", text: data.error || data.message || "Error" });
        }
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: ServiceData) => {
    try {
      const res = await fetch(`/api/config/services/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !s.active }),
      });
      if (res.ok) {
        setServices((prev) =>
          prev.map((x) => (x && x.id === s.id ? { ...x, active: !x.active } : x))
        );
      }
    } catch {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este servicio?")) return;
    try {
      const res = await fetch(`/api/config/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        setServices((prev) => prev.filter((s) => s && s.id !== id));
        setMsg({ type: "ok", text: "Servicio eliminado" });
      }
    } catch {
      setMsg({ type: "err", text: "Error al eliminar" });
    }
  };

  const formatPrice = (v: number | null) =>
    v != null ? `$${v.toLocaleString("es-CL")}` : "Sin precio";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Servicios</h2>
          <p className="text-sm text-slate-500">
            Configura los servicios que ofreces y sus precios
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Agregar servicio
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
            {editId ? "Editar servicio" : "Nuevo servicio"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ej: Limpieza dental"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Duración (minutos) *
              </label>
              <input
                type="number"
                min={5}
                max={480}
                value={form.durationMin}
                onChange={(e) =>
                  setForm({ ...form, durationMin: parseInt(e.target.value) || 30 })
                }
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción
              </label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descripción breve del servicio"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Precio (CLP)
              </label>
              <input
                type="number"
                min={0}
                value={form.priceCLP}
                onChange={(e) => setForm({ ...form, priceCLP: e.target.value })}
                placeholder="Ej: 25000"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
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
              {editId ? "Guardar cambios" : "Crear servicio"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {services.length === 0 && !showForm ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-500 text-sm">
            Aún no tienes servicios configurados
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.filter(Boolean).map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-3 transition ${
                s.active
                  ? "border-slate-200"
                  : "border-slate-200 opacity-60"
              }`}
            >
              <GripVertical className="w-4 h-4 text-slate-300 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 text-sm truncate">
                    {s.name}
                  </span>
                  {!s.active && (
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{s.durationMin} min</span>
                  <span>{formatPrice(s.priceCLP)}</span>
                  {s.description && (
                    <span className="truncate">{s.description}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleActive(s)}
                  title={s.active ? "Desactivar" : "Activar"}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                >
                  {s.active ? (
                    <ToggleRight className="w-5 h-5 text-blue-600" />
                  ) : (
                    <ToggleLeft className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={() => openEdit(s)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 transition text-slate-400"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
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
