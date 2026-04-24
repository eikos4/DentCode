"use client";

import { useState, useRef } from "react";
import { RotateCcw, Eye, Stethoscope, AlertCircle, CheckCircle, XCircle, Info, ChevronRight, ChevronLeft } from "lucide-react";

// Tipo de estado dental
type ToothStatus = "healthy" | "caries" | "filling" | "missing" | "treatment" | "root-canal";

interface Tooth {
  number: number;
  status: ToothStatus;
  notes?: string;
  lastTreatment?: string;
  treatments: {
    date: string;
    type: string;
    dentist: string;
  }[];
}

interface Odontogram3DProps {
  patientName: string;
  teeth?: Record<number, Tooth>;
  onToothClick?: (tooth: Tooth) => void;
  readOnly?: boolean;
}

// Configuración de colores por estado
const statusConfig: Record<ToothStatus, { color: string; bg: string; border: string; label: string; icon: any }> = {
  healthy: { 
    color: "#10b981", 
    bg: "bg-emerald-500", 
    border: "border-emerald-400",
    label: "Sano",
    icon: CheckCircle
  },
  caries: { 
    color: "#ef4444", 
    bg: "bg-red-500", 
    border: "border-red-400",
    label: "Caries",
    icon: AlertCircle
  },
  filling: { 
    color: "#f59e0b", 
    bg: "bg-amber-500", 
    border: "border-amber-400",
    label: "Restauración",
    icon: CheckCircle
  },
  missing: { 
    color: "#6b7280", 
    bg: "bg-gray-500", 
    border: "border-gray-400",
    label: "Ausente",
    icon: XCircle
  },
  treatment: { 
    color: "#3b82f6", 
    bg: "bg-blue-500", 
    border: "border-blue-400",
    label: "En tratamiento",
    icon: Stethoscope
  },
  "root-canal": { 
    color: "#8b5cf6", 
    bg: "bg-violet-500", 
    border: "border-violet-400",
    label: "Endodoncia",
    icon: Stethoscope
  },
};

// Funciones auxiliares para nombres y explicaciones
function getToothName(num: number): string {
  if ([11, 21].includes(num)) return "Incisivo Central Superior";
  if ([12, 22].includes(num)) return "Incisivo Lateral Superior";
  if ([13, 23].includes(num)) return "Canino Superior";
  if ([14, 15, 24, 25].includes(num)) return "Premolar Superior";
  if ([16, 17, 18, 26, 27, 28].includes(num)) return "Molar Superior";
  if ([31, 41].includes(num)) return "Incisivo Central Inferior";
  if ([32, 42].includes(num)) return "Incisivo Lateral Inferior";
  if ([33, 43].includes(num)) return "Canino Inferior";
  if ([34, 35, 44, 45].includes(num)) return "Premolar Inferior";
  if ([36, 37, 38, 46, 47, 48].includes(num)) return "Molar Inferior";
  return "Diente";
}

function getExplanationForPatient(tooth: Tooth, statusConfig: Record<ToothStatus, { label: string }>): string {
  switch (tooth.status) {
    case "healthy":
      return `El ${getToothName(tooth.number)} se encuentra en perfecto estado. Mantenga una buena higiene oral con cepillado dos veces al día y uso de hilo dental.`;
    case "caries":
      return `Se detectó caries en el ${getToothName(tooth.number)}. Es una cavidad producida por bacterias que destruyen el esmalte. Es importante tratarla pronto para evitar que llegue a la raíz.`;
    case "filling":
      return `El ${getToothName(tooth.number)} tiene una restauración (empaste) que reemplaza la parte dañada por caries. Está protegiendo el diente.`;
    case "missing":
      return `El ${getToothName(tooth.number)} está ausente. Podemos evaluar opciones de reemplazo como implantes, puentes o prótesis.`;
    case "treatment":
      return `El ${getToothName(tooth.number)} requiere tratamiento dental. El plan de cuidados será explicado durante su consulta.`;
    case "root-canal":
      return `El ${getToothName(tooth.number)} tiene endodoncia (tratamiento de conducto). La raíz fue tratada para eliminar infección y salvar el diente.`;
    default:
      return "Estado del diente en evaluación.";
  }
}

