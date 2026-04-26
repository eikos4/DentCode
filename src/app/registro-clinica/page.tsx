import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterClinicForm } from "../../components/register-form-clinic";
import { getAuthUser } from "@/lib/auth";
import { ArrowLeft, Building2, ShieldCheck, Zap, Users } from "lucide-react";

export const metadata = {
  title: "Registrar Clínica — DentCode",
  description: "Crea la cuenta de tu clínica dental en DentCode y gestiona todo tu equipo.",
};

export default async function RegistroClinicaPage() {
  const user = await getAuthUser();
  if (user) {
    const role = user.role || (user.dentistId ? "DENTIST" : null);
    if (role === "CLINIC_ADMIN" || role === "CLINIC_STAFF") redirect("/clinic");
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* ========== LADO IZQUIERDO: Formulario ========== */}
      <div className="flex flex-col justify-between p-8 lg:p-12 relative overflow-y-auto max-h-screen">
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
        <div className="w-full max-w-lg mx-auto my-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              Cuenta Enterprise
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Registra tu clínica 🏢
            </h1>
            <p className="mt-2 text-slate-500">
              Inicia tus 14 días gratis. Sin tarjeta de crédito. Controla el flujo de trabajo de todo tu equipo.
            </p>
          </div>

          <div className="bg-white rounded-2xl md:border border-slate-100 md:shadow-xl md:shadow-slate-200/40 md:p-8">
            <RegisterClinicForm />
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login-clinica" className="font-medium text-blue-600 hover:text-blue-700 transition">
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} DentCode · Leucode.IA</p>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="hover:text-slate-700 transition">Privacidad</Link>
            <Link href="/terminos" className="hover:text-slate-700 transition">Términos</Link>
          </div>
        </div>
      </div>

      {/* ========== LADO DERECHO: Branding / Social proof ========== */}
      <div className="hidden lg:flex relative overflow-hidden bg-slate-950 text-white">
        {/* Glows */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-indigo-600/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="saas-grid-clinica" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#saas-grid-clinica)" />
        </svg>

        <div className="relative z-10 flex flex-col justify-center p-12 w-full max-w-xl mx-auto">
          {/* Top badge */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 grid place-items-center">
              <Building2 className="w-5 h-5 text-indigo-300" />
            </div>
            <p className="text-sm text-slate-300">
              Especial para <span className="font-semibold text-white">Centros y Clínicas </span>
            </p>
          </div>

          {/* Main content */}
          <div>
            <h2 className="text-4xl font-bold tracking-tight leading-tight">
              Gestión centralizada para{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-blue-300 to-sky-300 bg-clip-text text-transparent">
                crecer sin límites
              </span>.
            </h2>
            <p className="mt-4 text-slate-300 leading-relaxed">
              Mantén el control de tus dentistas, ingresos y pacientes desde un panel único y seguro. DentCode automatiza el trabajo pesado de administración para que te enfoques en brindar salud.
            </p>

            {/* Feature cards */}
            <div className="mt-10 space-y-5">
              <FeatureRow
                icon={<Users className="w-5 h-5" />}
                title="Soporte Multi-Dentista y Multi-Sede"
                desc="Administra agendas independientes para todos los profesionales de tu clínica."
              />
              <FeatureRow
                icon={<Zap className="w-5 h-5" />}
                title="Automatización de agendas"
                desc="Ahorra en recepcionistas enviando mensajes automáticos a WhatsApp y correos."
              />
              <FeatureRow
                icon={<ShieldCheck className="w-5 h-5" />}
                title="Permisos y Privacidad"
                desc="Define quién ve qué. Roles separados para administradores, dentistas y asistentes."
              />
            </div>

            {/* Stats Quote */}
            <div className="mt-14 p-6 rounded-2xl bg-white/5 border border-white/10 relative">
              <div className="absolute -top-3 -left-2 text-4xl text-indigo-400/40 font-serif">"</div>
              <p className="text-sm text-slate-300 relative z-10 italic">
                DentCode es parte del ecosistema Leucode.IA con motores de IA patentados.
              </p>
              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700" />
                <div>
                  <p className="text-xs font-semibold text-white">JAVIER CHANDIA</p>
                  <p className="text-[10px] text-slate-400">CEO, Leucode.IA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureRow({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 grid place-items-center text-indigo-300 group-hover:bg-white/10 transition">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-white text-base">{title}</p>
        <p className="text-sm text-slate-400 mt-1 leading-snug">{desc}</p>
      </div>
    </div>
  );
}
