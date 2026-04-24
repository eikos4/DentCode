"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User, Stethoscope, FileText, DollarSign, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";

interface Dentist {
  id: string;
  fullName: string;
  specialty: string | null;
}

interface Patient {
  id: string;
  fullName: string;
  phone: string | null;
  rut: string | null;
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  treatment: string | null;
  status: string;
  patient: { fullName: string; phone: string | null };
}

export default function NewClinicAppointmentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dentistAppointments, setDentistAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  const [form, setForm] = useState({
    dentistId: "",
    patientId: "",
    date: "",
    time: "",
    duration: "30",
    treatment: "",
    notes: "",
    priceCLP: "",
  });

  // Cargar dentistas y pacientes de la clínica
  useEffect(() => {
    async function loadData() {
      try {
        const [dRes, pRes] = await Promise.all([
          fetch("/api/clinic/dentists"),
          fetch("/api/clinic/patients"),
        ]);
        
        if (dRes.ok) {
          const dData = await dRes.json();
          setDentists(dData.dentists || []);
        }
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatients(pData.patients || []);
        }
      } catch (err) {
        console.error("Error cargando datos:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));

    // Si cambia dentista o fecha, recargar citas
    if ((key === "dentistId" || key === "date") && (key === "dentistId" ? value : form.dentistId)) {
      loadDentistAppointments(key === "dentistId" ? value : form.dentistId, key === "date" ? value : form.date);
    }
  };

  async function loadDentistAppointments(dentistId: string, date: string) {
    if (!dentistId || !date) return;
    setLoadingAppointments(true);
    try {
      const res = await fetch(`/api/clinic/dentists/${dentistId}/appointments?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setDentistAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error("Error cargando citas:", err);
    } finally {
      setLoadingAppointments(false);
    }
  }

  function getEndTime(startTime: string, durationMin: number): string {
    const [h, m] = startTime.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + durationMin, 0, 0);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!form.dentistId || !form.patientId || !form.date || !form.time) {
        throw new Error("Completa dentista, paciente, fecha y hora");
      }

      const startAt = new Date(`${form.date}T${form.time}:00`);
      const [h, m] = form.time.split(":").map(Number);
      const endDate = new Date(startAt);
      endDate.setMinutes(m + Number(form.duration));
      
      const res = await fetch("/api/clinic/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dentistId: form.dentistId,
          patientId: form.patientId,
          startAt: startAt.toISOString(),
          endAt: endDate.toISOString(),
          treatment: form.treatment || null,
          notes: form.notes || null,
          priceCLP: form.priceCLP ? Number(form.priceCLP) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear la cita");

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Cita agendada!</h2>
        <p className="text-slate-600">
          La cita fue programada exitosamente.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => { setSuccess(false); setForm({ dentistId: "", patientId: "", date: "", time: "", duration: "30", treatment: "", notes: "", priceCLP: "" }); }}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Agendar otra
          </button>
          <Link
            href="/clinic/schedule"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Ver agenda
          </Link>
        </div>
      </div>
    );
  }

  const selectedDentist = dentists.find((d) => d.id === form.dentistId);
  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const showCalendar = form.dentistId && form.date;

  // Generar slots de tiempo disponibles (9:00 a 20:00 cada 30 min)
  const timeSlots = [];
  for (let h = 9; h < 20; h++) {
    timeSlots.push(`${String(h).padStart(2, "0")}:00`);
    timeSlots.push(`${String(h).padStart(2, "0")}:30`);
  }

  const isSlotOccupied = (slotTime: string) => {
    const [h, m] = slotTime.split(":").map(Number);
    const slotStart = new Date(`${form.date}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`);
    const slotEnd = new Date(slotStart.getTime() + Number(form.duration) * 60000);

    return dentistAppointments.some((apt) => {
      const aptStart = new Date(apt.startAt);
      const aptEnd = new Date(apt.endAt);
      return slotStart < aptEnd && aptStart < slotEnd;
    });
  };

  const selectTimeSlot = (slot: string) => {
    setForm((f) => ({ ...f, time: slot }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic/schedule"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nueva Cita</h1>
          <p className="text-sm text-slate-600">
            {showCalendar 
              ? `Agenda para ${selectedDentist?.fullName} el ${new Date(form.date).toLocaleDateString("es-CL")}`
              : "Selecciona dentista y fecha para ver disponibilidad"
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className={`grid gap-6 ${showCalendar ? "lg:grid-cols-3" : "max-w-3xl"}`}>
          {/* Formulario principal */}
          <form onSubmit={handleSubmit} className={`space-y-6 ${showCalendar ? "lg:col-span-2" : ""}`}>
          {/* Dentista */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" /> Dentista
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Seleccionar dentista <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.dentistId}
                  onChange={set("dentistId")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Selecciona un dentista...</option>
                  {dentists.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.fullName} {d.specialty ? `(${d.specialty})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedDentist && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                <span className="font-medium">{selectedDentist.fullName}</span>
                {selectedDentist.specialty && <span> · {selectedDentist.specialty}</span>}
              </div>
            )}
          </div>

          {/* Paciente */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Paciente
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Seleccionar paciente <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.patientId}
                  onChange={set("patientId")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Selecciona un paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.fullName} {p.rut ? `(${p.rut})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {selectedPatient && (
              <div className="p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
                <span className="font-medium">{selectedPatient.fullName}</span>
                {selectedPatient.phone && <span> · {selectedPatient.phone}</span>}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Link
                href="/clinic/pacientes/new"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + Crear nuevo paciente
              </Link>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-600" /> Fecha y hora
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={set("date")}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Hora inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={set("time")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Duración
                </label>
                <select
                  value={form.duration}
                  onChange={set("duration")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">1 hora</option>
                  <option value="90">1.5 horas</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>
            {form.time && form.duration && (
              <div className="p-3 bg-violet-50 rounded-lg text-sm text-violet-800">
                La cita terminará a las <span className="font-medium">{getEndTime(form.time, Number(form.duration))}</span>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" /> Detalles de la cita
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tratamiento / Tipo</label>
                <select
                  value={form.treatment}
                  onChange={set("treatment")}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Selecciona...</option>
                  <option value="Consulta inicial">Consulta inicial</option>
                  <option value="Limpieza dental">Limpieza dental</option>
                  <option value="Control">Control</option>
                  <option value="Obturación">Obturación</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Corona">Corona</option>
                  <option value="Implante">Implante</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Blanqueamiento">Blanqueamiento</option>
                  <option value="Extracción">Extracción</option>
                  <option value="Urgencia">Urgencia</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Valor (CLP)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={form.priceCLP}
                    onChange={set("priceCLP")}
                    placeholder="35000"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
                <textarea
                  value={form.notes}
                  onChange={set("notes")}
                  rows={3}
                  placeholder="Observaciones adicionales..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-3 justify-end">
            <Link
              href="/clinic/schedule"
              className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || !form.dentistId || !form.patientId || !form.date || !form.time}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
              {loading ? "Agendando..." : "Agendar cita"}
            </button>
          </div>
        </form>

        {/* Panel lateral: Calendario del dentista */}
        {showCalendar && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-fit sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Agenda del día
              </h3>
              {loadingAppointments && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
            </div>

            {/* Citas existentes */}
            {dentistAppointments.length > 0 ? (
              <div className="mb-6 space-y-2">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Citas programadas ({dentistAppointments.length})
                </p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dentistAppointments.map((apt) => {
                    const start = new Date(apt.startAt);
                    const end = new Date(apt.endAt);
                    return (
                      <div
                        key={apt.id}
                        className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-sm"
                      >
                        <div className="flex items-center gap-2 font-medium text-slate-900">
                          <span className="text-blue-600">
                            {String(start.getHours()).padStart(2, "0")}:{String(start.getMinutes()).padStart(2, "0")}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="text-slate-500">
                            {String(end.getHours()).padStart(2, "0")}:{String(end.getMinutes()).padStart(2, "0")}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1 truncate">{apt.patient.fullName}</p>
                        <p className="text-xs text-slate-500">{apt.treatment || "Consulta"}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-lg bg-emerald-50 text-emerald-700 text-sm">
                <p className="font-medium">¡Día completamente libre!</p>
                <p className="text-xs mt-1">No hay citas programadas para este dentista.</p>
              </div>
            )}

            {/* Selector visual de horarios */}
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
                Selecciona horario disponible
              </p>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const occupied = isSlotOccupied(slot);
                  const selected = form.time === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => !occupied && selectTimeSlot(slot)}
                      disabled={occupied}
                      className={`px-2 py-2 text-xs rounded-lg font-medium transition ${
                        occupied
                          ? "bg-red-50 text-red-400 cursor-not-allowed line-through"
                          : selected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-slate-100" /> Libre
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-red-50" /> Ocupado
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-blue-600" /> Seleccionado
                </span>
              </div>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
}