function getTreatmentRecommendation(tooth: Tooth): string {
  switch (tooth.status) {
    case "healthy":
      return "Continuar con controles semestrales y mantener excelente higiene oral.";
    case "caries":
      return "Eliminar caries y realizar restauración (empaste) con material estético.";
    case "filling":
      return "Monitorear el estado de la restauración. Reemplazar si hay desgaste o filtraciones.";
    case "missing":
      return "Evaluar colocación de implante dental, puente fijo o prótesis removible.";
    case "treatment":
      return "Agendar procedimiento según plan de tratamiento establecido.";
    case "root-canal":
      return "Colocar corona de protección para evitar fractura del diente endodonciado.";
    default:
      return "Consultar con el odontólogo para plan de tratamiento personalizado.";
  }
}

function getToothPathLarge(num: number): string {
  if ([11, 21, 31, 41].includes(num)) {
    return "M60,15 L75,25 L85,60 L75,95 L60,105 L45,95 L35,60 L45,25 Z";
  }
  if ([12, 22, 32, 42].includes(num)) {
    return "M60,20 L72,28 L80,65 L72,92 L60,98 L48,92 L40,65 L48,28 Z";
  }
  if ([13, 23, 33, 43].includes(num)) {
    return "M60,12 L78,25 L88,45 L85,75 L75,100 L60,110 L45,100 L35,75 L32,45 L42,25 Z";
  }
  if ([14, 15, 24, 25, 34, 35, 44, 45].includes(num)) {
    return "M60,20 L80,30 L95,55 L90,85 L75,105 L60,110 L45,105 L30,85 L25,55 L40,30 Z";
  }
  return "M60,10 L82,20 L100,50 L95,85 L78,110 L60,115 L42,110 L25,85 L20,50 L38,20 Z";
}

// Numeración FDI (Fédération Dentaire Internationale)
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];

// Dientes de niños (deciduos)
const UPPER_RIGHT_CHILD = [55, 54, 53, 52, 51];
const UPPER_LEFT_CHILD = [61, 62, 63, 64, 65];
const LOWER_LEFT_CHILD = [71, 72, 73, 74, 75];
const LOWER_RIGHT_CHILD = [85, 84, 83, 82, 81];

