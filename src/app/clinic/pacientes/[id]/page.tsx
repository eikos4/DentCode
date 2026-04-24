"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Calendar, User, FileText, Stethoscope, Loader2, Grid3X3, Box } from "lucide-react";
import { Odontogram3D } from "../../../../components/odontogram-3d";
import { Jaw3D } from "../../../../components/jaw-3d";

interface Patient {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  rut: string | null;
  birthDate: string | null;
  address: string | null;
  insurance: string | null;
  notes: string | null;
  createdAt: string;
  dentist?: {
    id: string;
    fullName: string;
  };
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  treatment: string | null;
  status: string;
  priceCLP: number | null;
  dentist: { fullName: string };
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"info" | "odontogram" | "jaw3d" | "history">("info");
  const [odontogramView, setOdontogramView] = useState<"flat" | "jaw">("flat");

  useEffect(() => {
    async function loadPatient() {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/clinic/patients/${id}`),
          fetch(`/api/clinic/patients/${id}/appointments`),
        ]);
        
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatient(pData.patient);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAppointments(aData.appointments || []);
        }
      } catch (err) {
        console.error("Error cargando paciente:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) loadPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Paciente no encontrado</p>
        <Link href="/clinic/pacientes" className="text-blue-600 hover:underline mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic/pacientes"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ficha del Paciente
          </h1>
          <p className="text-sm text-slate-600">Historial clínico completo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {[
          { id: "info", label: "Información", icon: User },
          { id: "odontogram", label: "Odontograma", icon: Grid3X3 },
          { id: "jaw3d", label: "Vista 3D Mandíbula", icon: Box },
          { id: "history", label: "Historial", icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "jaw3d") setOdontogramView("jaw");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "info" && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Info Principal */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 text-white grid place-items-center text-2xl font-bold flex-shrink-0">
                  {patient.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
                  <p className="text-sm text-slate-500">{patient.rut || "Sin RUT"}</p>
                  
                  <div className="flex flex-wrap gap-3 mt-3">
                    {patient.phone && (
                      <a
                        href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition"
                      >
                        <Phone className="w-4 h-4" />
                        {patient.phone}
                      </a>
                    )}
                    {patient.email && (
                      <a
                        href={`mailto:${patient.email}`}
                        className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition"
                      >
                        <Mail className="w-4 h-4" />
                        {patient.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" />
                Información General
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase">Fecha de nacimiento</p>
                  <p className="text-sm font-medium">
                    {patient.birthDate 
                      ? new Date(patient.birthDate).toLocaleDateString("es-CL") 
                      : "No registrada"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase">Previsión</p>
                  <p className="text-sm font-medium">{patient.insurance || "No registrada"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs text-slate-500 uppercase">Dirección</p>
                  <p className="text-sm font-medium">{patient.address || "No registrada"}</p>
                </div>
              </div>
            </div>

            {patient.notes && (
              <div className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
                <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Notas Médicas
                </h3>
                <p className="text-sm text-amber-700">{patient.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Dentista Asignado</h3>
              {patient.dentist ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 text-white grid place-items-center text-sm font-bold">
                    {patient.dentist.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                  <p className="font-medium text-sm">{patient.dentist.fullName}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Sin dentista asignado</p>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Próximas Citas</h3>
              {appointments.filter(a => new Date(a.startAt) > new Date()).length === 0 ? (
                <p className="text-sm text-slate-500">Sin citas programadas</p>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .filter(a => new Date(a.startAt) > new Date())
                    .slice(0, 3)
                    .map(apt => (
                      <div key={apt.id} className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium text-sm">{apt.treatment || "Consulta"}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(apt.startAt).toLocaleDateString("es-CL", { 
                            weekday: "short", 
                            day: "numeric", 
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "odontogram" && odontogramView === "flat" && (
        <Odontogram3D 
          patientName={patient.fullName}
          onToothClick={(tooth) => console.log("Diente seleccionado:", tooth)}
        />
      )}

      {activeTab === "jaw3d" && (
        <Jaw3D 
          patientName={patient.fullName}
          onToothClick={(tooth) => console.log("Diente 3D seleccionado:", tooth)}
        />
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <h3 className="font-semibold text-lg">Historial de Atenciones</h3>
          </div>
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Sin atenciones registradas</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {appointments.map(apt => (
                <div key={apt.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{apt.treatment || "Consulta"}</p>
                    <p className="text-sm text-slate-500">
                      {apt.dentist.fullName} · {new Date(apt.startAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    apt.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                    apt.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>
                    {apt.status === "COMPLETED" ? "Completada" :
                     apt.status === "CONFIRMED" ? "Confirmada" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
