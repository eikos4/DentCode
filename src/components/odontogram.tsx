"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/** Notación FDI: cuadrante (1-4) + diente (1-8). */
const QUADRANTS = [
  [18, 17, 16, 15, 14, 13, 12, 11],
  [21, 22, 23, 24, 25, 26, 27, 28],
  [48, 47, 46, 45, 44, 43, 42, 41],
  [31, 32, 33, 34, 35, 36, 37, 38],
];

const CONDITIONS = [
  { value: "", label: "— Sano" },
  { value: "caries", label: "Caries" },
  { value: "filling", label: "Obturación" },
  { value: "crown", label: "Corona" },
  { value: "endo", label: "Endodoncia" },
  { value: "missing", label: "Ausente" },
  { value: "implant", label: "Implante" },
];

const COLOR: Record<string, string> = {
  caries: "bg-red-500 text-white",
  filling: "bg-blue-500 text-white",
  crown: "bg-yellow-500 text-white",
  endo: "bg-purple-500 text-white",
  missing: "bg-zinc-400 text-white line-through",
  implant: "bg-emerald-600 text-white",
};

export function Odontogram({
  patientId,
  records,
}: {
  patientId: string;
  records: { toothCode: string; condition: string }[];
}) {
  const [state, setState] = useState<Record<string, string>>(() => {
    const m: Record<string, string> = {};
    for (const r of records) m[r.toothCode] = r.condition;
    return m;
  });
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  async function setCondition(tooth: string, condition: string) {
    setState((s) => ({ ...s, [tooth]: condition }));
    await fetch(`/api/patients/${patientId}/teeth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toothCode: tooth, condition }),
    });
    router.refresh();
  }

  return (
    <div>
      <div className="grid grid-cols-8 gap-1 max-w-xl">
        {QUADRANTS.flat().map((t, i) => {
          const code = String(t);
          const cond = state[code];
          const isSel = selected === code;
          return (
            <button
              key={code}
              onClick={() => setSelected(code)}
              className={`aspect-square rounded-md border text-xs font-mono ${COLOR[cond] ?? "bg-white"} ${isSel ? "ring-2 ring-primary" : ""} ${i === 7 || i === 23 ? "mr-2" : ""}`}
              title={code}
            >
              {code}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-4 p-3 rounded-md border bg-muted/50 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium">Diente {selected}:</span>
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              onClick={() => setCondition(selected, c.value)}
              className={`text-xs px-2 py-1 rounded border ${state[selected] === c.value ? "bg-primary text-white border-primary" : "bg-white"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-3 text-xs">
        {Object.entries(COLOR).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`w-3 h-3 rounded-sm ${c}`} /> {k}
          </span>
        ))}
      </div>
    </div>
  );
}
