"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { RotateCcw, ZoomIn, ZoomOut, Move, Info, Stethoscope } from "lucide-react";

type ToothStatus = "healthy" | "caries" | "filling" | "missing" | "treatment" | "root-canal";

interface Tooth {
  number: number;
  status: ToothStatus;
  position: { x: number; y: number; z: number; rotateY: number };
}

interface Jaw3DProps {
  patientName: string;
  onToothClick?: (tooth: Tooth) => void;
}

const statusConfig: Record<ToothStatus, { color: string; bg: string; label: string; description: string }> = {
  healthy: { color: "#10b981", bg: "bg-emerald-500", label: "Sano", description: "Diente en perfecto estado" },
  caries: { color: "#ef4444", bg: "bg-red-500", label: "Caries", description: "Cavidad detectada, requiere tratamiento" },
  filling: { color: "#f59e0b", bg: "bg-amber-500", label: "Restauración", description: "Tiene empaste o restauración" },
  missing: { color: "#6b7280", bg: "bg-gray-500", label: "Ausente", description: "Diente extraído o no presente" },
  treatment: { color: "#3b82f6", bg: "bg-blue-500", label: "En tratamiento", description: "Procedimiento en curso" },
  "root-canal": { color: "#8b5cf6", bg: "bg-violet-500", label: "Endodoncia", description: "Tratamiento de conducto realizado" },
};

// Posiciones 3D de los dientes en el arco (coordenadas polares ajustadas)
const teethPositions: Record<number, { angle: number; radius: number; y: number; jaw: "upper" | "lower" }> = {
  // Arcada superior derecha
  18: { angle: -75, radius: 140, y: -30, jaw: "upper" },
  17: { angle: -60, radius: 145, y: -35, jaw: "upper" },
  16: { angle: -45, radius: 150, y: -40, jaw: "upper" },
  15: { angle: -30, radius: 145, y: -35, jaw: "upper" },
  14: { angle: -15, radius: 140, y: -30, jaw: "upper" },
  13: { angle: 0, radius: 135, y: -25, jaw: "upper" },
  12: { angle: 15, radius: 130, y: -20, jaw: "upper" },
  11: { angle: 30, radius: 125, y: -15, jaw: "upper" },
  // Arcada superior izquierda
  21: { angle: 45, radius: 125, y: -15, jaw: "upper" },
  22: { angle: 60, radius: 130, y: -20, jaw: "upper" },
  23: { angle: 75, radius: 135, y: -25, jaw: "upper" },
  24: { angle: 90, radius: 140, y: -30, jaw: "upper" },
  25: { angle: 105, radius: 145, y: -35, jaw: "upper" },
  26: { angle: 120, radius: 150, y: -40, jaw: "upper" },
  27: { angle: 135, radius: 145, y: -35, jaw: "upper" },
  28: { angle: 150, radius: 140, y: -30, jaw: "upper" },
  // Arcada inferior izquierda
  31: { angle: 165, radius: 140, y: 30, jaw: "lower" },
  32: { angle: 150, radius: 135, y: 35, jaw: "lower" },
  33: { angle: 135, radius: 130, y: 40, jaw: "lower" },
  34: { angle: 120, radius: 135, y: 45, jaw: "lower" },
  35: { angle: 105, radius: 140, y: 50, jaw: "lower" },
  36: { angle: 90, radius: 145, y: 55, jaw: "lower" },
  37: { angle: 75, radius: 140, y: 50, jaw: "lower" },
  38: { angle: 60, radius: 135, y: 45, jaw: "lower" },
  // Arcada inferior derecha
  41: { angle: 45, radius: 135, y: 45, jaw: "lower" },
  42: { angle: 30, radius: 130, y: 40, jaw: "lower" },
  43: { angle: 15, radius: 135, y: 35, jaw: "lower" },
  44: { angle: 0, radius: 140, y: 30, jaw: "lower" },
  45: { angle: -15, radius: 145, y: 25, jaw: "lower" },
  46: { angle: -30, radius: 150, y: 20, jaw: "lower" },
  47: { angle: -45, radius: 145, y: 25, jaw: "lower" },
  48: { angle: -60, radius: 140, y: 30, jaw: "lower" },
};

// Formas SVG según tipo de diente
const toothShapes: Record<string, string> = {
  molar: "M0,-20 L15,-18 L22,-8 L22,8 L15,18 L0,20 L-15,18 L-22,8 L-22,-8 L-15,-18 Z",
  premolar: "M0,-18 L12,-15 L18,-5 L18,5 L12,15 L0,18 L-12,15 L-18,5 L-18,-5 L-12,-15 Z",
  canine: "M0,-25 L8,-20 L12,0 L10,18 L0,25 L-10,18 L-12,0 L-8,-20 Z",
  incisor: "M0,-22 L10,-18 L12,0 L10,20 L0,25 L-10,20 L-12,0 L-10,-18 Z",
};

