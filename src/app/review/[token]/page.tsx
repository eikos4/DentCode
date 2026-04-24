import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./review-form";
import { CheckCircle2, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const request = await prisma.reviewRequest.findUnique({
    where: { token },
    include: {
      dentist: { select: { fullName: true, slug: true, photoUrl: true, specialty: true } },
    },
  });

  if (!request) notFound();

  // Ya enviada
  if (request.submittedAt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white grid place-items-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Ya enviaste tu reseña</h1>
          <p className="text-slate-600 mb-6">
            Gracias por tu feedback sobre <b>{request.dentist.fullName}</b>. Ayudas a otros pacientes a tomar mejores decisiones.
          </p>
          <a
            href={`/dentista/${request.dentist.slug}`}
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Ver perfil del dentista
          </a>
        </div>
      </div>
    );
  }

  // Expirada
  if (request.expiresAt && request.expiresAt < new Date()) {
    return (
      <div className="min-h-screen bg-slate-50 grid place-items-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Este enlace ha expirado</h1>
          <p className="text-slate-600">Contacta directamente al profesional para dejar tu feedback.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Hero */}
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 text-white p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current text-yellow-300" />
              ))}
            </div>
            <h1 className="text-2xl font-bold">¿Cómo fue tu experiencia?</h1>
            <p className="text-blue-100 text-sm mt-1">
              Comparte tu opinión sobre <b>{request.dentist.fullName}</b>
            </p>
          </div>

          {/* Dentista card */}
          <div className="border-b border-slate-100 p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center font-bold flex-shrink-0 overflow-hidden">
              {request.dentist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={request.dentist.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                request.dentist.fullName.split(" ").map((s) => s[0]).slice(0, 2).join("")
              )}
            </div>
            <div>
              <p className="font-semibold text-slate-900">{request.dentist.fullName}</p>
              {request.dentist.specialty && (
                <p className="text-sm text-slate-500">{request.dentist.specialty}</p>
              )}
            </div>
          </div>

          <div className="p-6">
            <ReviewForm token={token} patientName={request.patientName} />
          </div>
        </div>

        <p className="text-xs text-slate-500 text-center mt-4">
          Tu reseña será revisada antes de publicarse. Sé honesto y respetuoso.
        </p>
      </div>
    </div>
  );
}
