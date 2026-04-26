import Link from "next/link";
import { LandingContactForm } from "@/components/landing-contact-form";
import {
  CalendarDays, MessageCircle, Users, Activity, FileImage, Wallet,
  Shield, Zap, Sparkles, HeartHandshake, Eye, LineChart, ArrowRight,
  CheckCircle2, Stethoscope, Clock, Lock, Star, Search,
  Globe, BarChart3, Send, FlaskConical, Share2, Monitor
} from "lucide-react";

export const metadata = {
  title: "DentCode — Tu consultorio digital, sin fricciones",
  description:
    "Plataforma de gestión clínica para dentistas y clínicas en Chile. Agenda, fichas, radiografías, odontograma y recordatorios por WhatsApp. Parte del ecosistema Leucode.IA.",
};

export default function Landing() {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">
      {/* Top bar */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 text-xs flex items-center justify-center gap-1.5 flex-wrap text-center leading-tight">
          <Sparkles className="w-3 h-3 text-sky-400 flex-shrink-0" />
          <span className="whitespace-nowrap">Parte del ecosistema</span>
          <a href="https://www.leucode.cl" target="_blank" rel="noreferrer" className="font-bold text-sky-300 hover:underline whitespace-nowrap">Leucode.IA</a>
          <span className="whitespace-nowrap text-slate-400">· Salud digital con IA para Chile y LATAM</span>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 glass bg-white/70 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 grid place-items-center text-white font-black shadow-lg shadow-blue-500/25">D</div>
            <span className="font-bold text-lg tracking-tight">Dent<span className="text-blue-600">Code</span></span>
          </div>
          <nav className="hidden md:flex items-center gap-7 text-sm text-slate-600">
            <a href="#funciones" className="hover:text-blue-600 transition">Funciones</a>
            <a href="#plataforma" className="hover:text-blue-600 transition">Plataforma</a>
            <a href="#precios" className="hover:text-blue-600 transition">Precios</a>
            <a href="#vision" className="hover:text-blue-600 transition">Visión</a>
            <a href="#contacto" className="hover:text-blue-600 transition">Contacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition">Ingresar</Link>
            <Link href="/registro" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all">Empezar gratis</Link>
          </div>
        </div>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-blue-600/20 anim-morph blur-3xl" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-sky-500/15 anim-morph blur-3xl" style={{ animationDelay: "4s" }} />
          <div className="absolute top-[30%] left-[60%] w-[400px] h-[400px] bg-violet-500/10 anim-morph blur-3xl" style={{ animationDelay: "2s" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="hg" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#hg)" />
          </svg>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.7)_70%)]" />
        </div>
        {/* Orbiting icons */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] pointer-events-none">
          <div className="absolute inset-0 rounded-full border border-white/[0.04]" />
          <div className="absolute inset-[15%] rounded-full border border-white/[0.06]" />
          <div className="absolute inset-[30%] rounded-full border border-white/[0.08]" />
          <div className="absolute inset-0 anim-orbit" style={{ "--orbit-r": "230px", "--orbit-dur": "30s" } as React.CSSProperties}>
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/20 grid place-items-center"><CalendarDays className="w-5 h-5 text-blue-400" /></div>
          </div>
          <div className="absolute inset-0 anim-orbit" style={{ "--orbit-r": "180px", "--orbit-dur": "25s" } as React.CSSProperties}>
            <div className="w-9 h-9 rounded-xl bg-sky-600/20 border border-sky-400/20 grid place-items-center"><MessageCircle className="w-4 h-4 text-sky-400" /></div>
          </div>
          <div className="absolute inset-0 anim-orbit" style={{ "--orbit-r": "280px", "--orbit-dur": "35s" } as React.CSSProperties}>
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-400/20 grid place-items-center"><Users className="w-4 h-4 text-emerald-400" /></div>
          </div>
          <div className="absolute inset-0 anim-orbit" style={{ "--orbit-r": "320px", "--orbit-dur": "40s" } as React.CSSProperties}>
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-400/20 grid place-items-center"><Activity className="w-4 h-4 text-violet-400" /></div>
          </div>
        </div>
        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-6 pt-20 pb-28 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-400/30 bg-blue-500/10 glass text-xs text-blue-200 mb-8 anim-scale-in">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 anim-pulse-ring" /><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-400" /></span>
            Disponible ahora para dentistas y clínicas en Chile
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] anim-fade-up delay-100">
            <span className="text-white">Tu consultorio Dental</span><br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-400 to-cyan-300 bg-clip-text text-transparent anim-gradient">100% digital</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed anim-fade-up delay-200">
            Agenda, fichas clínicas, odontograma, radiografías y recordatorios por WhatsApp.
            <span className="text-white font-medium"> Todo en una sola plataforma.</span>
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center anim-fade-up delay-300">
            <Link href="/registro" className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-[1.03] transition-all flex items-center gap-3 overflow-hidden">
              <span className="absolute inset-0 anim-shimmer" />
              <span className="relative">Empezar gratis 14 días</span>
              <ArrowRight className="w-5 h-5 relative group-hover:translate-x-1 transition" />
            </Link>
            <Link href="/buscar" className="px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-lg hover:bg-white/5 hover:border-white/40 transition flex items-center gap-2">
              <Search className="w-5 h-5" /> Buscar dentista
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-500 anim-fade-up delay-400">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Sin instalación</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Sin tarjeta</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Ley 19.628</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Soporte en español</span>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto anim-fade-up delay-500">
            {[
              { value: "500+", label: "Visitas", icon: Users },
              { value: "12K+", label: "Citas agendadas", icon: CalendarDays },
              { value: "98%", label: "Uptime", icon: Activity },
              { value: "4.9★", label: "Satisfacción", icon: Star },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label} className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] glass">
                <Icon className="w-4 h-4 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Social proof banner ═══ */}


      {/* ═══ Funciones ═══ */}
      <section id="funciones" className="max-w-7xl mx-auto px-6 py-28">
        <SectionHead
          eyebrow="Funciones"
          title="Seis módulos. Cero planillas."
          subtitle="Diseñados con dentistas reales. Disponibles desde el primer día."
        />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
          {[
            { icon: CalendarDays, title: "Agenda inteligente", desc: "Vista día/semana/mes, estados por color, bloqueos y multi-sede. Drag & drop fluido.", color: "from-blue-500 to-blue-600" },
            { icon: MessageCircle, title: "WhatsApp automático", desc: "Confirmaciones, recordatorios 24h y 2h antes, encuestas post-consulta. SI/NO actualiza la cita.", color: "from-emerald-500 to-emerald-600" },
            { icon: Users, title: "Ficha clínica digital", desc: "Datos, alergias, antecedentes, notas SOAP y línea de tiempo unificada por paciente.", color: "from-violet-500 to-violet-600" },
            { icon: Activity, title: "Odontograma interactivo", desc: "Notación FDI, 32 dientes con 7 estados. Historial por diente y por cara.", color: "from-amber-500 to-orange-500" },
            { icon: FileImage, title: "Radiografías y fotos", desc: "Subida drag & drop, categorías (panorámica, periapical, intraoral) y galería.", color: "from-pink-500 to-rose-500" },
            { icon: Wallet, title: "Cobros y presupuestos", desc: "Planes multi-sesión, link de pago por WhatsApp. Facturación SII próximamente.", color: "from-sky-500 to-cyan-500" },
          ].map(({ icon: Icon, title, desc, color }, i) => (
            <article
              key={title}
              style={{ animationDelay: `${i * 100}ms` }}
              className="card-hover group relative p-7 rounded-2xl border border-slate-200 bg-white anim-fade-up overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} grid place-items-center text-white mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-sm text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition">
                Explorar <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ═══ Plataforma ═══ */}
      <section id="plataforma" className="relative bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <SectionHead
            eyebrow="Así se ve DentCode"
            title="Pensado desde la realidad clínica."
            subtitle="Interfaz clara, pocos clics, flujos que respetan tu tiempo."
          />
          <div className="mt-16 grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 anim-slide-left">
              {[
                { icon: Clock, title: "Agenda en 30 segundos", desc: "Modal único: paciente, fecha, tratamiento y precio. Listo.", accent: "text-blue-600 bg-blue-50 border-blue-100" },
                { icon: Stethoscope, title: "Ficha 360° con KPIs", desc: "Resumen, radiografías, notas SOAP, timeline y odontograma.", accent: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                { icon: BarChart3, title: "Dashboard con lo que importa", desc: "Citas de hoy, no-show, ingresos y controles vencidos.", accent: "text-violet-600 bg-violet-50 border-violet-100" },
                { icon: Lock, title: "Privacidad total", desc: "Cada dato cifrado, acceso solo para su dentista, logs de auditoría.", accent: "text-amber-600 bg-amber-50 border-amber-100" },
              ].map(({ icon: Icon, title, desc, accent }) => (
                <div key={title} className="flex gap-4 group">
                  <div className={`w-11 h-11 rounded-xl border grid place-items-center shrink-0 ${accent} group-hover:scale-110 transition`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold">{title}</h4>
                    <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Mockup */}
            <div className="relative anim-scale-in delay-200">
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/20 to-sky-400/10 blur-3xl rounded-3xl" />
              <div className="relative rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xl shadow-blue-900/10">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </div>
                  <span className="ml-2 text-xs text-slate-400 font-mono flex-1 text-center">dentcode.cl/dashboard</span>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Agenda de hoy</p>
                      <p className="text-2xl font-bold">4 pacientes</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">En curso</span>
                  </div>
                  {[
                    { t: "09:00", n: "Antonia Escandon", a: "Limpieza", c: "bg-emerald-500" },
                    { t: "10:30", n: "María González", a: "Control ortodoncia", c: "bg-sky-500" },
                    { t: "12:00", n: "Pedro Ramírez", a: "Endodoncia", c: "bg-amber-500" },
                    { t: "16:30", n: "Ana Silva", a: "Ficha nueva", c: "bg-violet-500" },
                  ].map((r) => (
                    <div key={r.t} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:bg-white hover:shadow-md transition-all">
                      <span className={`w-1.5 h-9 rounded-full ${r.c}`} />
                      <span className="font-mono text-xs text-slate-400 w-11">{r.t}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{r.n}</p>
                        <p className="text-xs text-slate-500 truncate">{r.a}</p>
                      </div>
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ DentCode Lab (Nueva Sección) ═══ */}
      <section className="relative bg-slate-950 py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-cyan-500 rounded-full blur-[120px] anim-float" />
          <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-teal-500 rounded-full blur-[100px] anim-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="anim-fade-up">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold mb-6">
                Para Centros Radiológicos
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                DentCode <span className="bg-gradient-to-r from-cyan-400 to-teal-300 bg-clip-text text-transparent">Lab</span>
              </h2>
              <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-xl">
                Digitaliza tu laboratorio y conecta instantáneamente con cientos de clínicas. Entrega resultados, gestiona órdenes y elimina el uso de placas físicas.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: FlaskConical, t: "Órdenes Digitales", d: "Recibe solicitudes de exámenes directamente en tu panel de control." },
                  { icon: Share2, t: "Trazabilidad de Estados", d: "Notifica automáticamente cuando el examen está en proceso o listo." },
                  { icon: Monitor, t: "Entrega DICOM & HD", d: "Sube archivos médicos profesionales accesibles desde cualquier visor." }
                ].map((item) => (
                  <div key={item.t} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-lg">{item.t}</h4>
                      <p className="text-sm text-slate-500">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                <Link href="/login-laboratorio" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold hover:shadow-lg hover:shadow-cyan-500/30 transition-all group">
                  Ingresar al Portal Lab
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            <div className="relative anim-scale-in">
              <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl rounded-3xl" />
              <div className="relative bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 border-b border-white/5 bg-slate-800/50 flex items-center gap-2">
                  <FlaskConical className="w-4 h-4 text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lab Dashboard · Tareas Pendientes</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase border border-amber-500/30">Pendiente</span>
                      <span className="text-[10px] text-slate-500 font-bold">#ORD-8921</span>
                    </div>
                    <p className="text-white font-bold">Carlos Maturana</p>
                    <p className="text-xs text-slate-400">Radiografía Panorámica · Dr. Rojas</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 border border-white/5 rounded-2xl opacity-60">
                    <div className="flex justify-between items-start mb-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase border border-emerald-500/30">Listo</span>
                      <span className="text-[10px] text-slate-500 font-bold">#ORD-8919</span>
                    </div>
                    <p className="text-white font-bold">Patricia Lagos</p>
                    <p className="text-xs text-slate-400">Tomografía Cone Beam · Clínica Providencia</p>
                  </div>
                </div>
                <div className="px-6 py-8 bg-gradient-to-r from-cyan-600 to-teal-600 text-center">
                  <p className="text-white font-bold text-xl mb-2">¿Eres dueño de un Laboratorio?</p>
                  <p className="text-cyan-50 text-sm mb-6">Únete a la red más grande de dentistas en Chile.</p>
                  <button className="px-6 py-3 bg-white text-cyan-600 rounded-xl font-bold text-sm hover:scale-105 transition shadow-lg">
                    Saber más sobre DentCode Lab
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ Precios ═══ */}
      <section id="precios" className="max-w-7xl mx-auto px-6 py-28">
        <SectionHead eyebrow="Precios" title="Simple, transparente y en pesos chilenos." subtitle="Sin costos ocultos ni permanencia. Cancela cuando quieras. IVA incluido." />
        <div className="mt-16 grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="card-hover anim-fade-up p-8 rounded-3xl border-2 border-slate-200 bg-white">
            <h3 className="font-bold text-xl">Plan Dentista</h3>
            <p className="text-sm text-slate-500 mt-1">Para odontólogos independientes</p>
            <div className="mt-6 flex items-baseline gap-2"><span className="text-5xl font-black tracking-tight">$30.000</span><span className="text-slate-500">CLP / mes</span></div>
            <p className="text-xs text-slate-400 mt-1">IVA incluido</p>
            <Link href="/registro" className="mt-6 block text-center px-5 py-3.5 rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition">Probar 14 días gratis</Link>
            <ul className="mt-8 space-y-3 text-sm">
              {["Pacientes y citas ilimitadas", "Agenda completa", "WhatsApp automático", "Ficha clínica SOAP", "Odontograma FDI", "Radiografías y fotos", "Recalls y controles", "Dashboard KPIs", "1 sede · 1 profesional", "Soporte email 24h"].map((f) => (
                <li key={f} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><span className="text-slate-700">{f}</span></li>
              ))}
            </ul>
          </div>
          <div className="card-hover anim-fade-up delay-100 p-8 rounded-3xl border-2 border-blue-600 bg-gradient-to-b from-blue-50/60 to-white relative shadow-2xl shadow-blue-600/10">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30"><Star className="w-3.5 h-3.5 fill-white" /> Más elegido</div>
            <h3 className="font-bold text-xl">Plan Clínica</h3>
            <p className="text-sm text-slate-600 mt-1">Para clínicas y equipos</p>
            <div className="mt-6 flex items-baseline gap-2"><span className="text-5xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-sky-600 bg-clip-text text-transparent">$200.000</span><span className="text-slate-500">CLP / mes</span></div>
            <p className="text-xs text-slate-400 mt-1">IVA incluido</p>
            <Link href="/registro-clinica" className="mt-6 block text-center px-5 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold hover:shadow-lg hover:shadow-blue-600/30 hover:scale-[1.02] transition-all">Probar 14 días gratis</Link>
            <ul className="mt-8 space-y-3 text-sm">
              <li className="flex gap-3 font-semibold"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><span>Todo del Plan Dentista, más:</span></li>
              {["Hasta 10 profesionales (+$8.000 c/u)", "Multi-sede ilimitada", "Agenda por box / profesional", "Inventario e insumos", "Reportes avanzados", "Presupuestos multi-sesión", "Roles y permisos", "Exportación de datos", "Soporte WhatsApp 4h", "Onboarding 1-a-1"].map((f) => (
                <li key={f} className="flex gap-3"><CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><span className="text-slate-700">{f}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">¿Algo más grande? <a href="#contacto" className="text-blue-600 font-bold hover:underline">Contáctanos</a> para Enterprise.</p>
      </section>

      {/* ═══ Visión — DARK ═══ */}
      <section id="vision" className="relative bg-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-blue-600/15 anim-morph blur-3xl" />
          <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-sky-500/10 anim-morph blur-3xl" style={{ animationDelay: "4s" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="gd" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#gd)" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-28">
          <div className="text-center max-w-3xl mx-auto anim-fade-up">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-xs uppercase tracking-[0.15em] text-blue-400 font-bold mb-4">Nuestra Visión</p>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">Principios que guían cada línea de código.</h2>
            <p className="mt-5 text-slate-400 leading-relaxed text-lg">Del ecosistema Leucode.IA: el profesional al centro, privacidad por diseño, honestidad sobre el estado.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-16">
            {[
              { icon: Stethoscope, title: "El dentista al centro", desc: "La tecnología asiste, nunca sustituye. Cada decisión clínica es tuya." },
              { icon: Shield, title: "Privacidad por diseño", desc: "Cifrado en tránsito y reposo, accesos por rol, trazabilidad desde el día uno." },
              { icon: Zap, title: "Simple y rápido", desc: "Un dentista no debería pelear con el software. Pocos clics, flujos limpios." },
              { icon: HeartHandshake, title: "Cerca del usuario", desc: "Escuchamos a dentistas reales cada semana. El feedback define el roadmap." },
              { icon: Eye, title: "Honestidad sobre el estado", desc: "Cada módulo está etiquetado como disponible o roadmap. Sin humo." },
              { icon: LineChart, title: "Impacto medible", desc: "Medimos reducción de no-show, tiempo administrativo y satisfacción." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={title} style={{ animationDelay: `${i * 100}ms` }} className="group p-6 rounded-2xl border border-white/10 bg-white/[0.03] glass anim-fade-up hover:border-blue-400/30 hover:bg-white/[0.06] transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-400/20 grid place-items-center mb-4 group-hover:scale-110 transition"><Icon className="w-5 h-5 text-blue-400" /></div>
                <h4 className="font-bold">{title}</h4>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <blockquote className="mt-16 max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl font-bold text-white/90 leading-snug">&ldquo;No construimos otra agenda. Construimos el sistema operativo del dentista en Chile.&rdquo;</p>
            <footer className="mt-4 text-sm text-slate-500">— Equipo DentCode · Leucode.IA</footer>
          </blockquote>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-sky-500" />
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-white/10 blur-3xl rounded-full anim-float" />
          <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-sky-300/20 blur-3xl rounded-full anim-float" style={{ animationDelay: "2s" }} />
        </div>
        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center text-white">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight anim-fade-up leading-tight">Empieza hoy.<br /><span className="text-sky-100">Tus pacientes te lo agradecerán.</span></h2>
          <p className="mt-6 text-lg text-sky-100 max-w-2xl mx-auto anim-fade-up delay-100">14 días gratis, sin tarjeta. Configura tu agenda y envía tu primer recordatorio en menos de 10 minutos.</p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center anim-fade-up delay-200">
            <Link href="/registro" className="group px-8 py-4 rounded-2xl bg-white text-blue-700 font-bold text-lg hover:shadow-2xl hover:scale-[1.03] transition-all flex items-center gap-3">Crear mi cuenta gratis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" /></Link>
            <a href="#contacto" className="px-8 py-4 rounded-2xl border-2 border-white/50 text-white font-bold text-lg hover:bg-white/10 hover:border-white transition">Hablar con ventas</a>
          </div>
        </div>
      </section>

      {/* ═══ Contacto ═══ */}
      <section id="contacto" className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-28">
          <SectionHead eyebrow="Conversemos" title="¿Listo para empezar?" subtitle="Cuéntanos tu contexto y te contactamos en menos de 24 horas." />
          <LandingContactForm />
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10 text-sm">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-400 grid place-items-center text-white font-black shadow-lg shadow-blue-500/20">D</div>
              <span className="font-bold text-white text-lg">DentCode</span>
            </div>
            <p className="text-slate-500 leading-relaxed">Gestión clínica para dentistas y clínicas en Chile. Ecosistema <a href="https://www.leucode.cl" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline font-medium">Leucode.IA</a>.</p>
          </div>
          <FooterCol title="Plataforma" items={[{ label: "Agenda", href: "/agenda" }, { label: "Pacientes", href: "/pacientes" }, { label: "Odontograma", href: "/pacientes" }, { label: "Dashboard", href: "/dashboard" }]} />
          <FooterCol title="Empresa" items={[{ label: "Precios", href: "#precios" }, { label: "Visión", href: "#vision" }, { label: "Contacto", href: "#contacto" }, { label: "Leucode.IA", href: "https://www.leucode.cl" }]} />
          <FooterCol title="Contacto" items={[{ label: "contacto@dentcode.cl", href: "mailto:contacto@dentcode.cl" }, { label: "Santiago, Chile", href: "#" }, { label: "WhatsApp: +56 9 82232855", href: "#" }]} />
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
            <span>© 2026 DentCode® · Leucode.IA · Todos los derechos reservados</span>
            <div className="flex gap-6">
              <a href="https://www.leucode.cl/privacidad" className="hover:text-slate-300 transition">Privacidad</a>
              <a href="https://www.leucode.cl/terminos" className="hover:text-slate-300 transition">Términos</a>
              <a href="https://www.leucode.cl/seguridad" className="hover:text-slate-300 transition">Seguridad</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="text-center max-w-3xl mx-auto anim-fade-up">
      <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-xs uppercase tracking-[0.15em] text-blue-700 font-bold mb-4">{eyebrow}</p>
      <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">{title}</h2>
      <p className="mt-5 text-slate-600 leading-relaxed text-lg">{subtitle}</p>
    </div>
  );
}

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h5 className="font-semibold text-white mb-3">{title}</h5>
      <ul className="space-y-2.5 text-slate-500">
        {items.map((i) => (
          <li key={i.label}><a href={i.href} className="hover:text-sky-400 transition">{i.label}</a></li>
        ))}
      </ul>
    </div>
  );
}