function getToothShape(number: number): string {
  if ([16, 17, 18, 26, 27, 28, 36, 37, 38, 46, 47, 48].includes(number)) return toothShapes.molar;
  if ([14, 15, 24, 25, 34, 35, 44, 45].includes(number)) return toothShapes.premolar;
  if ([13, 23, 33, 43].includes(number)) return toothShapes.canine;
  return toothShapes.incisor;
}

function getToothName(number: number): string {
  const names: Record<number, string> = {
    11: "Incisivo Central Sup Der", 21: "Incisivo Central Sup Izq",
    12: "Incisivo Lateral Sup Der", 22: "Incisivo Lateral Sup Izq",
    13: "Canino Sup Der", 23: "Canino Sup Izq",
    14: "1er Premolar Sup Der", 24: "1er Premolar Sup Izq",
    15: "2do Premolar Sup Der", 25: "2do Premolar Sup Izq",
    16: "1er Molar Sup Der", 26: "1er Molar Sup Izq",
    17: "2do Molar Sup Der", 27: "2do Molar Sup Izq",
    18: "3er Molar Sup Der", 28: "3er Molar Sup Izq",
    31: "Incisivo Central Inf Izq", 41: "Incisivo Central Inf Der",
    32: "Incisivo Lateral Inf Izq", 42: "Incisivo Lateral Inf Der",
    33: "Canino Inf Izq", 43: "Canino Inf Der",
    34: "1er Premolar Inf Izq", 44: "1er Premolar Inf Der",
    35: "2do Premolar Inf Izq", 45: "2do Premolar Inf Der",
    36: "1er Molar Inf Izq", 46: "1er Molar Inf Der",
    37: "2do Molar Inf Izq", 47: "2do Molar Inf Der",
    38: "3er Molar Inf Izq", 48: "3er Molar Inf Der",
  };
  return names[number] || `Diente ${number}`;
}

