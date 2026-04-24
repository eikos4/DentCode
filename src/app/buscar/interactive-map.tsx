"use client";
import { useState } from "react";
import { MapPin, Navigation, ZoomIn, ZoomOut, Layers } from "lucide-react";

const DENTISTS_LOCATIONS = [
  { id: "1", name: "Dra. Camila Rojas", lat: -33.4489, lng: -70.6693, specialty: "Odontología general" },
  { id: "2", name: "Dr. Miguel Ángel Torres", lat: -33.4256, lng: -70.6160, specialty: "Ortodoncia" },
  { id: "3", name: "Dra. Valentina Fuentes", lat: -33.4560, lng: -70.6611, specialty: "Endodoncia" },
  { id: "4", name: "Dr. Pedro González", lat: -33.4378, lng: -70.6506, specialty: "Implantología" },
  { id: "5", name: "Dra. Sofía Martínez", lat: -33.4678, lng: -70.6793, specialty: "Odontopediatría" },
];

export function InteractiveMap() {
  const [selectedDentist, setSelectedDentist] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState("standard");

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Map Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-slate-900">Mapa de consultorios</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={mapStyle}
            onChange={(e) => setMapStyle(e.target.value)}
            className="px-3 py-1 border border-slate-300 rounded text-sm"
          >
            <option value="standard">Estándar</option>
            <option value="satellite">Satélite</option>
            <option value="terrain">Terreno</option>
          </select>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-slate-100">
        {/* Placeholder Map */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100">
          {/* Grid Pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>

          {/* Dentist Markers */}
          {DENTISTS_LOCATIONS.map((dentist, index) => {
            // Simulate position based on lat/lng
            const x = 20 + (index * 15) + (index % 2) * 10;
            const y = 30 + (index * 12) - (index % 3) * 8;
            
            return (
              <div
                key={dentist.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: `${x}%`, top: `${y}%` }}
                onClick={() => setSelectedDentist(dentist.id)}
              >
                {/* Marker */}
                <div className={`relative ${
                  selectedDentist === dentist.id
                    ? "scale-125"
                    : "hover:scale-110"
                } transition-transform`}>
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {selectedDentist === dentist.id && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45" />
                  )}
                </div>

                {/* Tooltip */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-white rounded-lg shadow-lg border border-slate-200 whitespace-nowrap ${
                  selectedDentist === dentist.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                } transition-opacity`}>
                  <div className="text-sm font-medium text-slate-900">{dentist.name}</div>
                  <div className="text-xs text-slate-600">{dentist.specialty}</div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white" />
                </div>
              </div>
            );
          })}

          {/* User Location */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs bg-white px-2 py-1 rounded shadow border border-slate-200 whitespace-nowrap">
              Tu ubicación
            </div>
          </div>
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
            <ZoomIn className="w-4 h-4 text-slate-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
            <ZoomOut className="w-4 h-4 text-slate-600" />
          </button>
          <button className="w-10 h-10 bg-white rounded-lg shadow-md border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition">
            <Navigation className="w-4 h-4 text-blue-600" />
          </button>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md border border-slate-200 p-3">
          <div className="text-xs font-medium text-slate-700 mb-2">Leyenda</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full" />
              <span className="text-xs text-slate-600">Consultorios disponibles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-xs text-slate-600">Tu ubicación</span>
            </div>
          </div>
        </div>

        {/* Selected Dentist Info */}
        {selectedDentist && (
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-4 w-64">
            {(() => {
              const dentist = DENTISTS_LOCATIONS.find(d => d.id === selectedDentist);
              if (!dentist) return null;
              
              return (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{dentist.name}</h4>
                    <button
                      onClick={() => setSelectedDentist(null)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-blue-600 mb-2">{dentist.specialty}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition">
                      Ver perfil
                    </button>
                    <button className="px-3 py-1 border border-slate-300 rounded text-sm hover:bg-slate-50 transition">
                      Agendar
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Map Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Layers className="w-3 h-3" />
            <span>Mostrando {DENTISTS_LOCATIONS.length} consultorios</span>
          </div>
          <div>Radio: 5 km</div>
        </div>
      </div>
    </div>
  );
}
