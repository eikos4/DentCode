"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FlaskConical, 
  Loader2, 
  Mail, 
  Lock, 
  FileImage, 
  Scan,
  Activity,
  ScanFace,
  ArrowLeft,
  Shield,
  Zap,
  Send
} from "lucide-react";

export default function LabLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/lab-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      router.push("/laboratorio/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950">
      {/* ========== LADO IZQUIERDO: Formulario ========== */}
      <div className="flex flex-col justify-between p-8 lg:p-12 relative z-10">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-cyan-400 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 grid place-items-center text-white font-bold shadow-lg shadow-cyan-500/25">
              <ScanFace className="w-4 h-4" />
            </div>
            <span className="font-semibold tracking-tight">DentCode <span className="text-cyan-400">Lab</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        {/* Formulario */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-4">
              <Activity className="w-3.5 h-3.5" />
              Portal de Laboratorio Radiográfico
            </div>
            <h1 className="text-3xl font-bold text-white">Bienvenido</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Accede para subir radiografías y documentos de tus pacientes
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 flex items-start gap-2">
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="lab@radiologia.cl"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ingresando...
                </>
              ) : (
                <>
                  <Scan className="w-5 h-5" />
                  Ingresar al Portal
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-500">
              ¿No tiene acceso? Contacte a su clínica asociada
            </p>
          </div>
        </div>

        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/login" className="hover:text-white transition">Portal Dentista</Link>
          <span className="text-slate-700">|</span>
          <Link href="/login-clinica" className="hover:text-white transition">Portal Clínica</Link>
        </div>
      </div>

      {/* ========== LADO DERECHO: Ilustración ========== */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(6,182,212,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />

        {/* Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center p-12">
          {/* Central icon */}
          <div className="relative mb-8">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
              <FileImage className="w-16 h-16 text-white" />
            </div>
            {/* Orbiting elements */}
            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
              <Scan className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shadow-lg">
              <Activity className="w-5 h-5 text-teal-400" />
            </div>
          </div>

          {/* Features */}
          <div className="max-w-sm space-y-4">
            <FeatureRow 
              icon={<Zap className="w-5 h-5" />}
              title="Subida rápida de imágenes"
              desc="Arrastra y suelta radiografías panorámicas, periapicales y más"
            />
            <FeatureRow 
              icon={<Send className="w-5 h-5" />}
              title="Envío directo al dentista"
              desc="Vinculación automática con la ficha del paciente"
            />
            <FeatureRow 
              icon={<Shield className="w-5 h-5" />}
              title="Seguridad HIPAA"
              desc="Tus imágenes están cifradas y protegidas"
            />
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-cyan-400">50MB</p>
              <p className="text-xs text-slate-400">Max por archivo</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-teal-400">DICOM</p>
              <p className="text-xs text-slate-400">Soportado</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-2xl font-bold text-cyan-400">Instante</p>
              <p className="text-xs text-slate-400">Vinculación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/30 hover:bg-slate-800/50 transition group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 grid place-items-center text-cyan-400 group-hover:bg-cyan-500/20 transition">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white text-sm">{title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
