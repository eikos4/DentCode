"use client";

import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Filter, 
  Stethoscope, 
  CreditCard, 
  X
} from "lucide-react";
import { useState } from "react";

interface SearchFiltersProps {
  initialFilters: {
    q: string;
    region: string;
    city: string;
    type: string;
    specialty?: string;
    insurance?: string;
  };
  regions: string[];
  cities: string[];
  specialties: string[];
}

export default function SearchFilters({ initialFilters, regions, cities, specialties }: SearchFiltersProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState(initialFilters);

  const updateSearch = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.push(`/buscar?${params.toString()}`);
  };

  const insuranceOptions = ["Fonasa", "Consalud", "Colmena", "Banmédica", "Vida Tres", "Cruz Blanca", "Nueva Masvida"];

  return (
    <>
      {/* Botón de filtros para móviles */}
      <button 
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 active:scale-95 transition-transform"
      >
        <Filter className="w-5 h-5" />
        <span className="font-bold text-sm">Filtros</span>
      </button>

      {/* Sidebar de Filtros */}
      <div className={`
        fixed inset-0 z-[60] transition-transform lg:relative lg:inset-auto lg:translate-x-0 lg:z-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:block"}
      `}>
        {/* Overlay para móviles */}
        <div 
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden" 
          onClick={() => setIsOpen(false)} 
        />

        <div className="relative bg-white w-72 h-full lg:h-auto lg:w-full lg:rounded-2xl border-r lg:border border-slate-200 overflow-y-auto lg:sticky lg:top-24">
          {/* Header del Sidebar */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-widest">
              <Filter className="w-4 h-4 text-blue-600" />
              Filtrar por
            </h2>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-7">
            {/* Búsqueda por Texto */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Búsqueda</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nombre, especialidad..."
                  value={filters.q}
                  onChange={(e) => updateSearch({ q: e.target.value })}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Tipo de Prestador */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "dentist", label: "Dentistas" },
                  { id: "clinic", label: "Clínicas" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => updateSearch({ type: filters.type === t.id ? "" : t.id })}
                    className={`py-2 rounded-lg text-[10px] font-bold transition-all border ${
                      filters.type === t.id 
                        ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    {t.label.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Especialidad */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Stethoscope className="w-3.5 h-3.5" /> Especialidad
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => updateSearch({ specialty: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">Todas</option>
                {specialties.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Ubicación */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Ubicación
              </label>
              <div className="space-y-2">
                <select
                  value={filters.region}
                  onChange={(e) => updateSearch({ region: e.target.value, city: "" })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">Cualquier Región</option>
                  {regions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <select
                  value={filters.city}
                  onChange={(e) => updateSearch({ city: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                >
                  <option value="">Cualquier Ciudad</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Seguros */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5" /> Previsión
              </label>
              <select
                value={filters.insurance}
                onChange={(e) => updateSearch({ insurance: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
              >
                <option value="">Todas</option>
                {insuranceOptions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Limpiar */}
            {(filters.q || filters.region || filters.city || filters.type || filters.specialty || filters.insurance) && (
              <button
                onClick={() => updateSearch({ q: "", region: "", city: "", type: "", specialty: "", insurance: "" })}
                className="w-full py-2.5 text-[10px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100 uppercase tracking-widest"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
