"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, MapPin, Heart, Loader2, Save } from "lucide-react";

export default function NewClinicPatientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    rut: "",
    birthDate: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    commune: "",
    city: "",
    occupation: "",
    referredBy: "",
    emergencyContact: "",
    bloodType: "",
    allergies: "",
    medicalHistory: "",
    medications: "",
    notes: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthDate: form.birthDate || null,
          rut: form.rut || null,
          phone: form.phone || null,
          email: form.email || null,
          gender: form.gender || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear paciente");
      router.push("/clinic/pacientes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic/pacientes"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo Paciente</h1>
          <p className="text-sm text-slate-600">Registra un nuevo paciente en la clínica</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Datos personales
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Nombre completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={set("fullName")}
                placeholder="Ej: María González Pérez"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">RUT</label>
              <input
                type="text"
                value={form.rut}
                onChange={set("rut")}
                placeholder="12.345.678-9"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Fecha de nacimiento</label>
              <input
                type="date"
                value={form.birthDate}
                onChange={set("birthDate")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Sexo</label>
              <select
                value={form.gender}
                onChange={set("gender")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">No especificado</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="O">Otro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ocupación</label>
              <input
                type="text"
                value={form.occupation}
                onChange={set("occupation")}
                placeholder="Ej: Profesora"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-600" /> Contacto
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+56 9 1234 5678"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="paciente@email.com"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Dirección</label>
              <input
                type="text"
                value={form.address}
                onChange={set("address")}
                placeholder="Av. Principal 123"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Comuna</label>
              <input
                type="text"
                value={form.commune}
                onChange={set("commune")}
                placeholder="Las Condes"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ciudad</label>
              <input
                type="text"
                value={form.city}
                onChange={set("city")}
                placeholder="Santiago"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contacto de emergencia</label>
              <input
                type="text"
                value={form.emergencyContact}
                onChange={set("emergencyContact")}
                placeholder="Juan González +56 9 9999 9999"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">¿Cómo nos conoció?</label>
              <input
                type="text"
                value={form.referredBy}
                onChange={set("referredBy")}
                placeholder="Referido, Google, Instagram..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Historial médico */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" /> Antecedentes médicos
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Tipo de sangre</label>
              <select
                value={form.bloodType}
                onChange={set("bloodType")}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="">No especificado</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Alergias</label>
              <input
                type="text"
                value={form.allergies}
                onChange={set("allergies")}
                placeholder="Penicilina, látex..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Medicamentos actuales</label>
              <input
                type="text"
                value={form.medications}
                onChange={set("medications")}
                placeholder="Aspirina, Enalapril..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Antecedentes médicos</label>
              <input
                type="text"
                value={form.medicalHistory}
                onChange={set("medicalHistory")}
                placeholder="Diabetes, hipertensión..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notas adicionales</label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                rows={3}
                placeholder="Observaciones generales..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/clinic/pacientes"
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !form.fullName}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Guardando..." : "Crear paciente"}
          </button>
        </div>
      </form>
    </div>
  );
}
