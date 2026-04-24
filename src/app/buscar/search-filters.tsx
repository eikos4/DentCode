"use client";
import { useState } from "react";
import { Search, MapPin, Clock, DollarSign, Filter, X } from "lucide-react";

const SPECIALTIES = [
  "Odontología general",
  "Ortodoncia",
  "Endodoncia", 
  "Periodoncia",
  "Implantología",
  "Rehabilitación oral",
  "Odontopediatría",
  "Cirugía maxilofacial",
  "Odontología estética",
  "Blanqueamiento dental",
  "Prostodoncia",
];

const REGIONS = [
  "Región Metropolitana",
  "Región de Valparaíso",
  "Región del Biobío",
  "Región de Araucanía",
  "Región de Antofagasta",
  "Región de Coquimbo",
  "Región de Los Lagos",
  "Región de Los Ríos",
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Ñuble",
  "Región del Maule",
  "Región de Libertador General Bernardo O'Higgins",
  "Región de Aysén del General Carlos Ibáñez del Campo",
  "Región de Magallanes y de la Antártica Chilena",
];

const COMMUNES_RM = [
  "Providencia", "Las Condes", "Vitacura", "La Reina", "Lo Barnechea",
  "Santiago", "Ñuñoa", "Macul", "San Miguel", "San Joaquín",
  "La Florida", "Puente Alto", "La Pintana", "Cerro Navia", "Quilicura",
  "Huechuraba", "Renca", "Independencia", "Conchalí", "Recoleta",
];

export function SearchFilters() {
  const [expanded, setExpanded] = useState(true);
  const [filters, setFilters] = useState({
    specialty: "",
    region: "Región Metropolitana",
    commune: "",
    availability: "",
    priceRange: "",
    emergency: false,
    insurance: false,
    rating: "",
  });

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: "",
      region: "Región Metropolitana",
      commune: "",
      availability: "",
      priceRange: "",
      emergency: false,
      insurance: false,
      rating: "",
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => 
    v !== "" && v !== "Región Metropolitana" && v !== false
  ).length;

  return (
    <div className="bg-white rounded-lg border border-slate-200 sticky top-24">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <h3 className="font-semibold text-slate-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-slate-400 hover:text-slate-600"
          >
            {expanded ? "Ocultar" : "Mostrar"}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Búsqueda
            </label>
            <input
              type="text"
              placeholder="Nombre del dentista o consultorio..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Specialty */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Especialidad
            </label>
            <select
              value={filters.specialty}
              onChange={(e) => updateFilter("specialty", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas las especialidades</option>
              {SPECIALTIES.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Ubicación
            </label>
            <select
              value={filters.region}
              onChange={(e) => updateFilter("region", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            >
              {REGIONS.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
            
            {filters.region === "Región Metropolitana" && (
              <select
                value={filters.commune}
                onChange={(e) => updateFilter("commune", e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todas las comunas</option>
                {COMMUNES_RM.map(commune => (
                  <option key={commune} value={commune}>{commune}</option>
                ))}
              </select>
            )}
          </div>

          {/* Availability */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Disponibilidad
            </label>
            <select
              value={filters.availability}
              onChange={(e) => updateFilter("availability", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Cualquier momento</option>
              <option value="today">Hoy</option>
              <option value="this-week">Esta semana</option>
              <option value="this-month">Este mes</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Rango de precio
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => updateFilter("priceRange", e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Cualquier precio</option>
              <option value="0-30000">Hasta $30.000</option>
              <option value="30000-60000">$30.000 - $60.000</option>
              <option value="60000-100000">$60.000 - $100.000</option>
              <option value="100000+">Más de $100.000</option>
            </select>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Calificación mínima
            </label>
            <div className="flex gap-1">
              {[5, 4, 3, 2, 1].map(rating => (
                <button
                  key={rating}
                  onClick={() => updateFilter("rating", filters.rating === String(rating) ? "" : String(rating))}
                  className={`px-3 py-1 rounded text-sm border transition ${
                    filters.rating === String(rating)
                      ? "bg-blue-100 border-blue-300 text-blue-700"
                      : "bg-white border-slate-300 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {rating}+ {"★"}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.emergency}
                onChange={(e) => updateFilter("emergency", e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Atención de emergencia</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.insurance}
                onChange={(e) => updateFilter("insurance", e.target.checked)}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Acepta seguros</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Aplicar filtros
            </button>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Limpiar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
