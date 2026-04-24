"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, CheckCircle2, X, Copy, MessageCircle, Plus, Loader2, Send } from "lucide-react";

interface Review {
  id: string;
  patientName: string;
  rating: number;
  comment: string | null;
  treatment: string | null;
  date: string;
  verified: boolean;
  published: boolean;
}

interface ReviewRequest {
  id: string;
  patientName: string;
  patientPhone: string | null;
  token: string;
  createdAt: string;
}

export function ReviewsClient({
  reviews,
  pendingRequests,
}: {
  reviews: Review[];
  pendingRequests: ReviewRequest[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"reviews" | "requests">("reviews");
  const [showNew, setShowNew] = useState(false);

  const moderate = async (id: string, action: "publish" | "unpublish" | "delete") => {
    await fetch(`/api/reviews/${id}`, {
      method: action === "delete" ? "DELETE" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: action === "delete" ? undefined : JSON.stringify({ published: action === "publish" }),
    });
    router.refresh();
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200">
        <div className="flex gap-1">
          <TabBtn active={tab === "reviews"} onClick={() => setTab("reviews")}>
            Reseñas ({reviews.length})
          </TabBtn>
          <TabBtn active={tab === "requests"} onClick={() => setTab("requests")}>
            Solicitudes ({pendingRequests.length})
          </TabBtn>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="px-3 py-2 mb-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Solicitar reseña
        </button>
      </div>

      {/* Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <EmptyState text="Aún no tienes reseñas. Solicita una a tus pacientes al finalizar la atención." />
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className={`bg-white border rounded-xl p-4 ${
                  r.published ? "border-emerald-200" : "border-amber-200"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 text-blue-700 grid place-items-center text-xs font-bold flex-shrink-0">
                    {r.patientName.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-slate-900">{r.patientName}</p>
                      {r.verified && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-0.5">
                          <CheckCircle2 className="w-3 h-3" /> Verificado
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          r.published
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {r.published ? "Publicada" : "Pendiente"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-current" : "text-slate-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(r.date).toLocaleDateString("es-CL")}
                      </span>
                    </div>
                    {r.treatment && <p className="text-xs text-slate-500 mb-1">Tratamiento: {r.treatment}</p>}
                    {r.comment && <p className="text-sm text-slate-700 leading-relaxed">{r.comment}</p>}
                  </div>
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    {r.published ? (
                      <button
                        onClick={() => moderate(r.id, "unpublish")}
                        className="text-xs px-2 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 transition"
                      >
                        Ocultar
                      </button>
                    ) : (
                      <button
                        onClick={() => moderate(r.id, "publish")}
                        className="text-xs px-2 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        Publicar
                      </button>
                    )}
                    <button
                      onClick={() => confirm("¿Eliminar esta reseña?") && moderate(r.id, "delete")}
                      className="text-xs px-2 py-1 rounded text-red-600 hover:bg-red-50 transition"
                    >
                      <X className="w-3 h-3 inline" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Requests */}
      {tab === "requests" && (
        <div className="space-y-3">
          {pendingRequests.length === 0 ? (
            <EmptyState text="No hay solicitudes pendientes. Cuando envíes una, aparecerá aquí hasta que el paciente la complete." />
          ) : (
            pendingRequests.map((r) => {
              const url = `${baseUrl}/review/${r.token}`;
              const waMsg = encodeURIComponent(
                `Hola ${r.patientName}! Gracias por visitarnos. Nos ayudarías mucho si dejaras una reseña sobre tu experiencia: ${url}`,
              );
              return (
                <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-medium text-slate-900">{r.patientName}</p>
                      <p className="text-xs text-slate-500">
                        Solicitada el {new Date(r.createdAt).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigator.clipboard.writeText(url)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copiar link
                      </button>
                      {r.patientPhone && (
                        <a
                          href={`https://wa.me/${r.patientPhone.replace(/\D/g, "")}?text=${waMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showNew && <NewRequestModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewRequestModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [patientName, setPatientName] = useState("");
  const [patientPhone, setPatientPhone] = useState("+56 9 ");
  const [patientEmail, setPatientEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientName, patientPhone, patientEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(data.message || "Error");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm grid place-items-center p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full"
      >
        <h3 className="font-semibold text-lg mb-1">Solicitar reseña</h3>
        <p className="text-sm text-slate-500 mb-4">
          Generaremos un link único para enviarle al paciente.
        </p>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs font-medium mb-1 block">Nombre del paciente *</span>
            <input
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium mb-1 block">Teléfono (para WhatsApp)</span>
            <input
              value={patientPhone}
              onChange={(e) => setPatientPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium mb-1 block">Email (opcional)</span>
            <input
              type="email"
              value={patientEmail}
              onChange={(e) => setPatientEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </div>
        {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Generar link
          </button>
        </div>
      </form>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
        active ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
