interface ClinicKpiProps {
  icon: any;
  label: string;
  value: React.ReactNode;
  accent: "teal" | "sky" | "emerald" | "violet" | "red" | "slate";
}

export function ClinicKpi({ icon: Icon, label, value, accent }: ClinicKpiProps) {
  const palette: Record<string, { bg: string; text: string }> = {
    teal: { bg: "bg-blue-50", text: "text-blue-700" },
    sky: { bg: "bg-sky-50", text: "text-sky-600" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600" },
    violet: { bg: "bg-violet-50", text: "text-violet-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
    slate: { bg: "bg-slate-100", text: "text-slate-600" },
  };
  const p = palette[accent];
  
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <span className={`w-8 h-8 rounded-lg grid place-items-center ${p.bg} ${p.text}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="text-xs text-slate-500 mt-3">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
