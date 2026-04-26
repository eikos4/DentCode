import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { 
  MapPin, 
  Star, 
  Building2, 
  User, 
  ChevronRight, 
  ShieldCheck,
  Calendar,
  MessageCircle,
  Stethoscope,
  Sparkles,
  Search as SearchIcon
} from "lucide-react";
import SearchFilters from "@/components/search-filters";

interface SearchPageProps {
  searchParams: { 
    q?: string; 
    region?: string; 
    city?: string; 
    type?: string; 
    specialty?: string;
    insurance?: string;
  };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const { 
    q = "", 
    region = "", 
    city = "", 
    type = "", 
    specialty = "", 
    insurance = "" 
  } = searchParams;

  // 1. Obtener datos para filtros dinámicos
  const [clinicRegions, locationRegions, allSpecs] = await Promise.all([
    prisma.clinic.findMany({ select: { region: true }, where: { region: { not: null }, isActive: true } }),
    prisma.clinicLocation.findMany({ select: { region: true }, where: { region: { not: null }, isActive: true } }),
    prisma.dentist.findMany({ select: { specialty: true }, where: { specialty: { not: null }, isActive: true, isPublished: true } }),
  ]);

  const [clinicCities, locationCities] = await Promise.all([
    prisma.clinic.findMany({ select: { commune: true, city: true }, where: { isActive: true } }),
    prisma.clinicLocation.findMany({ select: { commune: true, city: true }, where: { isActive: true } }),
  ]);

  const regionsList = Array.from(new Set([
    ...clinicRegions.map(r => r.region!),
    ...locationRegions.map(r => r.region!)
  ])).sort();

  const citiesList = Array.from(new Set([
    ...clinicCities.map(c => c.commune || c.city || ""),
    ...locationCities.map(c => c.commune || c.city || "")
  ])).filter(Boolean).sort();

  const specialtiesList = Array.from(new Set(allSpecs.map(s => s.specialty!))).sort();

  // 2. Construir condiciones de búsqueda
  const dentistConditions: any[] = [{ isActive: true, isPublished: true }];
  const clinicConditions: any[] = [{ isActive: true }];

  if (q) {
    const qFilter = { contains: q, mode: "insensitive" };
    dentistConditions.push({
      OR: [
        { fullName: qFilter },
        { specialty: qFilter },
        { bio: qFilter },
      ]
    });
    clinicConditions.push({
      OR: [
        { name: qFilter },
        { address: qFilter },
      ]
    });
  }

  if (specialty) {
    dentistConditions.push({ specialty: { contains: specialty, mode: "insensitive" } });
  }

  if (region) {
    dentistConditions.push({
      OR: [
        { locations: { some: { region, isActive: true } } },
        { clinic: { region } }
      ]
    });
    clinicConditions.push({
      OR: [
        { region },
        { locations: { some: { region, isActive: true } } }
      ]
    });
  }

  if (city) {
    const cityFilter = { contains: city, mode: "insensitive" };
    const cityCondition = {
      OR: [ { city: cityFilter }, { commune: cityFilter } ]
    };
    dentistConditions.push({
      OR: [
        { locations: { some: { ...cityCondition, isActive: true } } },
        { clinic: cityCondition }
      ]
    });
    clinicConditions.push({
      OR: [
        { city: cityFilter },
        { commune: cityFilter },
        { locations: { some: { ...cityCondition, isActive: true } } }
      ]
    });
  }

  if (insurance) {
    dentistConditions.push({
      publicProfile: {
        insuranceProviders: { contains: insurance, mode: "insensitive" }
      }
    });
  }

  const [dentists, clinics] = await Promise.all([
    type === "clinic" ? Promise.resolve([]) : prisma.dentist.findMany({
      where: { AND: dentistConditions },
      include: {
        reviews: { where: { published: true }, select: { rating: true } },
        locations: { where: { isActive: true }, select: { city: true, commune: true, address: true, region: true }, take: 1 },
        clinic: { select: { city: true, commune: true, region: true, name: true } },
        publicProfile: { select: { acceptsInsurance: true, insuranceProviders: true } }
      },
      take: 30,
    }),
    type === "dentist" ? Promise.resolve([]) : prisma.clinic.findMany({
      where: { AND: clinicConditions },
      include: {
        locations: { where: { isActive: true }, select: { city: true, commune: true, address: true }, take: 1 },
      },
      take: 30,
    }),
  ]);

