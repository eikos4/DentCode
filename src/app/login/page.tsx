import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import Link from "next/link";
import { ShieldCheck, Zap, TrendingUp, ArrowLeft, FlaskConical, Building2, Stethoscope } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Iniciar sesión — DentCode",
  description: "Accede a tu consultorio digital DentCode.",
};

export default async function LoginPage() {
  const user = await getAuthUser();
  if (user) {
    const role = user.role || (user.dentistId ? "DENTIST" : null);
    if (role === "DENTIST" || role === "SUPER_ADMIN") {
      redirect("/dashboard");
    }
  }
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ========== LADO IZQUIERDO: Formulario ========== */}
      <div className="flex flex-col justify-between p-8 lg:p-12 relative">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold shadow-sm">D</div>
            <span className="font-semibold tracking-tight">DentCode</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-900 transition flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
        </div>

        {/* Formulario centrado */}
        <div className="w-full max-w-sm mx-auto my-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Consultorio digital
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Hola de nuevo 👋
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Ingresa a tu cuenta para continuar gestionando tu consulta.
            </p>
          </div>

          {/* Selector de tipo de cuenta (Mobile friendly) */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm text-blue-600 transition-all">
              <Stethoscope className="w-4 h-4" />
              Dentista
            </button>
            <Link 
              href="/login-clinica"
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-all"
            >
              <Building2 className="w-4 h-4" />
              Clínica
            </Link>
          </div>

          <LoginForm />

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-slate-400 uppercase tracking-wider">o continúa con</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-medium text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-sm font-medium text-slate-700"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Apple
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿No tienes cuenta?{" "}
            <Link href="/registro" className="font-medium text-blue-600 hover:text-blue-700 transition">
              Regístrate gratis
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DentCode · Leucode.IA</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="hover:text-slate-700 transition">Privacidad</Link>
            <Link href="/terminos" className="hover:text-slate-700 transition">Términos</Link>
            <Link href="/soporte" className="hover:text-slate-700 transition">Soporte</Link>
          </div>
        </div>
      </div>

      {/* ========== LADO DERECHO: Branding / Social proof ========== */}
      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white">
        {/* Glows */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-sky-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="saas-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#saas-grid)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          {/* Top badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 ring-2 ring-slate-950" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-cyan-500 ring-2 ring-slate-950" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 ring-2 ring-slate-950" />
              <div className="w-8 h-8 rounded-full bg-slate-800 ring-2 ring-slate-950 grid place-items-center text-[10px] font-bold text-white">+7</div>
            </div>
            <p className="text-sm text-slate-300">
              Parte del <span className="font-semibold text-white">ecosistema clinico </span> de Leucode.IA
            </p>
          </div>

          {/* Main content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Tu consultorio,{" "}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                simplificado
              </span>.
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Agenda, fichas clínicas, odontograma, radiografías y recordatorios por WhatsApp. Todo en una sola herramienta, hecha en Chile.
            </p>

            {/* Feature cards */}
            <div className="mt-8 space-y-4">
              <FeatureRow
                icon={<Zap className="w-5 h-5" />}
                title="Ahorra 8 horas a la semana"
                desc="Automatiza recordatorios y confirmaciones"
              />
              <FeatureRow
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Datos 100% seguros"
                desc="Encriptación AES-256 y respaldo diario"
              />
              <FeatureRow
                icon={<TrendingUp className="w-5 h-5" />}
                title="30% menos citas perdidas"
                desc="WhatsApp automático a tus pacientes"
              />
            </div>

            {/* Botones de acceso alternativos */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <Link
                href="/login-laboratorio"
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-400/20 grid place-items-center text-purple-300">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-purple-300 transition">Laboratorio</p>
                  <p className="text-xs text-slate-400">Subir radiografías</p>
                </div>
              </Link>
              <Link
                href="/login-clinica"
                className="group flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/20 grid place-items-center text-emerald-300">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white group-hover:text-emerald-300 transition">Clínica</p>
                  <p className="text-xs text-slate-400">Administrar sede</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/10 border border-white/10 grid place-items-center text-blue-300 group-hover:bg-white/15 transition">
        {icon}
      </div>
      <div>
        <p className="font-medium text-white text-sm">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
