import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, Building2, ShieldCheck, Calendar, 
  MessageCircle, Stethoscope, Instagram, Facebook, 
  Clock, Phone, Mail, ChevronRight, Share2, 
  Heart, Users, Globe, CheckCircle2, Star
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClinicProfilePage({ params }: { params: { id: string } }) {
  const clinic = await prisma.clinic.findUnique({
    where: { id: params.id },
    include: {
      dentists: { 
        where: { isActive: true, isPublished: true },
        include: { reviews: { where: { published: true } } }
      },
      locations: { where: { isActive: true } },
      services: { where: { active: true }, orderBy: { order: "asc" } },
    },
  });

  if (!clinic || !clinic.isActive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ══ Header ══ */}
      <header className="sticky top-0 z-50 glass bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 grid place-items-center text-white font-black shadow-lg shadow-blue-500/25 text-sm">D</div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Dent<span className="text-blue-600">Code</span></span>
          </Link>
          <div className="flex items-center gap-4">
             <Link href="/buscar" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition">Volver a buscar</Link>
          </div>
        </div>
      </header>

      {/* ══ Hero Clinic ══ */}
      <div className="relative bg-white border-b border-slate-200 pt-12 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            {/* Logo */}
            <div className="w-40 h-40 md:w-56 md:h-56 rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-2xl bg-white flex items-center justify-center p-4">
              {clinic.logoUrl ? (
                <img src={clinic.logoUrl} alt={clinic.name} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-200">
                  <Building2 className="w-24 h-24" />
                </div>
              )}
            </div>

            {/* Clinic Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest border border-emerald-100 mb-6">
                <ShieldCheck className="w-3.5 h-3.5" /> Centro Odontológico Verificado
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
                {clinic.name}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-y-3 gap-x-8 text-slate-500 font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{clinic.commune || clinic.city}, {clinic.region || "Chile"}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-slate-100">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{clinic.dentists.length} Profesionales</span>
                </div>
                {clinic.phone && (
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <span>{clinic.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="hidden lg:flex flex-col gap-3">
              <button className="flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-blue-600 transition shadow-xl shadow-slate-900/10">
                <Calendar className="w-5 h-5" /> Reservar Cita
              </button>
              <div className="flex gap-3">
                 <button className="flex-1 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition flex justify-center">
                   <Share2 className="w-5 h-5 text-slate-600" />
                 </button>
                 <button className="flex-1 p-3 rounded-2xl border border-slate-200 hover:bg-slate-50 transition flex justify-center">
                   <Heart className="w-5 h-5 text-slate-600" />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div className="max-w-6xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
          
          {/* Main Column */}
          <div className="space-y-12">
            
            {/* Equipo Médico */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                  <Users className="w-6 h-6 text-blue-600" /> Equipo Médico
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{clinic.dentists.length} Especialistas</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clinic.dentists.map(dentist => {
                  const rating = dentist.reviews.length > 0 
                    ? (dentist.reviews.reduce((a, b) => a + b.rating, 0) / dentist.reviews.length).toFixed(1) 
                    : null;
                  
                  return (
                    <Link 
                      key={dentist.id}
                      href={`/dentista/${dentist.slug}`}
                      className="group bg-white p-5 rounded-3xl border border-slate-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex gap-5 items-center"
                    >
                      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        {dentist.photoUrl ? (
                          <img src={dentist.photoUrl} alt={dentist.fullName} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Users className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{dentist.fullName}</h3>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest mt-0.5">{dentist.specialty || "Odontólogo"}</p>
                        <div className="flex items-center gap-3 mt-3">
                           {rating && (
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] font-black text-yellow-700">{rating}</span>
                              </div>
                           )}
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                             VER PERFIL <ChevronRight className="w-3 h-3" />
                           </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Servicios de la Clínica */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <Stethoscope className="w-6 h-6 text-blue-600" /> Servicios Disponibles
              </h2>
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-6">
                {clinic.services.map(s => (
                  <div key={s.id} className="flex items-start gap-4">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2.5 shrink-0 shadow-lg shadow-blue-600/40" />
                    <div>
                      <h4 className="font-bold text-slate-900 leading-tight">{s.name}</h4>
                      {s.description && <p className="text-xs text-slate-500 mt-1">{s.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
            
            {/* Locations (Sedes) */}
            <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-blue-600" /> Nuestras Sedes
              </h3>
              <div className="space-y-6">
                {clinic.locations.map(l => (
                  <div key={l.id} className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-slate-100 group">
                    <div className="absolute left-0 top-0 w-0.5 h-0 bg-blue-600 transition-all duration-500 group-hover:h-full" />
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{l.name}</h4>
                    <p className="text-xs text-slate-500 mb-3 leading-relaxed">{l.address}, {l.commune || l.city}</p>
                    <div className="flex items-center gap-4">
                       <a 
                        href={`https://maps.google.com/?q=${l.address} ${l.city}`} 
                        target="_blank" rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" /> VER MAPA
                      </a>
                      {l.phone && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" /> {l.phone}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {clinic.locations.length === 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">Casa Matriz</h4>
                    <p className="text-xs text-slate-500">{clinic.address}, {clinic.commune || clinic.city}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Horarios Generales */}
            <section className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-900/10">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-3">
                <Clock className="w-5 h-5 text-sky-400" /> Horarios de Atención
              </h3>
              <div className="space-y-3">
                 {[
                   { d: "Lunes - Viernes", h: "09:00 - 19:00" },
                   { d: "Sábado", h: "09:00 - 14:00" },
                   { d: "Domingo", h: "Cerrado" }
                 ].map((item, i) => (
                   <div key={i} className="flex justify-between items-center py-2 border-b border-white/5">
                     <span className="text-xs font-medium text-slate-400">{item.d}</span>
                     <span className="text-xs font-bold text-sky-300">{item.h}</span>
                   </div>
                 ))}
              </div>
              <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                 <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Central de Reservas</p>
                 <p className="text-lg font-black text-white">{clinic.phone || "Consultar"}</p>
              </div>
            </section>

            {/* Contact Support */}
            <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-600/20">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-900">¿Tienes dudas?</h4>
                <p className="text-[11px] text-emerald-700">Contáctanos vía WhatsApp para una respuesta rápida.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* ══ Footer ══ */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black grid place-items-center text-sm">D</div>
            <span className="font-bold text-lg text-slate-900">DentCode</span>
          </div>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Plataforma integral para clínicas dentales de alto rendimiento. 
            Digitaliza tu centro con DentCode.
          </p>
          <div className="mt-8 pt-8 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
            © {new Date().getFullYear()} DentCode Ecosystem · Powered by Leucode.IA
          </div>
        </div>
      </footer>
    </div>
  );
}
