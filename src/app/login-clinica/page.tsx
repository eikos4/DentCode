import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "../../components/login-form-clinic";
import { getAuthUser } from "@/lib/auth";
import { Building2, Users, BarChart3, ShieldCheck, ArrowLeft, Zap, Stethoscope } from "lucide-react";

export const metadata = {
  title: "Acceso Clínica — DentCode",
  description: "Portal administrativo para clínicas dentales DentCode.",
};

export default async function LoginClinicaPage() {
  // Solo redirigir si ya es un administrador de clínica o staff
  const user = await getAuthUser();
  if (user) {
    const role = user.role || (user.dentistId ? "DENTIST" : null);
    if (role === "CLINIC_ADMIN" || role === "CLINIC_STAFF") {
      redirect("/clinic");
    }
    // Si es dentista, lo dejamos ver la página de login de clínica 
    // por si quiere iniciar sesión con otra cuenta corporativa.
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ========== LADO IZQUIERDO: Formulario ========== */}
      <div className="flex flex-col justify-between p-8 lg:p-12 relative">
        {/* Top nav */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-emerald-600 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-500 grid place-items-center text-white font-bold shadow-sm">D</div>
            <span className="font-semibold tracking-tight">DentCode <span className="text-emerald-600">Clinics</span></span>
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Portal Administrativo
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Gestión Centralizada
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Ingresa para administrar tu sede, personal y reportes financieros.
            </p>
          </div>

          {/* Selector de tipo de cuenta */}
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <Link 
              href="/login"
              className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-all"
            >
              <Stethoscope className="w-4 h-4" />
              Dentista
            </Link>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm text-emerald-600 transition-all">
              <Building2 className="w-4 h-4" />
              Clínica
            </button>
          </div>

          <LoginForm />

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿Tu clínica no está registrada?{" "}
            <Link href="/registro-clinica" className="font-medium text-emerald-600 hover:text-emerald-700 transition">
              Registrar clínica ahora
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

      {/* ========== LADO DERECHO: Branding / Features ========== */}
      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white">
        {/* Glows */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="clinic-grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#clinic-grid)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          {/* Top badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-950 bg-emerald-${400 + i * 100}`} />
              ))}
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 grid place-items-center text-[10px] font-bold text-white">+15</div>
            </div>
            <p className="text-sm text-slate-300">
              Confianza para <span className="font-semibold text-white">clínicas de alto rendimiento</span>
            </p>
          </div>

          {/* Main content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Control total de tu{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
                centro dental
              </span>.
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              La plataforma más robusta para administrar múltiples dentistas, asistentes y el flujo financiero de tu clínica en tiempo real.
            </p>

            {/* Feature cards */}
            <div className="mt-8 space-y-4">
              <FeatureItem
                icon={<Users className="w-5 h-5 text-emerald-400" />}
                title="Gestión de Personal"
                desc="Controla horarios y permisos de dentistas, asistentes y recepcionistas."
              />
              <FeatureItem
                icon={<BarChart3 className="w-5 h-5 text-teal-400" />}
                title="Reportes Financieros"
                desc="Visualiza ingresos, liquidaciones por profesional y morosidad al instante."
              />
              <FeatureItem
                icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                title="Auditoría y Seguridad"
                desc="Registro detallado de acciones y protección de datos nivel bancario."
              />
            </div>

            {/* Quick access */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Otros Accesos</p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="text-sm text-slate-400 hover:text-white transition flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 grid place-items-center group-hover:bg-blue-500/20 group-hover:text-blue-400 transition">
                    <Zap className="w-4 h-4" />
                  </div>
                  Portal Dentista
                </Link>
                <Link href="/login-laboratorio" className="text-sm text-slate-400 hover:text-white transition flex items-center gap-2 group">
                  <div className="w-8 h-8 rounded-lg bg-white/5 grid place-items-center group-hover:bg-purple-500/20 group-hover:text-purple-400 transition">
                    <Zap className="w-4 h-4" />
                  </div>
                  Laboratorio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/5 border border-white/10 grid place-items-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white text-sm">{title}</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