export function Odontogram3D({ 
  patientName, 
  teeth: initialTeeth, 
  onToothClick, 
  readOnly = false 
}: Odontogram3DProps) {
  const [viewMode, setViewMode] = useState<"adult" | "child">("adult");
  const [perspective, setPerspective] = useState(800);
  const [rotationY, setRotationY] = useState(0);
  const [rotationX, setRotationX] = useState(15);
  const [selectedTooth, setSelectedTooth] = useState<Tooth | null>(null);
  const [hoveredTooth, setHoveredTooth] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<ToothStatus | "all">("all");
  const containerRef = useRef<HTMLDivElement>(null);

  // Inicializar dientes por defecto si no se proporcionan
  const [teeth, setTeeth] = useState<Record<number, Tooth>>(() => {
    if (initialTeeth) return initialTeeth;
    const defaultTeeth: Record<number, Tooth> = {};
    [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT].forEach(n => {
      defaultTeeth[n] = {
        number: n,
        status: "healthy",
        treatments: []
      };
    });
    return defaultTeeth;
  });

  const handleToothClick = (toothNumber: number) => {
    const tooth = teeth[toothNumber];
    if (!tooth) return;
    
    setSelectedTooth(tooth);
    onToothClick?.(tooth);

    if (!readOnly) {
      // Rotar para enfocar el diente seleccionado
      const isUpper = toothNumber < 40;
      const isRight = [11, 12, 13, 14, 15, 16, 17, 18, 41, 42, 43, 44, 45, 46, 47, 48].includes(toothNumber);
      
      let targetRotation = 0;
      if (isUpper && isRight) targetRotation = -20;
      else if (isUpper && !isRight) targetRotation = 20;
      else if (!isUpper && isRight) targetRotation = -20;
      else targetRotation = 20;
      
      setRotationY(targetRotation);
    }
  };

  const handleStatusChange = (toothNumber: number, newStatus: ToothStatus) => {
    setTeeth(prev => ({
      ...prev,
      [toothNumber]: {
        ...prev[toothNumber],
        status: newStatus,
        lastTreatment: new Date().toISOString().split("T")[0]
      }
    }));
  };

  const renderTooth = (number: number, isUpper: boolean, isChild: boolean = false) => {
    const tooth = teeth[number];
    if (!tooth) return null;

    const status = statusConfig[tooth.status];
    const isSelected = selectedTooth?.number === number;
    const isHovered = hoveredTooth === number;
    const shouldDim = activeFilter !== "all" && tooth.status !== activeFilter;
    const Icon = status.icon;

    // Formas SVG realistas según tipo de diente
    const getToothPath = (num: number, isChild: boolean) => {
      // Incisivos centrales (11, 21, 31, 41, 51, 61, 71, 81)
      if ([11, 21, 31, 41, 51, 61, 71, 81].includes(num)) {
        return "M25,8 L32,12 L35,25 L32,45 L25,48 L18,45 L15,25 L18,12 Z";
      }
      // Incisivos laterales (12, 22, 32, 42, 52, 62, 72, 82)
      if ([12, 22, 32, 42, 52, 62, 72, 82].includes(num)) {
        return "M25,10 L30,14 L33,28 L30,44 L25,46 L20,44 L17,28 L20,14 Z";
      }
      // Caninos (13, 23, 33, 43, 53, 63, 73, 83)
      if ([13, 23, 33, 43, 53, 63, 73, 83].includes(num)) {
        return "M25,6 L32,12 L35,20 L35,35 L32,46 L25,50 L18,46 L15,35 L15,20 L18,12 Z";
      }
      // Premolares (14, 15, 24, 25, 34, 35, 44, 45, 54, 55, 64, 65, 74, 75, 84, 85)
      if ([14, 15, 24, 25, 34, 35, 44, 45, 54, 55, 64, 65, 74, 75, 84, 85].includes(num)) {
        return "M25,8 L32,10 L38,18 L38,32 L32,44 L25,48 L18,44 L12,32 L12,18 L18,10 Z";
      }
      // Molares con cúspides (todos los demás)
      return isChild
        ? "M25,10 Q35,10 40,20 Q45,30 40,40 Q35,48 25,48 Q15,48 10,40 Q5,30 10,20 Q15,10 25,10"
        : "M25,5 L32,8 L40,15 L42,28 L40,40 L32,48 L25,50 L18,48 L10,40 L8,28 L10,15 L18,8 Z";
    };

    // Detalles de cúspides para molares (vista oclusal)
    const getOclusalDetails = (num: number) => {
      if (num >= 16 || num >= 26 || num >= 36 || num >= 46) {
        // Molares grandes - 4-5 cúspides
        return (
          <g fill="rgba(255,255,255,0.3)">
            <circle cx="20" cy="20" r="4" />
            <circle cx="30" cy="20" r="4" />
            <circle cx="20" cy="35" r="4" />
            <circle cx="30" cy="35" r="4" />
            <circle cx="25" cy="27" r="3" />
          </g>
        );
      }
      if (num >= 14 || num >= 24 || num >= 34 || num >= 44) {
        // Premolares - 2 cúspides
        return (
          <g fill="rgba(255,255,255,0.25)">
            <circle cx="22" cy="22" r="4" />
            <circle cx="28" cy="32" r="4" />
          </g>
        );
      }
      return null;
    };

    const toothPath = getToothPath(number, isChild);

    return (
      <div
        className={`relative cursor-pointer transition-all duration-300 ${shouldDim ? 'opacity-30' : 'opacity-100'}`}
        onClick={() => handleToothClick(number)}
        onMouseEnter={() => setHoveredTooth(number)}
        onMouseLeave={() => setHoveredTooth(null)}
        style={{ 
          width: isChild ? 40 : 50, 
          height: isChild ? 48 : 55,
          transform: `
            scale(${isSelected ? 1.2 : isHovered ? 1.1 : 1}) 
            translateY(${isSelected ? -10 : isHovered ? -5 : 0}px)
            rotateX(${isSelected ? 15 : 0}deg)
          `,
        }}
      >
        <svg 
          viewBox="0 0 50 55" 
          className={`w-full h-full drop-shadow-lg transition-all duration-300 ${
            isSelected ? 'drop-shadow-2xl' : ''
          }`}
        >
          {/* Sombra/base del diente */}
          <defs>
            <linearGradient id={`gradient-${number}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={status.color} stopOpacity={0.9} />
              <stop offset="50%" stopColor={status.color} stopOpacity={1} />
              <stop offset="100%" stopColor={status.color} stopOpacity={0.8} />
            </linearGradient>
            <filter id={`glow-${number}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Base del diente con efecto 3D */}
          <ellipse 
            cx="25" 
            cy="52" 
            rx="18" 
            ry="4" 
            fill="rgba(0,0,0,0.15)" 
            className="transition-all duration-300"
            style={{ transform: isSelected ? 'scale(1.1)' : 'scale(1)' }}
          />
          
          <path
            d={toothPath}
            fill={`url(#gradient-${number})`}
            stroke={isSelected ? "#fff" : status.color}
            strokeWidth={isSelected ? 3 : 1.5}
            filter={isSelected ? `url(#glow-${number})` : undefined}
            className="transition-all duration-300"
          />
          
          {/* Detalles de cúspides (vista oclusal) */}
          {getOclusalDetails(number)}
          
          {/* Indicador de caries (área oscura en la corona) */}
          {tooth.status === "caries" && (
            <ellipse 
              cx={number % 2 === 0 ? "30" : "20"} 
              cy="28" 
              rx="6" 
              ry="5" 
              fill="#7c2d12"
              opacity="0.8"
              className="animate-pulse"
            />
          )}
          
          {/* Indicador de restauración (área blanca/cerámica) */}
          {tooth.status === "filling" && (
            <>
              <ellipse cx="25" cy="25" rx="8" ry="6" fill="#e5e7eb" />
              <ellipse cx="25" cy="32" rx="6" ry="5" fill="#d1d5db" />
            </>
          )}
          
          {/* Diente ausente - cruz */}
          {tooth.status === "missing" && (
            <g stroke="#ef4444" strokeWidth="2" opacity="0.7">
              <line x1="15" y1="15" x2="35" y2="45" />
              <line x1="35" y1="15" x2="15" y2="45" />
            </g>
          )}
          
          {/* En tratamiento - indicador azul */}
          {tooth.status === "treatment" && (
            <circle 
              cx="40" 
              cy="12" 
              r="4" 
              fill="#3b82f6"
              className="animate-pulse"
            />
          )}
          
          {/* Raíz visible para endodoncia */}
          {tooth.status === "root-canal" && (
            <>
              <line x1="25" y1="48" x2="25" y2="60" stroke="#8b5cf6" strokeWidth="3" />
              <line x1="15" y1="48" x2="10" y2="55" stroke="#8b5cf6" strokeWidth="2" />
              <line x1="35" y1="48" x2="40" y2="55" stroke="#8b5cf6" strokeWidth="2" />
            </>
          )}
        </svg>

        {/* Número del diente */}
        <span 
          className={`absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-bold
            ${isSelected ? 'text-blue-600 scale-110' : 'text-slate-500'}
            transition-all duration-200
          `}
        >
          {number}
        </span>

        {/* Tooltip flotante */}
          {isHovered && (
            <div
              className={`animate-in fade-in slide-in-from-bottom-2 duration-200
                absolute z-50 ${isUpper ? 'bottom-full mb-3' : 'top-full mt-3'} 
                left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg shadow-xl whitespace-nowrap
                ${status.bg} text-white text-xs font-medium pointer-events-none
              `}
            >
              <div className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                <span>Diente {number}</span>
              </div>
              <div className="text-[10px] opacity-90 mt-0.5">{status.label}</div>
              
              {/* Flecha del tooltip */}
              <div className={`absolute left-1/2 -translate-x-1/2 ${
                isUpper ? 'top-full border-t-8' : 'bottom-full border-b-8'
              } border-x-4 border-x-transparent ${status.border}`} />
            </div>
          )}
      </div>
    );
  };

  const renderArcade = (
    teethNumbers: number[], 
    isUpper: boolean, 
    isChild: boolean = false,
    className: string = ""
  ) => {
    return (
      <div 
        className={`flex ${isUpper ? 'items-end' : 'items-start'} gap-1 ${className}`}
        style={{ 
          transform: isUpper 
            ? `rotateX(${-rotationX}deg)` 
            : `rotateX(${rotationX}deg)`,
          transformStyle: "preserve-3d"
        }}
      >
        {teethNumbers.map((number, idx) => (
          <div
            key={number}
            className="animate-in fade-in duration-300"
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            {renderTooth(number, isUpper, isChild)}
          </div>
        ))}
      </div>
    );
  };

  const teethList = viewMode === "adult" 
    ? [...UPPER_RIGHT, ...UPPER_LEFT, ...LOWER_LEFT, ...LOWER_RIGHT]
    : [...UPPER_RIGHT_CHILD, ...UPPER_LEFT_CHILD, ...LOWER_LEFT_CHILD, ...LOWER_RIGHT_CHILD];

  const counts = teethList.reduce((acc, n) => {
    const status = teeth[n]?.status || "healthy";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<ToothStatus, number>);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Odontograma 3D</h2>
          <p className="text-sm text-slate-500">Paciente: {patientName}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Adulto/Niño */}
          <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              onClick={() => setViewMode("adult")}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                viewMode === "adult" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
              }`}
            >
              Adulto
            </button>
            <button
              onClick={() => setViewMode("child")}
              className={`px-3 py-1.5 text-sm font-medium transition ${
                viewMode === "child" ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
              }`}
            >
              Infantil
            </button>
          </div>

          {/* Controles de rotación */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setRotationY(prev => prev - 15)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setRotationY(0); setRotationX(15); }}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              title="Reset vista"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotationY(prev => prev + 15)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
            activeFilter === "all" 
              ? "bg-slate-800 text-white" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Todos
        </button>
        {(Object.keys(statusConfig) as ToothStatus[]).map(status => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition flex items-center gap-1.5 ${
              activeFilter === status 
                ? `${statusConfig[status].bg} text-white` 
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className={`w-2 h-2 rounded-full bg-current`} />
            {statusConfig[status].label}
            <span className="ml-1 opacity-75">({counts[status] || 0})</span>
          </button>
        ))}
      </div>

      {/* Vista 3D Principal */}
      <div 
        ref={containerRef}
        className="relative bg-gradient-to-b from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-8 overflow-hidden"
        style={{ perspective: `${perspective}px`, minHeight: 400 }}
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full blur-3xl" />
        </div>

        {/* Contenedor 3D */}
        <div
          className="relative flex flex-col items-center justify-center gap-8 transition-transform duration-500 ease-out"
          style={{ 
            transform: `rotateY(${rotationY}deg)`,
            transformStyle: "preserve-3d" 
          }}
        >
          {/* Arcada Superior */}
          <div className="flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-2 font-medium tracking-wider uppercase">
              {viewMode === "adult" ? "Arcada Superior" : "Arcada Superior (Leche)"}
            </span>
            <div className="flex gap-4">
              {renderArcade(
                viewMode === "adult" ? UPPER_RIGHT : UPPER_RIGHT_CHILD, 
                true, 
                viewMode === "child",
                "justify-end"
              )}
              {renderArcade(
                viewMode === "adult" ? UPPER_LEFT : UPPER_LEFT_CHILD, 
                true, 
                viewMode === "child",
                "justify-start"
              )}
            </div>
          </div>

          {/* Línea divisoria simulada */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />

          {/* Arcada Inferior */}
          <div className="flex flex-col items-center">
            <div className="flex gap-4">
              {renderArcade(
                viewMode === "adult" ? LOWER_RIGHT : LOWER_RIGHT_CHILD, 
                false, 
                viewMode === "child",
                "justify-end"
              )}
              {renderArcade(
                viewMode === "adult" ? LOWER_LEFT : LOWER_LEFT_CHILD, 
                false, 
                viewMode === "child",
                "justify-start"
              )}
            </div>
            <span className="text-xs text-slate-400 mt-2 font-medium tracking-wider uppercase">
              {viewMode === "adult" ? "Arcada Inferior" : "Arcada Inferior (Leche)"}
            </span>
          </div>
        </div>

        {/* Indicador de rotación */}
        <div className="absolute bottom-4 right-4 text-xs text-slate-400">
          Rotación: {rotationY}°
        </div>
      </div>

      {/* Panel de detalles del diente seleccionado - VISTA EXPLICATIVA */}
      {selectedTooth && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Header del diente seleccionado */}
          <div className={`p-4 ${statusConfig[selectedTooth.status].bg} text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                  {selectedTooth.number}
                </div>
                <div>
                  <h3 className="font-bold text-lg">Diente {selectedTooth.number}</h3>
                  <p className="text-sm opacity-90">{getToothName(selectedTooth.number)}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                  {statusConfig[selectedTooth.status].label}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Vista explicativa 3D del diente */}
              <div className="flex flex-col items-center">
                <h4 className="text-sm font-medium text-slate-500 mb-4">Vista para el Paciente</h4>
                <div className="relative">
                  {/* Diente ampliado con anotaciones */}
                  <svg viewBox="0 0 120 140" className="w-48 h-56 drop-shadow-xl">
                    {/* Sombra */}
                    <ellipse cx="60" cy="130" rx="40" ry="8" fill="rgba(0,0,0,0.15)" />
                    
                    {/* Raíz (solo endodoncia) */}
                    {selectedTooth.status === "root-canal" && (
                      <>
                        <path d="M45,90 L40,135 L50,130 L60,140 L70,130 L80,135 L75,90" 
                              fill="#d1d5db" stroke="#8b5cf6" strokeWidth="2" />
                        <line x1="60" y1="90" x2="60" y2="135" stroke="#8b5cf6" strokeWidth="2" strokeDasharray="4" />
                      </>
                    )}
                    
                    {/* Cuerpo del diente */}
                    <path 
                      d={getToothPathLarge(selectedTooth.number)}
                      fill={statusConfig[selectedTooth.status].color}
                      stroke="rgba(0,0,0,0.2)"
                      strokeWidth="1"
                    />
                    
                    {/* Cúspides */}
                    {selectedTooth.number >= 16 && (
                      <g fill="rgba(255,255,255,0.3)">
                        <circle cx="45" cy="40" r="8" />
                        <circle cx="75" cy="40" r="8" />
                        <circle cx="40" cy="65" r="7" />
                        <circle cx="80" cy="65" r="7" />
                        <circle cx="60" cy="80" r="6" />
                      </g>
                    )}
                    
                    {/* Caries - área marcada */}
                    {selectedTooth.status === "caries" && (
                      <g>
                        <ellipse cx="65" cy="55" rx="15" ry="12" fill="#7c2d12" opacity="0.8">
                          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                        </ellipse>
                        {/* Flecha de anotación */}
                        <line x1="85" y1="45" x2="100" y2="30" stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrow)" />
                        <text x="75" y="25" fill="#dc2626" fontSize="10" fontWeight="bold">CARIES</text>
                      </g>
                    )}
                    
                    {/* Restauración */}
                    {selectedTooth.status === "filling" && (
                      <g>
                        <ellipse cx="60" cy="50" rx="20" ry="15" fill="#e5e7eb" />
                        <ellipse cx="60" cy="65" rx="15" ry="12" fill="#d1d5db" />
                        <line x1="85" y1="45" x2="105" y2="30" stroke="#0891b2" strokeWidth="2" />
                        <text x="85" y="25" fill="#0891b2" fontSize="10" fontWeight="bold">RESTAURACIÓN</text>
                      </g>
                    )}
                    
                    {/* Definiciones SVG */}
                    <defs>
                      <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#dc2626" />
                      </marker>
                    </defs>
                  </svg>
                  
                  {/* Leyenda visual */}
                  <div className="mt-4 flex justify-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="w-3 h-3 rounded-full" style={{ background: statusConfig[selectedTooth.status].color }} />
                      <span className="text-slate-600">Corona</span>
                    </div>
                    {selectedTooth.status === "root-canal" && (
                      <div className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-violet-500" />
                        <span className="text-slate-600">Conducto radicular</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info y controles */}
              <div className="space-y-4">
                {/* Descripción para el paciente */}
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-2">¿Qué significa esto?</h4>
                  <p className="text-sm text-slate-600">
                    {getExplanationForPatient(selectedTooth, statusConfig)}
                  </p>
                </div>

                {/* Tratamiento recomendado */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4" />
                    Tratamiento Recomendado
                  </h4>
                  <p className="text-sm text-blue-800">
                    {getTreatmentRecommendation(selectedTooth)}
                  </p>
                </div>

                {/* Cambiar estado */}
                {!readOnly && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Actualizar estado:</p>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(statusConfig) as ToothStatus[]).map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedTooth.number, status)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition flex items-center gap-1.5 ${
                            selectedTooth.status === status 
                              ? `border-current ${statusConfig[status].bg} text-white` 
                              : "border-slate-200 hover:border-slate-300 bg-white"
                          }`}
                          style={{ color: selectedTooth.status === status ? '#fff' : statusConfig[status].color }}
                        >
                          {(() => {
                            const Icon = statusConfig[status].icon;
                            return <Icon className="w-3 h-3" />;
                          })()}
                          {statusConfig[status].label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen general */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Dientes sanos", value: counts.healthy || 0, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Con caries", value: counts.caries || 0, color: "text-red-600", bg: "bg-red-50" },
          { label: "Restauraciones", value: counts.filling || 0, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "En tratamiento", value: (counts.treatment || 0) + (counts["root-canal"] || 0), color: "text-blue-600", bg: "bg-blue-50" },
        ].map((stat, idx) => (
          <div key={idx} className={`p-3 rounded-xl ${stat.bg}`}>
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Odontogram3D;
