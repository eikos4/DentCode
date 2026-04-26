"use client";

import React, { useState } from "react";
import { RotateCcw, ChevronRight, ChevronLeft, Camera, FileText, Info, X } from "lucide-react";

type ToothStatus = "healthy" | "caries" | "filling" | "missing" | "treatment" | "root-canal" | "implant" | "crown";

interface Tooth {
  number: number;
  status: ToothStatus;
  internalNotes?: string;
  radiographyUrl?: string;
}

interface Odontogram3DProps {
  patientName: string;
  teeth?: Record<number, Tooth>;
  onToothClick?: (tooth: Tooth) => void;
}

const statusOverlay: Record<ToothStatus, { ring: string; dot: string; label: string }> = {
  healthy:    { ring: "none",           dot: "none",      label: "Sano"           },
  caries:     { ring: "#ef4444",        dot: "#ef4444",   label: "Caries"         },
  filling:    { ring: "#f59e0b",        dot: "#f59e0b",   label: "Restauración"   },
  missing:    { ring: "#94a3b8",        dot: "#94a3b8",   label: "Ausente"        },
  treatment:  { ring: "#3b82f6",        dot: "#3b82f6",   label: "Tratamiento"    },
  "root-canal":{ ring: "#8b5cf6",       dot: "#8b5cf6",   label: "Endodoncia"     },
  implant:    { ring: "#06b6d4",        dot: "#06b6d4",   label: "Implante"       },
  crown:      { ring: "#eab308",        dot: "#eab308",   label: "Corona"         },
};

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

// SVG paths per tooth type (molar / premolar / canine / incisor)
function getToothSVG(num: number, status: ToothStatus, isSelected: boolean, hasData: boolean): React.ReactNode {
  const isMolar    = [18,17,16,26,27,28,48,47,46,36,37,38].includes(num);
  const isPremolar = [15,14,24,25,45,44,34,35].includes(num);
  const isCanine   = [13,23,43,33].includes(num);
  const isMissing  = status === "missing";

  const toothFill = isMissing ? "url(#missingGrad)" : "url(#toothGrad)";
  const gloss     = isMissing ? "none" : "url(#glossGrad)";
  const shadow    = isSelected ? "drop-shadow(0 0 8px rgba(59,130,246,0.7))" : "drop-shadow(0 2px 6px rgba(0,0,0,0.18))";
  const ov        = statusOverlay[status];

  const shape = isMolar
    ? <ellipse cx="24" cy="28" rx="16" ry="20" fill={toothFill} style={{ filter: shadow }} />
    : isPremolar
    ? <ellipse cx="24" cy="30" rx="13" ry="18" fill={toothFill} style={{ filter: shadow }} />
    : isCanine
    ? <path d="M24,8 L34,20 L34,42 L24,52 L14,42 L14,20 Z" fill={toothFill} style={{ filter: shadow }} />
    : <path d="M24,12 L32,20 L32,44 L24,52 L16,44 L16,20 Z" fill={toothFill} style={{ filter: shadow }} />;

  const glossShape = isMolar
    ? <ellipse cx="18" cy="20" rx="8" ry="10" fill={gloss} />
    : isPremolar
    ? <ellipse cx="18" cy="22" rx="6" ry="9" fill={gloss} />
    : <ellipse cx="19" cy="20" rx="5" ry="9" fill={gloss} />;

  const innerLine = (isMolar || isPremolar) && !isMissing
    ? <line x1="24" y1="14" x2="24" y2="46" stroke="rgba(0,0,0,0.06)" strokeWidth="1.5" />
    : null;

  return (
    <svg viewBox="0 0 48 60" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="toothGrad" cx="38%" cy="32%" r="65%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="55%" stopColor="#e8eef4" />
          <stop offset="100%" stopColor="#c8d4e0" />
        </radialGradient>
        <radialGradient id="missingGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </radialGradient>
        <radialGradient id="glossGrad" cx="30%" cy="25%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>

      {shape}
      {innerLine}
      {glossShape}

      {/* Status overlay ring */}
      {ov.ring !== "none" && (
        <>
          <circle cx="24" cy="28" r="20" fill="none" stroke={ov.ring} strokeWidth="2.5" opacity="0.8" strokeDasharray={status === "missing" ? "4 3" : "none"} />
          {status !== "healthy" && (
            <circle cx="24" cy="28" r="6" fill={ov.dot} opacity="0.9" />
          )}
        </>
      )}

      {/* Holographic data ring if selected or has radiography */}
      {(isSelected || hasData) && !isMissing && (
        <circle cx="24" cy="28" r="22"
          fill="none"
          stroke={isSelected ? "#3b82f6" : "#60a5fa"}
          strokeWidth={isSelected ? "2" : "1.2"}
          opacity={isSelected ? "1" : "0.5"}
          strokeDasharray={isSelected ? "none" : "3 2"}
        />
      )}

      {/* Implant screw visual */}
      {status === "implant" && (
        <rect x="21" y="36" width="6" height="18" rx="3" fill="#94a3b8" opacity="0.7" />
      )}

      {/* Bracket visual */}
      {status === "treatment" && (
        <rect x="18" y="24" width="12" height="7" rx="1.5" fill="#3b82f6" opacity="0.5" />
      )}
    </svg>
  );
}

