import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  MapPin, Star, Building2, ShieldCheck, Calendar, 
  MessageCircle, Stethoscope, Instagram, Facebook, 
  Award, Clock, Phone, Mail, ChevronRight, Share2, 
  Heart, CheckCircle2, Languages, GraduationCap, User
} from "lucide-react";

export const dynamic = "force-dynamic";

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export default async function DentistProfilePage({ params }: { params: { slug: string } }) {
  const dentist = await prisma.dentist.findUnique({
    where: { slug: params.slug },
    include: {
      publicProfile: true,
      locations: { where: { isActive: true } },
      clinic: true,
      services: { where: { active: true }, orderBy: { order: "asc" } },
      reviews: { where: { published: true }, orderBy: { date: "desc" } },
    },
  });

  if (!dentist || !dentist.isPublished) {
    notFound();
  }

  const rating = dentist.reviews.length > 0 
    ? (dentist.reviews.reduce((a, b) => a + b.rating, 0) / dentist.reviews.length).toFixed(1) 
    : null;

  const languages = safeParse<string[]>(dentist.publicProfile?.languages, ["Español"]);
  const education = safeParse<string[]>(dentist.publicProfile?.education, []);
  const paymentMethods = safeParse<string[]>(dentist.publicProfile?.paymentMethods, []);
  const insurance = safeParse<string[]>(dentist.publicProfile?.insuranceProviders, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* ══ Header ══ */}
      <header className="sticky top-0 z-50 glass bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg md:rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 grid place-items-center text-white font-black shadow-lg shadow-blue-500/25 text-xs md:sm">D</div>
            <span className="font-bold text-base md:text-lg tracking-tight text-slate-900">Dent<span className="text-blue-600">Code</span></span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
             <Link href="/buscar" className="hidden sm:block text-xs md:text-sm font-medium text-slate-500 hover:text-blue-600 transition">Volver a buscar</Link>
             <Link href={`/agendar/${dentist.id}`} className="px-3 md:px-4 py-1.5 md:py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20">
              Agendar
             </Link>
          </div>
        </div>
      </header>

      <div className="relative bg-slate-900 text-white overflow-hidden pt-8 md:pt-12 pb-24 md:pb-40">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-blue-600 blur-[80px] md:blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[200px] md:w-[300px] h-[200px] md:h-[300px] bg-sky-500 blur-[60px] md:blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end text-center md:text-left">
            {/* Photo */}
            <div className="relative shrink-0">
              <div className="w-32 h-32 md:w-56 md:h-56 rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white/10 shadow-2xl bg-slate-800">
                {dentist.photoUrl ? (
                  <img src={dentist.photoUrl} alt={dentist.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <User className="w-12 h-12 md:w-20 md:h-20 opacity-20" />
                  </div>
                )}
              </div>
              {dentist.verificationStatus === "verified" && (
                <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-white text-blue-600 p-1.5 md:p-2 rounded-xl md:rounded-2xl shadow-xl border-2 md:border-4 border-slate-900" title="Verificado">
                  <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 fill-blue-600 text-white" />
                </div>
              )}
            </div>

            {/* Main Info */}
            <div className="flex-1 pb-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3 mb-3 md:mb-4">
                {dentist.specialty && (
                  <span className="px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] md:text-xs font-bold uppercase tracking-widest border border-blue-400/30">
                    {dentist.specialty}
                  </span>
                )}
                {rating && (
                   <div className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-yellow-400/30">
                    <Star className="w-3 h-3 md:w-3.5 md:h-3.5 fill-yellow-400" />
                    <span className="text-xs md:text-sm font-bold">{rating}</span>
                    <span className="text-[10px] md:text-xs opacity-60">({dentist.reviews.length})</span>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight mb-3 md:mb-4 leading-tight">
                {dentist.fullName}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start gap-y-2 gap-x-4 md:gap-x-6 text-slate-400 text-xs md:text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-400" />
                  <span>{dentist.locations[0]?.commune || dentist.locations[0]?.city || dentist.clinic?.commune || "Chile"}</span>
                </div>
                {dentist.publicProfile?.experience && (
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-400" />
                    <span>{dentist.publicProfile.experience} exp.</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Languages className="w-3.5 h-3.5 md:w-4 md:h-4 text-sky-400" />
                  <span>{languages.join(", ")}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Desktop only for Heart/Share in hero) */}
            <div className="hidden md:flex gap-3 md:flex-col lg:flex-row">
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Content ══ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 md:-mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 md:gap-8">
          
          {/* Main Column */}
          <div className="space-y-8">
            
            {/* Bio */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" /> Sobre {dentist.fullName.split(" ")[0]}
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                {dentist.publicProfile?.bioPublic || dentist.bio || "Este profesional aún no ha completado su biografía."}
              </p>

              {education.length > 0 && (
                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                    <GraduationCap className="w-4 h-4 text-blue-600" /> Formación y Trayectoria
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {education.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-700 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* Services */}
            {dentist.services.length > 0 && (
              <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" /> Servicios y Precios
                </h2>
                <div className="divide-y divide-slate-100">
                  {dentist.services.map(s => (
                    <div key={s.id} className="py-4 flex items-center justify-between gap-4 group">
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.durationMin} min</span>
                          {s.description && <span>· {s.description}</span>}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900">
                          {s.priceCLP ? new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(s.priceCLP) : "—"}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Precio base</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-[11px] text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                  * Los precios son referenciales y pueden variar según la evaluación clínica y complejidad del tratamiento.
                </p>
              </section>
            )}

            {/* Reviews */}
            <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" /> Opiniones de pacientes
                </h2>
                {rating && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-4 py-1.5 rounded-2xl border border-yellow-200">
                    <span className="text-lg font-black text-yellow-700">{rating}</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} className={`w-3 h-3 ${i <= Math.round(Number(rating)) ? "fill-yellow-500 text-yellow-500" : "text-yellow-200"}`} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {dentist.reviews.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <MessageCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Aún no hay opiniones para este profesional.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {dentist.reviews.map(r => (
                    <div key={r.id} className="p-5 rounded-2xl border border-slate-100 hover:border-slate-200 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{r.patientName}</span>
                            {r.verified && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                <ShieldCheck className="w-3 h-3" /> PACIENTE VERIFICADO
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-bold">
                            {r.treatment} · {new Date(r.date).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? "fill-yellow-500 text-yellow-500" : "text-yellow-100"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{r.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            
            {/* Booking Card */}
            <div className="sticky top-24 bg-white rounded-3xl border-2 border-blue-600 p-6 shadow-xl shadow-blue-500/10">
              <h3 className="text-xl font-bold mb-6 text-slate-900">Agenda tu atención</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 border border-blue-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Reserva online</p>
                    <p className="text-sm font-semibold text-blue-900">Confirmación inmediata</p>
                  </div>
                </div>
              </div>

              <Link 
                href={`/agendar/${dentist.id}`}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-center block hover:bg-blue-700 transition transform active:scale-95 shadow-lg shadow-blue-600/25"
              >
                AGENDAR AHORA
              </Link>

              {dentist.phone && (
                <a 
                  href={`https://wa.me/${dentist.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank" rel="noreferrer"
                  className="w-full mt-3 py-3 bg-white border border-slate-200 text-emerald-600 rounded-2xl font-bold text-center flex items-center justify-center gap-2 hover:bg-emerald-50 transition"
                >
                  <MessageCircle className="w-5 h-5" /> Contactar por WhatsApp
                </a>
              )}

              <p className="text-[10px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
                Más de 50 pacientes agendados este mes
              </p>
            </div>

            {/* Locations (Sedes) */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <Building2 className="w-4 h-4 text-blue-600" /> Dónde atiende
              </h3>
              <div className="space-y-4">
                {dentist.locations.map(l => (
                  <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{l.name}</h4>
                    <p className="text-xs text-slate-500 mb-2">{l.address}, {l.commune || l.city}</p>
                    <a 
                      href={`https://maps.google.com/?q=${l.address} ${l.city}`} 
                      target="_blank" rel="noreferrer"
                      className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" /> VER EN MAPA
                    </a>
                  </div>
                ))}
                {dentist.clinic && (
                  <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Clínica Principal</p>
                    <h4 className="font-bold text-slate-900 text-sm">{dentist.clinic.name}</h4>
                    <p className="text-xs text-slate-500">{dentist.clinic.address}, {dentist.clinic.commune || dentist.clinic.city}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Insurance & Payment */}
            {(insurance.length > 0 || paymentMethods.length > 0) && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-blue-600" /> Pagos y Seguros
                </h3>
                
                {insurance.length > 0 && (
                  <div className="mb-4">
                    <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Acepta convenios con</p>
                    <div className="flex flex-wrap gap-1.5">
                      {insurance.map(i => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">{i}</span>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethods.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">Métodos de pago</p>
                    <div className="flex flex-wrap gap-1.5">
                      {paymentMethods.map(m => (
                        <span key={m} className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">{m}</span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Social */}
            {(dentist.publicProfile?.facebookUrl || dentist.publicProfile?.instagramUrl) && (
              <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">Redes Sociales</h3>
                <div className="flex gap-2">
                  {dentist.publicProfile?.facebookUrl && (
                    <a href={dentist.publicProfile.facebookUrl} target="_blank" rel="noreferrer" className="flex-1 p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition flex items-center justify-center gap-2 border border-blue-100">
                      <Facebook className="w-5 h-5" /> <span className="text-xs font-bold">Facebook</span>
                    </a>
                  )}
                  {dentist.publicProfile?.instagramUrl && (
                    <a href={dentist.publicProfile.instagramUrl} target="_blank" rel="noreferrer" className="flex-1 p-3 rounded-2xl bg-pink-50 text-pink-700 hover:bg-pink-600 hover:text-white transition flex items-center justify-center gap-2 border border-pink-100">
                      <Instagram className="w-5 h-5" /> <span className="text-xs font-bold">Instagram</span>
                    </a>
                  )}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
      
      {/* ══ Floating Mobile CTA ══ */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-200 z-50 md:hidden flex gap-3">
        <Link 
          href={`/agendar/${dentist.id}`}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold text-center shadow-lg shadow-blue-600/20 active:scale-95 transition"
        >
          AGENDAR AHORA
        </Link>
        {dentist.phone && (
          <a 
            href={`https://wa.me/${dentist.phone.replace(/[^0-9]/g, "")}`}
            target="_blank" rel="noreferrer"
            className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
        )}
      </div>

      {/* ══ Footer ══ */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12 pb-28 md:pb-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black grid place-items-center text-sm">D</div>
            <span className="font-bold text-lg text-slate-900">DentCode</span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            DentCode es la plataforma líder en Chile para la gestión odontológica y conexión con pacientes verificados.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href="/buscar" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-blue-600">Buscar Dentistas</Link>
            <Link href="/" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-blue-600">Para Clínicas</Link>
            <Link href="/login" className="text-[10px] md:text-xs font-bold text-slate-400 hover:text-blue-600">Acceso Profesional</Link>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 text-[9px] md:text-[10px] text-slate-400 font-medium">
            © {new Date().getFullYear()} DentCode. Desarrollado por Leucode.IA · Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
