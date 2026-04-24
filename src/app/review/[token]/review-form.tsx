"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2, AlertCircle } from "lucide-react";

export function ReviewForm({ token, patientName }: { token: string; patientName: string }) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [treatment, setTreatment] = useState("");
  const [comment, setComment] = useState("");
  const [displayName, setDisplayName] = useState(patientName);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Por favor selecciona una calificación");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, rating, treatment, comment, patientName: displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        router.refresh();
      } else {
        setError(data.message || "Error al enviar reseña");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const currentRating = hoverRating || rating;
  const ratingLabels = ["", "Muy mala", "Mala", "Regular", "Buena", "Excelente"];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Rating */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-10 h-10 ${
                  n <= currentRating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-200"
                }`}
              />
            </button>
          ))}
        </div>
        <p className="text-sm text-slate-600 h-5">
          {currentRating > 0 ? ratingLabels[currentRating] : "Califica tu experiencia"}
        </p>
      </div>

      <label className="block">
        <span className="text-xs font-medium text-slate-700 mb-1 block">Tratamiento realizado (opcional)</span>
        <input
          type="text"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Ej: Limpieza dental, endodoncia..."
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-slate-700 mb-1 block">Cuéntanos tu experiencia</span>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={5}
          maxLength={500}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
          placeholder="¿Qué te gustó? ¿Qué podría mejorar? Tu opinión ayuda a otros pacientes."
        />
        <span className="text-[11px] text-slate-400 mt-1 block text-right">
          {comment.length}/500
        </span>
      </label>

      <label className="block">
        <span className="text-xs font-medium text-slate-700 mb-1 block">Cómo firmar tu reseña</span>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          placeholder="Tu nombre público"
        />
        <span className="text-[11px] text-slate-400 mt-1 block">
          Aparecerá como: <b>{displayName || "Anónimo"}</b>
        </span>
      </label>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-sm text-red-800">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Enviar reseña
      </button>
    </form>
  );
}
