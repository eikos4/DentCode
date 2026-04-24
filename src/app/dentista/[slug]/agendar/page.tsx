import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";
import { BookingWizard } from "./booking-wizard";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ service?: string }>;
}) {
  const { slug } = await params;
  const { service: preselectedServiceId } = await searchParams;

  const dentist = await prisma.dentist.findUnique({
    where: { slug },
    select: {
      id: true,
      fullName: true,
      specialty: true,
      photoUrl: true,
      isPublished: true,
      slug: true,
      services: {
        where: { active: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          description: true,
          durationMin: true,
          priceCLP: true,
        },
      },
      locations: {
        select: {
          id: true,
          name: true,
          address: true,
          commune: true,
          city: true,
        },
      },
    },
  });

  if (!dentist || !dentist.isPublished) notFound();

  const services = dentist.services;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/dentista/${slug}`}
            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al perfil
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold text-sm">D</div>
            <span className="font-semibold text-slate-900 text-sm">DentCode</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header dentista */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center font-bold flex-shrink-0 overflow-hidden">
            {dentist.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={dentist.photoUrl} alt={dentist.fullName} className="w-full h-full object-cover" />
            ) : (
              dentist.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-slate-500">Agendando con</p>
            <h1 className="font-semibold text-slate-900 truncate">{dentist.fullName}</h1>
            {dentist.specialty && (
              <p className="text-sm text-slate-600 truncate">{dentist.specialty}</p>
            )}
          </div>
        </div>

        <BookingWizard
          slug={dentist.slug!}
          services={services}
          preselectedServiceId={preselectedServiceId}
          locations={dentist.locations}
        />
      </div>
    </div>
  );
}
