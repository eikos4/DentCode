"use client";
import { useState } from "react";
import { MapPin, Star, Phone, Calendar, Clock, ChevronRight, Heart, Shield, Award, Users } from "lucide-react";

const DENTISTS_MOCK = [
  {
    id: "1",
    name: "Dra. Camila Rojas Soto",
    specialty: "Odontología general y estética",
    rating: 4.8,
    reviews: 127,
    location: "Providencia, Región Metropolitana",
    address: "Av. Providencia 1234, Oficina 501",
    distance: "2.3 km",
    emergency: true,
    insurance: true,
    nextAvailable: "Hoy, 15:30",
    priceRange: "$30.000 - $60.000",
    photo: "/api/placeholder/80/80",
    verified: true,
    languages: ["Español", "Inglés"],
    experience: "10 años",
  },
  {
    id: "2", 
    name: "Dr. Miguel Ángel Torres",
    specialty: "Ortodoncia",
    rating: 4.9,
    reviews: 89,
    location: "Las Condes, Región Metropolitana",
    address: "Manquehue Norte 456, Local 203",
    distance: "3.7 km",
    emergency: false,
    insurance: true,
    nextAvailable: "Mañana, 09:00",
    priceRange: "$40.000 - $80.000",
    photo: "/api/placeholder/80/80",
    verified: true,
    languages: ["Español"],
    experience: "8 años",
  },
  {
    id: "3",
    name: "Dra. Valentina Fuentes",
    specialty: "Endodoncia",
    rating: 4.7,
    reviews: 54,
    location: "Ñuñoa, Región Metropolitana",
    address: "Irarrázaval 789, Piso 2",
    distance: "4.1 km",
    emergency: true,
    insurance: false,
    nextAvailable: "Viernes, 14:00",
    priceRange: "$35.000 - $70.000",
    photo: "/api/placeholder/80/80",
    verified: true,
    languages: ["Español", "Portugués"],
    experience: "6 años",
  },
];

export function DentistResults() {
  const [savedDentists, setSavedDentists] = useState<string[]>([]);

  const toggleSave = (dentistId: string) => {
    setSavedDentists(prev => 
      prev.includes(dentistId) 
        ? prev.filter(id => id !== dentistId)
        : [...prev, dentistId]
    );
  };

  const renderStars = (rating: number, reviewCount: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.floor(rating)
                ? "text-yellow-400 fill-current"
                : star <= rating
                ? "text-yellow-400 fill-current opacity-50"
                : "text-slate-300"
            }`}
          />
        ))}
        <span className="text-sm font-medium text-slate-700 ml-1">{rating}</span>
        <span className="text-xs text-slate-500">({reviewCount})</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {DENTISTS_MOCK.map((dentist) => (
        <div
          key={dentist.id}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex gap-6">
            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-slate-200 overflow-hidden">
                <img
                  src={dentist.photo}
                  alt={dentist.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-slate-900 truncate">
                      {dentist.name}
                    </h3>
                    {dentist.verified && (
                      <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                        <Shield className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-700">Verificado</span>
                      </div>
                    )}
                  </div>
                  <p className="text-blue-600 font-medium mb-2">{dentist.specialty}</p>
                  
                  {/* Rating */}
                  {renderStars(dentist.rating, dentist.reviews)}

                  {/* Location */}
                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>{dentist.address}</span>
                    <span className="text-slate-400">({dentist.distance})</span>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Award className="w-4 h-4" />
                      <span>{dentist.experience}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{dentist.languages.join(", ")}</span>
                    </div>
                    {dentist.emergency && (
                      <div className="flex items-center gap-1 text-red-600">
                        <Clock className="w-4 h-4" />
                        <span>Emergencias</span>
                      </div>
                    )}
                    {dentist.insurance && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Shield className="w-4 h-4" />
                        <span>Seguros</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={() => toggleSave(dentist.id)}
                  className="flex-shrink-0 p-2 rounded-lg hover:bg-slate-100 transition"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      savedDentists.includes(dentist.id)
                        ? "text-red-500 fill-current"
                        : "text-slate-400"
                    }`}
                  />
                </button>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <div>
                  <div className="text-sm text-slate-600">Próxima disponibilidad</div>
                  <div className="font-medium text-green-600">{dentist.nextAvailable}</div>
                  <div className="text-xs text-slate-500">{dentist.priceRange}</div>
                </div>
                
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Contactar
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Agendar cita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Load More */}
      <div className="text-center py-8">
        <button className="px-6 py-3 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition">
          Cargar más dentistas
        </button>
      </div>
    </div>
  );
}
