"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function AppointmentActions({ id, status, phone }: { id: string; status: string; phone: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  async function setStatus(newStatus: string) {
    start(async () => {
      await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    });
  }

  async function resend() {
    start(async () => {
      await fetch(`/api/appointments/${id}/notify`, { method: "POST" });
      router.refresh();
      alert("Mensaje enviado (o simulado si WhatsApp no está configurado)");
    });
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== "CONFIRMED" && (
        <button disabled={pending} onClick={() => setStatus("CONFIRMED")} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white">Confirmar</button>
      )}
      {status !== "COMPLETED" && (
        <button disabled={pending} onClick={() => setStatus("COMPLETED")} className="text-[10px] px-1.5 py-0.5 rounded bg-sky-600 text-white">Completada</button>
      )}
      {status !== "NO_SHOW" && (
        <button disabled={pending} onClick={() => setStatus("NO_SHOW")} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-600 text-white">No-show</button>
      )}
      {phone && (
        <button disabled={pending} onClick={resend} className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white">WhatsApp</button>
      )}
    </div>
  );
}
