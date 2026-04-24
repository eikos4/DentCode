import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, MapPin, Star } from "lucide-react";

interface SearchPageProps {
  searchParams: { q?: string; city?: string; specialty?: string };
}

export default async function BuscarPage({ searchParams }: SearchPageProps) {
  const { q, city, specialty } = searchParams;

  const dentists = await prisma.dentist.findMany({
    where: {
      isPublished: true,
      isActive: true,
      ...(q ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { specialty: { contains: q, mode: "insensitive" } },
        ],
      } : {}),
      ...(specialty ? { specialty: { contains: specialty, mode: "insensitive" } } : {}),
    },
    include: {
      reviews: { where: { published: true }, select: { rating: true } },
      locations: { where: { isActive: true }, select: { city: true, commune: true, address: true }, take: 1 },
      publicProfile: { select: { bioPublic: true, services: true } },
    },
    orderBy: { fullName: "asc" },
    take: 50,
  });

  const filtered = city
    ? dentists.filter((d) => d.locations.some((l) => l.city?.toLowerCase().includes(city.toLowerCase())))
    : dentists;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Encuentra tu dentista</h1>
          <p className="text-gray-500 mb-6">Busca dentistas verificados en tu zona</p>
          <form className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Nombre o especialidad..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <input name="city" defaultValue={city} placeholder="Ciudad..." className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-40" />
            <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Buscar
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500 mb-4">{filtered.length} dentistas encontrados</p>
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>No se encontraron dentistas con esos criterios</p>
            </div>
          ) : filtered.map((d) => {
            const avgRating = d.reviews.length > 0
              ? (d.reviews.reduce((acc, r) => acc + r.rating, 0) / d.reviews.length).toFixed(1)
              : null;
            const location = d.locations[0];
            return (
              <Link key={d.id} href={`/dentista/${d.slug}`} className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">{d.fullName}</h2>
                    <p className="text-sm text-gray-500 mt-0.5">{d.specialty || "Odontologia general"}</p>
                    {location && (
                      <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {location.commune || location.city}
                      </p>
                    )}
                  </div>
                  {avgRating && (
                    <div className="flex items-center gap-1 text-sm font-medium text-yellow-600">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {avgRating} ({d.reviews.length})
                    </div>
                  )}
                </div>
                {d.bio && <p className="text-sm text-gray-600 mt-3 line-clamp-2">{d.bio}</p>}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
