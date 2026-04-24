"use client";
import { useState } from "react";
import { Loader2, Save, Clock } from "lucide-react";
import type { ScheduleBlock } from "../config-client";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function buildDefaultBlocks(existing: ScheduleBlock[]): ScheduleBlock[] {
  return Array.from({ length: 7 }, (_, i) => {
    const found = existing.find((b) => b.dayOfWeek === i);
    return found
      ? { ...found }
      : {
          dayOfWeek: i,
          openTime: "09:00",
          closeTime: "18:00",
          slotMinutes: 30,
          enabled: false,
        };
  });
}

export function ScheduleTab({ initial }: { initial: ScheduleBlock[] }) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() =>
    buildDefaultBlocks(initial)
  );
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const update = (day: number, patch: Partial<ScheduleBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.dayOfWeek === day ? { ...b, ...patch } : b))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/config/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocks }),
      });
      if (res.ok) {
        setMsg({ type: "ok", text: "Horario guardado correctamente" });
      } else {
        const data = await res.json();
        setMsg({ type: "err", text: data.message || "Error al guardar" });
      }
    } catch {
      setMsg({ type: "err", text: "Error de conexión" });
    } finally {
      setSaving(false);
    }
  };

  // Reorder: Mon-Sun
  const ordered = [1, 2, 3, 4, 5, 6, 0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Horario semanal</h2>
          <p className="text-sm text-slate-500">
            Define tus horarios de atención para cada día de la semana
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Guardar horario
        </button>
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

      <div className="space-y-2">
        {ordered.map((dayIdx) => {
          const b = blocks[dayIdx];
          return (
            <div
              key={dayIdx}
              className={`flex flex-wrap items-center gap-3 bg-white border rounded-xl px-4 py-3 transition ${
                b.enabled ? "border-blue-200 bg-blue-50/30" : "border-slate-200"
              }`}
            >
              {/* Toggle + Day name */}
              <label className="flex items-center gap-3 min-w-[150px] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={b.enabled}
                  onChange={(e) => update(dayIdx, { enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span
                  className={`text-sm font-medium ${
                    b.enabled ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  {DAY_NAMES[dayIdx]}
                </span>
              </label>

              {b.enabled ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="time"
                      value={b.openTime}
                      onChange={(e) => update(dayIdx, { openTime: e.target.value })}
                      className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <span className="text-slate-400 text-sm">a</span>
                    <input
                      type="time"
                      value={b.closeTime}
                      onChange={(e) => update(dayIdx, { closeTime: e.target.value })}
                      className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-slate-500">Bloques de</span>
                    <select
                      value={b.slotMinutes}
                      onChange={(e) =>
                        update(dayIdx, { slotMinutes: parseInt(e.target.value) })
                      }
                      className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    >
                      <option value={15}>15 min</option>
                      <option value={20}>20 min</option>
                      <option value={30}>30 min</option>
                      <option value={45}>45 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </div>
                </div>
              ) : (
                <span className="text-sm text-slate-400 italic">Cerrado</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-1">
          ¿Cómo funciona?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Los horarios que configures aquí se usarán para generar los bloques
          disponibles en tu perfil público. Los pacientes solo podrán agendar
          citas dentro de estos horarios. Si un día está desactivado, no
          aparecerá como disponible.
        </p>
      </div>
    </div>
  );
}
