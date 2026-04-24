"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Users, Mail, Lock, Eye, EyeOff, AlertCircle, Shield } from "lucide-react";

export function RegisterClinicForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    clinicName: "",
    clinicRut: "",
    clinicPhone: "",
    clinicEmail: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validar contraseñas
    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsLoading(false);
      return;
    }

    if (formData.adminPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/clinic-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName: formData.clinicName,
          clinicRut: formData.clinicRut || undefined,
          clinicPhone: formData.clinicPhone || undefined,
          clinicEmail: formData.clinicEmail || undefined,
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          adminPassword: formData.adminPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al registrar clínica");
      }

      // Guardar token y redirigir
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
      router.push("/clinic");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Datos de la clínica */}
      <div className="space-y-4">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4" />
          Datos de la Clínica
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre de la clínica *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Clínica Dental Santiago"
            value={formData.clinicName}
            onChange={(e) => setFormData({ ...formData, clinicName: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            RUT (opcional)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="76.123.456-7"
            value={formData.clinicRut}
            onChange={(e) => setFormData({ ...formData, clinicRut: e.target.value })}
            disabled={isLoading}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="+56 9 1234 5678"
              value={formData.clinicPhone}
              onChange={(e) => setFormData({ ...formData, clinicPhone: e.target.value })}
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="contacto@clinica.cl"
              value={formData.clinicEmail}
              onChange={(e) => setFormData({ ...formData, clinicEmail: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Administrador */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <h2 className="font-semibold text-slate-900 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Administrador
        </h2>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tu nombre completo *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="María González"
            value={formData.adminName}
            onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Email de administrador *
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="maria@clinica.cl"
              value={formData.adminEmail}
              onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Contraseña *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Mínimo 8 caracteres"
              value={formData.adminPassword}
              onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
              required
              minLength={8}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Confirmar contraseña *
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              placeholder="Repite tu contraseña"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Beneficios */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Incluye 14 días gratis
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>· Gestión de hasta 5 dentistas</li>
          <li>· Pacientes y citas ilimitadas</li>
          <li>· Dashboard consolidado</li>
          <li>· Soporte prioritario</li>
        </ul>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creando cuenta..." : "Crear cuenta de clínica"}
      </button>
    </form>
  );
}