  const results = [
    ...dentists.map(d => ({
      id: d.id,
      type: "dentist" as const,
      name: d.fullName,
      sub: d.specialty || "Odontología General",
      image: d.photoUrl,
      slug: `/dentista/${d.slug}`,
      rating: d.reviews.length > 0 ? (d.reviews.reduce((a, b) => a + b.rating, 0) / d.reviews.length).toFixed(1) : null,
      reviewCount: d.reviews.length,
      location: d.locations[0]?.commune || d.locations[0]?.city || d.clinic?.commune || d.clinic?.city || "Chile",
      address: d.locations[0]?.address || (d.clinic ? `En ${d.clinic.name}` : undefined),
      isVerified: d.verificationStatus === "verified",
      acceptsInsurance: d.publicProfile?.acceptsInsurance,
      phone: d.phone
    })),
    ...clinics.map(c => ({
      id: c.id,
      type: "clinic" as const,
      name: c.name,
      sub: "Clínica Dental",
      image: c.logoUrl,
      slug: `/clinica/${c.id}`,
      rating: null,
      reviewCount: 0,
      location: c.commune || c.city || c.locations[0]?.commune || c.locations[0]?.city || "Chile",
      address: c.address || c.locations[0]?.address,
      isVerified: true,
      acceptsInsurance: true,
      phone: c.phone
    }))
  ].sort((a, b) => b.isVerified ? -1 : 1);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ══ Top bar (Matching Landing) ══ */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-2 text-[10px] sm:text-xs flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 flex-shrink-0" />
          <span>Parte del ecosistema{" "}</span>
          <a href="https://www.leucode.cl" target="_blank" rel="noreferrer" className="font-semibold text-sky-300 hover:underline">Leucode.IA</a>
          <span className="hidden sm:inline">{" "}· Salud digital con IA para Chile y LATAM</span>
        </div>
      </div>

      {/* ══ Nav (Matching Landing Minimal) ══ */}
      <header className="sticky top-0 z-50 glass bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-400 grid place-items-center text-white font-black shadow-lg shadow-blue-500/25 text-sm">D</div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Dent<span className="text-blue-600">Code</span></span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Ingresar</Link>
          </div>
        </div>
      </header>

      {/* ══ Hero Section (Polished) ══ */}
      <div className="relative bg-slate-950 text-white overflow-hidden py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500 blur-[80px] rounded-full" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-400/30 bg-blue-500/10 text-[10px] font-bold text-blue-300 mb-6 uppercase tracking-widest">
                Directorio Profesional
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                Encuentra tu próximo <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-sky-300">dentista ideal</span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed">
                Agenda citas con los mejores profesionales verificados en Chile. 
                Sin complicaciones, todo digital.
              </p>
            </div>
            <div className="hidden lg:flex gap-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <p className="text-3xl font-bold text-blue-400">500+</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Dentistas</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
                <p className="text-3xl font-bold text-sky-400">100%</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Verificados</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <SearchFilters 
              initialFilters={{ q, region, city, type, specialty, insurance }} 
              regions={regionsList}
              cities={citiesList}
              specialties={specialtiesList}
            />
          </aside>

          {/* Resultados */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full anim-pulse-ring" />
                <span className="text-sm font-bold text-slate-600 uppercase tracking-[0.15em]">
                  {results.length} Disponibles
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200">
                Ordenar por:
                <select className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer">
                  <option>Recomendados</option>
                  <option>Mejor Valorados</option>
                </select>
              </div>
            </div>

            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-blue-500 opacity-50" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No encontramos resultados</h3>
                <p className="text-slate-500 mb-8">Intenta ajustar los filtros para encontrar más opciones.</p>
                <Link href="/buscar" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                  Ver todos los perfiles
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {results.map((item) => (
                  <div 
                    key={`${item.type}-${item.id}`} 
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    <div className="flex flex-col sm:flex-row h-full">
                      {/* Imagen */}
                      <div className="w-full sm:w-44 h-44 sm:h-auto bg-slate-50 relative overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${item.type === "clinic" ? "text-emerald-400" : "text-blue-400"}`}>
                            {item.type === "clinic" ? <Building2 className="w-12 h-12 opacity-40" /> : <User className="w-12 h-12 opacity-40" />}
                          </div>
                        )}
                        <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider text-white ${item.type === "clinic" ? "bg-emerald-600" : "bg-blue-600"}`}>
                          {item.type === "clinic" ? "Clínica" : "Dentista"}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 p-5 flex flex-col">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {item.isVerified && <ShieldCheck className="w-4 h-4 text-blue-600" />}
                              <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{item.name}</h3>
                            </div>
                            <div className="flex items-center gap-1 text-blue-600">
                              <Stethoscope className="w-3.5 h-3.5" />
                              <p className="text-[11px] font-bold uppercase tracking-wider">{item.sub}</p>
                            </div>
                          </div>
                          {item.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200">
                              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-yellow-700">{item.rating}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 mb-5">
                          <div className="flex items-center gap-2 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-medium">{item.location}</span>
                          </div>
                          {item.address && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 italic">{item.address}</p>
                          )}
                        </div>

                        <div className="mt-auto space-y-2">
                          <Link 
                            href={`/agendar/${item.id}`}
                            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10"
                          >
                            <Calendar className="w-4 h-4" />
                            AGENDAR CITA
                          </Link>
                          
                          <div className="flex gap-2">
                            <Link 
                              href={item.slug} 
                              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-slate-50 transition text-center flex items-center justify-center"
                            >
                              VER PERFIL
                            </Link>
                            {item.phone && (
                              <a 
                                href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center justify-center px-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