export function Jaw3D({ patientName, onToothClick }: Jaw3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 15, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);

  // Inicializar dientes
  const [teeth, setTeeth] = useState<Tooth[]>(() => {
    return Object.entries(teethPositions).map(([num, pos]) => ({
      number: parseInt(num),
      status: "healthy",
      position: {
        x: pos.radius * Math.cos((pos.angle * Math.PI) / 180),
        y: pos.y,
        z: pos.radius * Math.sin((pos.angle * Math.PI) / 180),
        rotateY: pos.angle - 90,
      },
    }));
  });

  // Auto-rotación
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotation(prev => ({ ...prev, y: prev.y + 0.5 }));
    }, 50);
    return () => clearInterval(interval);
  }, [autoRotate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
    setAutoRotate(false);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouse.x;
    const deltaY = e.clientY - lastMouse.y;
    setRotation(prev => ({
      x: Math.max(-45, Math.min(45, prev.x - deltaY * 0.5)),
      y: prev.y + deltaX * 0.5,
      z: prev.z,
    }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [isDragging, lastMouse]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.5, Math.min(2, prev - e.deltaY * 0.001)));
  }, []);

  const handleToothClick = (tooth: Tooth) => {
    setSelectedTooth(tooth.number);
    onToothClick?.(tooth);
  };

  const updateToothStatus = (number: number, status: ToothStatus) => {
    setTeeth(prev => prev.map(t => t.number === number ? { ...t, status } : t));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Odontograma 3D Interactivo</h2>
          <p className="text-sm text-slate-500">Paciente: {patientName}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
              autoRotate ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <RotateCcw className={`w-3 h-3 ${autoRotate ? "animate-spin" : ""}`} />
            Auto-rotar
          </button>
          <button
            onClick={() => { setRotation({ x: 15, y: 0, z: 0 }); setZoom(1); }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
          >
            Reset Vista
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
          <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="p-1.5 hover:bg-slate-100 rounded">
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Move className="w-4 h-4" />
          <span>Arrastra para rotar · Scroll para zoom</span>
        </div>
      </div>

      {/* Vista 3D */}
      <div
        ref={containerRef}
        className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden cursor-move select-none"
        style={{ height: 500, perspective: 1200 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Efecto de fondo */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-500 rounded-full blur-3xl" />
        </div>

        {/* Grid de referencia */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Mandíbula 3D */}
        <div
          className="absolute inset-0 flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
            transformStyle: "preserve-3d",
          }}
        >
          {/* Arcada Superior */}
          <div
            className="absolute"
            style={{
              transform: "translateY(-80px) rotateX(10deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {teeth.filter(t => teethPositions[t.number].jaw === "upper").map(tooth => (
              <Tooth3D
                key={tooth.number}
                tooth={tooth}
                isSelected={selectedTooth === tooth.number}
                isHovered={hoveredTooth === tooth.number}
                onClick={() => handleToothClick(tooth)}
                onHover={() => setHoveredTooth(tooth.number)}
                onLeave={() => setHoveredTooth(null)}
              />
            ))}
          </div>

          {/* Arcada Inferior */}
          <div
            className="absolute"
            style={{
              transform: "translateY(80px) rotateX(-10deg)",
              transformStyle: "preserve-3d",
            }}
          >
            {teeth.filter(t => teethPositions[t.number].jaw === "lower").map(tooth => (
              <Tooth3D
                key={tooth.number}
                tooth={tooth}
                isSelected={selectedTooth === tooth.number}
                isHovered={hoveredTooth === tooth.number}
                onClick={() => handleToothClick(tooth)}
                onHover={() => setHoveredTooth(tooth.number)}
                onLeave={() => setHoveredTooth(null)}
              />
            ))}
          </div>
        </div>

        {/* Indicadores de ángulo */}
        <div className="absolute top-4 left-4 text-xs text-slate-400 font-mono">
          X: {rotation.x.toFixed(0)}° Y: {rotation.y.toFixed(0)}° Z: {rotation.z.toFixed(0)}°
        </div>
      </div>

      {/* Panel de información del diente seleccionado */}
      {selectedTooth && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-bold ${
                  statusConfig[teeth.find(t => t.number === selectedTooth)!.status].bg
                }`}
              >
                {selectedTooth}
              </div>
              <div>
                <h3 className="font-bold text-lg">{getToothName(selectedTooth)}</h3>
                <p className="text-sm text-slate-500">
                  {statusConfig[teeth.find(t => t.number === selectedTooth)!.status].label}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {(Object.keys(statusConfig) as ToothStatus[]).map(status => (
                <button
                  key={status}
                  onClick={() => updateToothStatus(selectedTooth, status)}
                  className={`w-8 h-8 rounded-lg border-2 transition ${
                    teeth.find(t => t.number === selectedTooth)!.status === status
                      ? "border-slate-800"
                      : "border-slate-200"
                  }`}
                  style={{ backgroundColor: statusConfig[status].color }}
                  title={statusConfig[status].label}
                />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {statusConfig[teeth.find(t => t.number === selectedTooth)!.status].description}
          </p>
        </div>
      )}

      {/* Leyenda */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
        {(Object.keys(statusConfig) as ToothStatus[]).map(status => (
          <div key={status} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: statusConfig[status].color }}
            />
            <span className="text-xs text-slate-600">{statusConfig[status].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Tooth3DProps {
  tooth: Tooth;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}

function Tooth3D({ tooth, isSelected, isHovered, onClick, onHover, onLeave }: Tooth3DProps) {
  const pos = tooth.position;
  const status = statusConfig[tooth.status];
  const shape = getToothShape(tooth.number);

  return (
    <div
      className="absolute cursor-pointer"
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px) rotateY(${pos.rotateY}deg)`,
        transformStyle: "preserve-3d",
        width: 40,
        height: 50,
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <svg
        viewBox="-25 -30 50 60"
        className={`w-full h-full transition-all duration-200 ${
          isSelected ? "drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : ""
        } ${isHovered ? "scale-110" : ""}`}
      >
        {/* Sombra */}
        <ellipse cx="0" cy="35" rx="15" ry="4" fill="rgba(0,0,0,0.4)" />
        
        {/* Cuerpo del diente con gradiente 3D */}
        <defs>
          <linearGradient id={`grad-${tooth.number}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={status.color} stopOpacity="0.9" />
            <stop offset="50%" stopColor={status.color} stopOpacity="1" />
            <stop offset="100%" stopColor={status.color} stopOpacity="0.8" />
          </linearGradient>
          <filter id={`shadow-${tooth.number}`}>
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
          </filter>
        </defs>
        
        <path
          d={shape}
          fill={`url(#grad-${tooth.number})`}
          stroke={isSelected ? "#fff" : "rgba(0,0,0,0.3)"}
          strokeWidth={isSelected ? 2 : 1}
          filter={`url(#shadow-${tooth.number})`}
          style={{
            filter: isSelected ? "drop-shadow(0 0 8px rgba(255,255,255,0.6))" : undefined,
          }}
        />

        {/* Indicadores de estado */}
        {tooth.status === "caries" && (
          <circle cx="8" cy="-5" r="5" fill="#450a0a" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.8;0.5" dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        
        {tooth.status === "filling" && (
          <ellipse cx="0" cy="0" rx="12" ry="8" fill="#fef3c7" opacity="0.8" />
        )}
        
        {tooth.status === "missing" && (
          <g stroke="#450a0a" strokeWidth="2">
            <line x1="-15" y1="-20" x2="15" y2="20" />
            <line x1="15" y1="-20" x2="-15" y2="20" />
          </g>
        )}

        {/* Número del diente */}
        <text
          x="0"
          y="45"
          textAnchor="middle"
          className="text-[8px] font-bold fill-white"
          style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
        >
          {tooth.number}
        </text>
      </svg>
    </div>
  );
}

export default Jaw3D;
