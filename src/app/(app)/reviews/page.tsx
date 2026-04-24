import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function ReviewsPage() {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const reviews = await prisma.review.findMany({
    where: { dentistId: user.dentistId },
    orderBy: { date: "desc" },
  });

  const avg = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resenas</h1>
          <p className="text-gray-500 text-sm">{reviews.length} resenas · Promedio: {avg ? `${avg} ★` : "Sin resenas"}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Star className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Aun no tienes resenas</p>
            <p className="text-xs mt-1">Solicita resenas desde la agenda</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {reviews.map((review) => (
              <div key={review.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{review.patientName}</p>
                    {review.treatment && <p className="text-xs text-gray-400 mt-0.5">{review.treatment}</p>}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(review.date)}</p>
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-600 mt-2">{review.comment}</p>}
                {!review.published && (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-2 inline-block">No publicada</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
