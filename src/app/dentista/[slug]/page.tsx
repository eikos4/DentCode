import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getNextAvailableSlot } from "@/lib/availability";
import { formatCLP } from "@/lib/utils";
import {
  ShieldCheck, Star, MapPin, Clock, Phone, Calendar,
  Globe, CheckCircle2, ArrowLeft, GraduationCap, Briefcase, MessageCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const dentist = await prisma.dentist.findUnique({
    where: { slug },
    include: {
      publicProfile: true,
      locations: true,
      services: { where: { active: true }, orderBy: { order: "asc" } },
      weeklySchedule: { orderBy: { dayOfWeek: "asc" } },
      reviews: {
        where: { published: true },
        orderBy: { date: "desc" },
        take: 10,
      },
    },
  });

  if (!dentist || !dentist.isPublished) {
    notFound();
  }

  // Stats de reviews
  const allReviews = await prisma.review.findMany({
    where: { dentistId: dentist.id, published: true },
    select: { rating: true },
  }) as { rating: number }[];
  const ratingAvg =
    allReviews.length > 0
      ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
      : 0;
  const reviewCount = allReviews.length;

  const nextSlot = await getNextAvailableSlot(dentist.id);

  // JSON fields parseados
  const photos = safeParse<string[]>(dentist.publicProfile?.photos, []);
  const languages = safeParse<string[]>(dentist.publicProfile?.languages, ["Español"]);
  const education = safeParse<string[]>(dentist.publicProfile?.education, []);
  const paymentMethods = safeParse<string[]>(dentist.publicProfile?.paymentMethods, []);
  const insurances = safeParse<string[]>(dentist.publicProfile?.insuranceProviders, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/buscar" className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Volver a búsqueda
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold text-sm">D</div>
            <span className="font-semibold text-slate-900 text-sm">DentCode</span>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-sky-500 to-blue-600 text-white">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Foto */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/10 border-4 border-white/30 overflow-hidden backdrop-blur-sm flex-shrink-0 grid place-items-center">
              {dentist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={dentist.photoUrl} alt={dentist.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-bold">
                  {dentist.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {dentist.verificationStatus === "verified" && (
                  <span className="inline-flex items-center gap-1 text-xs bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                  </span>
                )}
                {dentist.publicProfile?.emergencyCare && (
                  <span className="inline-flex items-center gap-1 text-xs bg-red-500/80 backdrop-blur-sm px-2.5 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> Atiende emergencias
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{dentist.fullName}</h1>
              {dentist.specialty && (
                <p className="text-blue-100 text-lg mt-1">{dentist.specialty}</p>
              )}

              {/* Rating + meta */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(ratingAvg) ? "text-yellow-300 fill-current" : "text-white/30"}`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">{ratingAvg.toFixed(1)}</span>
                    <span className="text-blue-100">({reviewCount} {reviewCount === 1 ? "reseña" : "reseñas"})</span>
                  </div>
                )}
                {dentist.locations.length > 0 && (
                  <div className="flex items-center gap-1.5 text-blue-100">
                    <MapPin className="w-4 h-4" />
                    {dentist.locations[0].commune || dentist.locations[0].city}
                  </div>
                )}
                {dentist.publicProfile?.experience && (
                  <div className="flex items-center gap-1.5 text-blue-100">
                    <Briefcase className="w-4 h-4" />
                    {dentist.publicProfile.experience}
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="w-full md:w-auto flex flex-col gap-2">
              <Link
                href={`/dentista/${slug}/agendar`}
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl hover:bg-blue-50 transition flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Agendar hora
              </Link>
              {nextSlot && (
                <p className="text-xs text-blue-100 text-center">
                  Próximo disponible:{" "}
                  <span className="font-medium text-white">
                    {formatNext(nextSlot)}
                  </span>
                </p>
              )}
              {dentist.phone && (
                <a
                  href={`tel:${dentist.phone}`}
                  className="border border-white/40 text-white px-6 py-2.5 rounded-xl text-sm hover:bg-white/10 transition flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" /> {dentist.phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 grid lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sobre mí */}
          {(dentist.publicProfile?.bioPublic || dentist.bio) && (
            <Card title="Sobre mí">
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {dentist.publicProfile?.bioPublic || dentist.bio}
              </p>
            </Card>
          )}

          {/* Servicios */}
          {dentist.services.length > 0 && (
            <Card title="Servicios y precios">
              <ul className="divide-y divide-slate-100">
                {dentist.services.map((s: typeof dentist.services[number]) => (
                  <li key={s.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{s.name}</p>
                      {s.description && (
                        <p className="text-sm text-slate-500 mt-0.5">{s.description}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        Duración: {s.durationMin} min
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {s.priceCLP ? (
                        <p className="font-semibold text-slate-900">{formatCLP(s.priceCLP)}</p>
                      ) : (
                        <p className="text-xs text-slate-400">Consultar</p>
                      )}
                      <Link
                        href={`/dentista/${slug}/agendar?service=${s.id}`}
                        className="inline-block mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Agendar →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Fotos */}
          {photos.length > 0 && (
            <Card title="Galería">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={p}
                    alt={`Foto ${i + 1}`}
                    className="rounded-lg object-cover aspect-square"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card title={`Reseñas de pacientes (${reviewCount})`}>
            {dentist.reviews.length === 0 ? (
              <p className="text-sm text-slate-500">
                Aún no hay reseñas publicadas. ¡Sé el primero!
              </p>
            ) : (
              <ul className="space-y-5">
                {dentist.reviews.map((r: typeof dentist.reviews[number]) => (
                  <li key={r.id} className="pb-5 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center text-xs font-bold">
                        {r.patientName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm text-slate-900">{r.patientName}</p>
                          {r.verified && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Verificado
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-current" : "text-slate-200"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(r.date).toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
                          </span>
                        </div>
                      </div>
                    </div>
                    {r.treatment && (
                      <p className="text-xs text-slate-500 mb-1">
                        Tratamiento: <span className="font-medium">{r.treatment}</span>
                      </p>
                    )}
                    {r.comment && (
                      <p className="text-sm text-slate-700 leading-relaxed">{r.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ubicaciones */}
          {dentist.locations.length > 0 && (
            <Card title="Ubicaciones">
              <ul className="space-y-4">
                {dentist.locations.map((l: typeof dentist.locations[number]) => (
                  <li key={l.id}>
                    <p className="font-medium text-sm text-slate-900">{l.name}</p>
                    {l.address && (
                      <p className="text-sm text-slate-600 mt-0.5">{l.address}</p>
                    )}
                    {(l.commune || l.city) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[l.commune, l.city, l.region].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {l.phone && (
                      <a
                        href={`tel:${l.phone}`}
                        className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                      >
                        {l.phone}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Horarios */}
          {dentist.weeklySchedule.length > 0 && (
            <Card title="Horarios de atención">
              <ul className="space-y-1.5 text-sm">
                {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                  const entries = dentist.weeklySchedule.filter(
                    (w: typeof dentist.weeklySchedule[number]) => w.dayOfWeek === d && w.enabled,
                  );
                  return (
                    <li key={d} className="flex items-center justify-between">
                      <span className="text-slate-600">{DAYS_ES[d]}</span>
                      {entries.length === 0 ? (
                        <span className="text-slate-400">Cerrado</span>
                      ) : (
                        <span className="font-medium text-slate-900">
                          {entries.map((e: typeof entries[number]) => `${e.openTime}–${e.closeTime}`).join(", ")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}

          {/* Info adicional */}
          <Card title="Información">
            <ul className="space-y-2.5 text-sm">
              {languages.length > 0 && (
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="text-slate-500">Idiomas:</span>{" "}
                    <span className="font-medium text-slate-900">{languages.join(", ")}</span>
                  </span>
                </li>
              )}
              {education.length > 0 && (
                <li className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>
                    <span className="text-slate-500">Formación:</span>
                    <ul className="mt-0.5">
                      {education.map((e, i) => <li key={i} className="font-medium text-slate-900">{e}</li>)}
                    </ul>
                  </span>
                </li>
              )}
              {paymentMethods.length > 0 && (
                <li className="text-slate-600">
                  <span className="text-slate-500">Pagos:</span>{" "}
                  <span className="font-medium text-slate-900">{paymentMethods.join(", ")}</span>
                </li>
              )}
              {dentist.publicProfile?.acceptsInsurance && (
                <li className="text-slate-600">
                  <span className="text-slate-500">Seguros:</span>{" "}
                  <span className="font-medium text-slate-900">
                    {insurances.length > 0 ? insurances.join(", ") : "Acepta convenios"}
                  </span>
                </li>
              )}
              {dentist.licenseNumber && (
                <li className="text-xs text-slate-400 pt-2 border-t border-slate-100">
                  Reg. SIS: {dentist.licenseNumber}
                </li>
              )}
            </ul>
          </Card>

          {/* CTA sticky */}
          <div className="sticky top-20">
            <Link
              href={`/dentista/${slug}/agendar`}
              className="block w-full bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold text-center py-3 rounded-xl shadow-lg hover:shadow-xl transition"
            >
              <Calendar className="w-5 h-5 inline mr-1.5" />
              Agendar hora online
            </Link>
            {dentist.phone && (
              <a
                href={`https://wa.me/${dentist.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="block w-full mt-2 bg-emerald-500 text-white font-semibold text-center py-2.5 rounded-xl hover:bg-emerald-600 transition"
              >
                <MessageCircle className="w-4 h-4 inline mr-1.5" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-4">{title}</h2>
      {children}
    </section>
  );
}

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function formatNext(d: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tgt = new Date(d);
  const day = new Date(tgt);
  day.setHours(0, 0, 0, 0);
  const diff = Math.round((day.getTime() - today.getTime()) / 86400000);
  const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  if (diff === 0) return `hoy ${time}`;
  if (diff === 1) return `mañana ${time}`;
  return `${d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })} ${time}`;
}
