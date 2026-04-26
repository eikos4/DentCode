"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { MessageCircle, CheckCircle2, CheckSquare, UserX, Send } from "lucide-react";

export function AppointmentActions({ id, status, phone, onSuccess }: { id: string; status: string; phone: string; onSuccess?: (isCompleted?: boolean) => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function setStatus(newStatus: string) {
    start(async () => {
      try {
        const res = await fetch(`/api/appointments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("Error al actualizar");
        
        router.refresh();
        if (onSuccess) onSuccess(newStatus === "COMPLETED");
      } catch (error) {
        alert("No se pudo actualizar el estado");
      }
    });
  }

  async function sendNotification() {
    start(async () => {
      try {
        const res = await fetch(`/api/appointments/${id}/notify`, { method: "POST" });
        if (!res.ok) throw new Error("Error al enviar");
        
        alert("Mensaje de WhatsApp enviado correctamente");
        router.refresh();
      } catch (error) {
        alert("Error al enviar notificación por WhatsApp");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-2">
        {status === "SCHEDULED" && (
          <button
            disabled={pending}
            onClick={() => setStatus("CONFIRMED")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Confirmar
          </button>
        )}
        
        {status !== "COMPLETED" && (
          <button
            disabled={pending}
            onClick={() => setStatus("COMPLETED")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            Completada
          </button>
        )}
        
        {status !== "NO_SHOW" && (
          <button
            disabled={pending}
            onClick={() => setStatus("NO_SHOW")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition shadow-sm active:scale-95"
          >
            <UserX className="w-3.5 h-3.5" />
            No show
          </button>
        )}

        <button
          disabled={pending}
          onClick={sendNotification}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm active:scale-95"
        >
          <Send className="w-3.5 h-3.5" />
          WhatsApp
        </button>
      </div>

      <div className="flex-1" />

      {phone && (
        <a
          href={`https://wa.me/${phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white text-sm font-bold transition shadow-lg shadow-green-500/20 active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-current" />
          WhatsApp
        </a>
      )}
    </div>
  );
}
