"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/clinic-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Email de administrador
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="email"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="admin@clinica.cl"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Contraseña
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            className="w-full pl-10 pr-12 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Iniciando sesión..." : "Ingresar como clínica"}
      </button>
    </form>
  );
}