export function Odontogram3D({ patientName, teeth: initialTeeth, onToothClick }: Odontogram3DProps) {
  const [selected, setSelected] = useState<Tooth | null>(null);
  const [detailTab, setDetailTab] = useState<"diagnostico" | "radiografia" | "notas">("diagnostico");

  const [teeth] = useState<Record<number, Tooth>>(() => {
    if (initialTeeth) return initialTeeth;
    const def: Record<number, Tooth> = {};
    [...UPPER, ...LOWER].forEach(n => {
      def[n] = {
        number: n, status: "healthy",
        ...(n === 16 && { status: "caries", radiographyUrl: "https://www.colgate.com/content/dam/cp-sites/oral-care/oral-care-center/en-us/articles/conditions/cavities/caries-detection-x-ray.jpg", internalNotes: "Caries interproximal profunda." }),
        ...(n === 21 && { status: "filling", internalNotes: "Restauración de resina en buen estado." }),
        ...(n === 46 && { status: "implant", internalNotes: "Implante osteointegrado. Control cada 6 meses." }),
        ...(n === 25 && { status: "crown", radiographyUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTX1", internalNotes: "Corona cerámica bien adaptada." }),
      };
    });
    return def;
  });

  const handleClick = (tooth: Tooth) => {
    setSelected(tooth);
    setDetailTab("diagnostico");
    onToothClick?.(tooth);
  };

  const renderRow = (nums: number[]) => (
    <div className="flex items-end gap-1">
      {nums.map((n) => {
        const tooth = teeth[n];
        if (!tooth) return null;
        const isSelected = selected?.number === n;
        const hasData = !!tooth.radiographyUrl;
        const isMissing = tooth.status === "missing";
        return (
          <div key={n} className="flex flex-col items-center" style={{ width: 44 }}>
            <div
              className="relative cursor-pointer transition-all duration-200"
              style={{
                width: 44,
                height: 52,
                transform: isSelected ? "scale(1.22) translateY(-6px)" : "scale(1)",
                opacity: isMissing ? 0.4 : 1,
              }}
              onClick={() => handleClick(tooth)}
            >
              {getToothSVG(n, tooth.status, isSelected, hasData)}
              {hasData && !isSelected && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <span className={`text-[10px] mt-1 font-bold transition-colors ${isSelected ? "text-blue-600" : "text-slate-400"}`}>{n}</span>
          </div>
        );
      })}
    </div>
  );

  const ov = selected ? statusOverlay[selected.status] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            Diagnóstico Visual Interactivo
            <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-widest">3D v2.0</span>
          </h2>
          <p className="text-sm text-slate-400 font-medium">Paciente: <span className="text-slate-700 font-bold">{patientName}</span></p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse inline-block" /> Con radiografía</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" /> Caries</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> Rest.</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Implante</span>
        </div>
      </div>

      {/* Main arch view */}
      <div
        className="relative rounded-[2rem] border border-slate-100 overflow-hidden flex flex-col items-center gap-8 py-10 px-6"
        style={{
          background: "radial-gradient(ellipse at 50% 30%, #f0f6ff 0%, #f8fafc 60%, #eef2f8 100%)",
          boxShadow: "inset 0 2px 40px rgba(148,163,184,0.10), 0 8px 40px rgba(0,0,0,0.06)",
        }}
      >
        {/* subtle floor reflection */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 90%, rgba(148,163,184,0.13) 0%, transparent 70%)" }} />

        {renderRow(UPPER)}

        <div className="w-3/4 h-px relative flex items-center justify-center" style={{ background: "linear-gradient(90deg, transparent, #cbd5e1 30%, #cbd5e1 70%, transparent)" }}>
          <span className="absolute bg-white px-3 text-[9px] font-black text-slate-300 tracking-[0.25em] uppercase">Línea de Oclusión</span>
        </div>

        {renderRow(LOWER)}

        {/* Holographic UI lines (decorative) */}
        <div className="absolute top-6 right-8 flex flex-col items-end gap-1 pointer-events-none opacity-40">
          <div className="w-20 h-1 rounded bg-blue-300" />
          <div className="w-14 h-0.5 rounded bg-blue-200" />
          <div className="w-10 h-0.5 rounded bg-blue-200" />
        </div>
        <div className="absolute bottom-6 left-8 flex flex-col gap-1 pointer-events-none opacity-40">
          <div className="w-16 h-1 rounded bg-blue-300" />
          <div className="w-10 h-0.5 rounded bg-blue-200" />
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="rounded-3xl border border-slate-200 shadow-2xl overflow-hidden bg-white animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between px-8 pt-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg" style={{ background: ov?.ring !== "none" ? ov?.ring + "22" : "#f1f5f9", color: ov?.ring !== "none" ? ov?.ring : "#64748b" }}>
                {selected.number}
              </div>
              <div>
                <p className="font-black text-slate-900 text-base">Diente {selected.number}</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: ov?.ring !== "none" ? ov?.ring + "22" : "#f1f5f9", color: ov?.ring !== "none" ? ov?.ring : "#64748b" }}>
                  {ov?.label}
                </span>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-slate-100 transition"><X className="w-4 h-4 text-slate-400" /></button>
          </div>

          <div className="flex border-b border-slate-100 px-8">
            {([["diagnostico","Diagnóstico", FileText], ["radiografia","Radiografía", Camera], ["notas","Notas", Info]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setDetailTab(id)} className={`flex items-center gap-2 px-5 py-4 text-sm font-bold border-b-2 transition-all ${detailTab === id ? "border-blue-500 text-blue-600" : "border-transparent text-slate-400"}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {detailTab === "diagnostico" && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estado Clínico</p>
                  <p className="text-slate-700 font-medium">
                    {selected.status === "healthy" && "Diente en buen estado. Continuar con controles periódicos."}
                    {selected.status === "caries" && "Se detectó lesión cariosa. Se recomienda restauración con resina o amalgama según extensión."}
                    {selected.status === "filling" && "Restauración presente en buen estado. Monitorear bordes y filtración."}
                    {selected.status === "missing" && "Pieza dentaria ausente. Evaluar rehabilitación con implante o prótesis."}
                    {selected.status === "treatment" && "Pieza en proceso de tratamiento. Seguir el plan clínico activo."}
                    {selected.status === "root-canal" && "Endodoncia realizada. Se recomienda protección con corona."}
                    {selected.status === "implant" && "Implante osteointegrado. Mantener higiene periimplantaria y controles semestrales."}
                    {selected.status === "crown" && "Corona protésica instalada. Verificar ajuste oclusal y márgenes."}
                  </p>
                </div>
              </div>
            )}
            {detailTab === "radiografia" && (
              <div className="flex items-center justify-center min-h-[180px]">
                {selected.radiographyUrl ? (
                  <div className="rounded-2xl overflow-hidden border-4 border-slate-900 shadow-2xl max-w-sm w-full">
                    <img src={selected.radiographyUrl} alt="Radiografía" className="w-full object-cover" style={{ filter: "contrast(1.1) brightness(0.95)" }} />
                  </div>
                ) : (
                  <div className="text-center p-10 rounded-2xl border-2 border-dashed border-slate-200 w-full">
                    <Camera className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400 font-bold text-sm">Sin radiografía vinculada</p>
                  </div>
                )}
              </div>
            )}
            {detailTab === "notas" && (
              <div className="space-y-4">
                <textarea
                  className="w-full h-36 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-700 font-medium resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
                  placeholder="Agregar notas clínicas..."
                  defaultValue={selected.internalNotes || ""}
                />
                <div className="flex justify-end">
                  <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm">Guardar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Sanos", count: Object.values(teeth).filter(t => t.status === "healthy").length, color: "#10b981" },
          { label: "Con caries", count: Object.values(teeth).filter(t => t.status === "caries").length, color: "#ef4444" },
          { label: "Restaurados", count: Object.values(teeth).filter(t => ["filling","crown"].includes(t.status)).length, color: "#f59e0b" },
          { label: "Implantes", count: Object.values(teeth).filter(t => t.status === "implant").length, color: "#06b6d4" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
            <span className="text-sm font-black" style={{ color: s.color }}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Odontogram3D;
