"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, Mail, User, Stethoscope, Phone, Loader2, CheckCircle } from "lucide-react";

export default function InviteDentistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ action: string; tempPassword?: string } | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialty: "",
    licenseNumber: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/clinic/dentists/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar invitación");
      setSuccess({ action: data.action, tempPassword: data.tempPassword });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success !== null) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Dentista registrado!</h2>
        <p className="text-slate-600">
          {success.action === "linked"
            ? "El dentista ya existía y fue vinculado a tu clínica."
            : "El dentista fue creado exitosamente."}
        </p>
        {success.tempPassword && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">Contraseña temporal:</p>
            <code className="text-lg font-mono bg-white px-3 py-1 rounded border border-amber-200">{success.tempPassword}</code>
            <p className="mt-2 text-xs">Comparte esta contraseña con el dentista. Deberá cambiarla al ingresar.</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => { setSuccess(null); setForm({ fullName: "", email: "", phone: "", specialty: "", licenseNumber: "" }); }}
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Agregar otro
          </button>
          <Link
            href="/clinic/dentistas"
            className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Ver dentistas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/clinic/dentistas"
          className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agregar Dentista</h1>
          <p className="text-sm text-slate-600">Registra un nuevo dentista en tu clínica</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Datos del dentista
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
                placeholder="Dr. Carlos Fuentes"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set("email")}
                  placeholder="dentista@clinica.cl"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="+56 9 1234 5678"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Especialidad</label>
              <div className="relative">
                <Stethoscope className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={form.specialty}
                  onChange={set("specialty")}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">General</option>
                  <option value="Odontología general">Odontología general</option>
                  <option value="Ortodoncia">Ortodoncia</option>
                  <option value="Endodoncia">Endodoncia</option>
                  <option value="Periodoncia">Periodoncia</option>
                  <option value="Cirugía maxilofacial">Cirugía maxilofacial</option>
                  <option value="Odontopediatría">Odontopediatría</option>
                  <option value="Implantología">Implantología</option>
                  <option value="Rehabilitación oral">Rehabilitación oral</option>
                  <option value="Estética dental">Estética dental</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">N° Registro / Licencia</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={set("licenseNumber")}
                placeholder="Ej: 12345"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">¿Cómo funciona?</p>
          <p>El dentista será agregado a tu clínica y podrá acceder al sistema con su email. Deberás compartirle las credenciales de acceso.</p>
        </div>

        <div className="flex items-center gap-3 justify-end">
          <Link
            href="/clinic/dentistas"
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading || !form.fullName || !form.email}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:shadow-lg hover:shadow-blue-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Registrando..." : "Agregar dentista"}
          </button>
        </div>
      </form>
    </div>
  );
}
