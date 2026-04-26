"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Stethoscope,
  Loader2,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface Slot {
  time: string;
  fullDate: string;
}

interface DentistInfo {
  id: string;
  fullName: string;
  specialty: string;
  photoUrl: string | null;
  clinic?: { name: string };
}

export default function PublicBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [dentist, setDentist] = useState<DentistInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [patientData, setPatientData] = useState({
    fullName: "",
    rut: "",
    phone: "",
    email: ""
  });
  
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadDentist() {
      try {
        const res = await fetch(`/api/public/dentists/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDentist(data.dentist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) loadDentist();
  }, [id]);

  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate || !id) return;
      setLoadingSlots(true);
      try {
        const res = await fetch(`/api/public/dentists/${id}/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    }
    if (step === 2) loadSlots();
  }, [id, selectedDate, step]);

  const handleBooking = async () => {
    setBooking(true);
    try {
      const res = await fetch("/api/public/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dentistId: id,
          startAt: selectedSlot?.fullDate,
          treatment: selectedService,
          patientData
        })
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        alert(data.error || "Error al agendar");
      }
    } catch (err) {
      alert("Error de conexión");
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!dentist && !loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Ups, no encontramos al profesional</h1>
          <Link href="/buscar" className="text-blue-600 font-medium hover:underline">Volver a la búsqueda</Link>
        </div>
      </div>
    );
  }

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">¡Cita Agendada!</h1>
          <p className="text-slate-600">
            Tu cita con el <strong>Dr. {dentist?.fullName}</strong> ha sido registrada con éxito.
            Te enviamos un mensaje de confirmación a tu WhatsApp.
          </p>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left space-y-2">
            <p className="text-sm"><strong>Fecha:</strong> {new Date(selectedSlot?.fullDate!).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <p className="text-sm"><strong>Hora:</strong> {selectedSlot?.time} hrs</p>
            <p className="text-sm"><strong>Servicio:</strong> {selectedService}</p>
          </div>
          <button 
            onClick={() => router.push("/")}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition"
          >
            VOLVER AL INICIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 md:py-12 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 overflow-hidden border border-slate-100">
        
        {/* Header del Widget */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-3xl rounded-full" />
          <div className="relative flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-bold overflow-hidden">
              {dentist?.photoUrl ? (
                <img src={dentist.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                dentist?.fullName[0]
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">Dr. {dentist?.fullName}</h2>
              <p className="text-blue-400 text-sm font-medium">{dentist?.specialty}</p>
              {dentist?.clinic && <p className="text-slate-400 text-xs mt-1">📍 {dentist.clinic.name}</p>}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8 flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${step >= i ? "bg-blue-500" : "bg-white/10"}`} />
            ))}
          </div>
        </div>

        <div className="p-8">
          
          {/* PASO 1: Servicio */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-black text-slate-900">¿Qué necesitas realizarte?</h3>
                <p className="text-slate-500 text-sm">Selecciona el tipo de atención para tu cita</p>
              </div>
              <div className="grid gap-3">
                {[
                  "Consulta General",
                  "Limpieza Dental (Profilaxis)",
                  "Urgencia Dental",
                  "Evaluación Ortodoncia",
                  "Blanqueamiento Dental",
                  "Otro / Evaluación"
                ].map(service => (
                  <button
                    key={service}
                    onClick={() => { setSelectedService(service); nextStep(); }}
                    className={`flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all group ${
                      selectedService === service 
                        ? "border-blue-600 bg-blue-50/50" 
                        : "border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                        selectedService === service ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600"
                      }`}>
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-700">{service}</span>
                    </div>
                    <ChevronRight className={`w-5 h-5 transition ${selectedService === service ? "text-blue-600" : "text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* PASO 2: Fecha y Hora */}
          {step === 2 && (
            <div className="space-y-6">
              <button onClick={prevStep} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" /> VOLVER
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Selecciona fecha y hora</h3>
                <p className="text-slate-500 text-sm">Disponibilidad en tiempo real</p>
              </div>

              <div className="space-y-4">
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                />

                <div className="grid grid-cols-3 gap-2">
                  {loadingSlots ? (
                    <div className="col-span-3 py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Buscando huecos libres...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="col-span-3 py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-slate-500 font-medium">No hay horas disponibles para este día</p>
                    </div>
                  ) : (
                    slots.map(slot => (
                      <button
                        key={slot.time}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-3 rounded-xl font-bold transition-all border-2 ${
                          selectedSlot?.time === slot.time 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200" 
                            : "bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:text-blue-600"
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <button
                disabled={!selectedSlot}
                onClick={nextStep}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                CONTINUAR <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PASO 3: Datos Personales */}
          {step === 3 && (
            <div className="space-y-6">
              <button onClick={prevStep} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600">
                <ArrowLeft className="w-4 h-4" /> VOLVER
              </button>
              <div>
                <h3 className="text-2xl font-black text-slate-900">Tus datos de contacto</h3>
                <p className="text-slate-500 text-sm">Para confirmar tu cita y enviarte recordatorios</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Nombre Completo"
                    value={patientData.fullName}
                    onChange={(e) => setPatientData({...patientData, fullName: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">RUT</span>
                  <input 
                    type="text" 
                    placeholder="12.345.678-9"
                    value={patientData.rut}
                    onChange={(e) => setPatientData({...patientData, rut: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="tel" 
                    placeholder="+56 9 1234 5678"
                    value={patientData.phone}
                    onChange={(e) => setPatientData({...patientData, phone: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="tu@email.com"
                    value={patientData.email}
                    onChange={(e) => setPatientData({...patientData, email: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 mt-0.5" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Al agendar, crearemos tu ficha clínica digital. Tus datos están protegidos bajo la Ley 19.628 de protección de datos personales.
                </p>
              </div>

              <button
                disabled={booking || !patientData.fullName || !patientData.phone}
                onClick={handleBooking}
                className="w-full py-5 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {booking ? <Loader2 className="w-5 h-5 animate-spin" /> : "CONFIRMAR MI CITA"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
