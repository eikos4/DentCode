"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Trash2, Mail } from "lucide-react";

export function AdminMessageActions({ id, currentStatus }: { id: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    const newStatus = currentStatus === "UNREAD" ? "READ" : "UNREAD";
    await fetch(`/api/admin/messages/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
    setLoading(false);
  };

  const deleteMessage = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar este mensaje?")) return;
    setLoading(true);
    await fetch(`/api/admin/messages/${id}`, {
      method: "DELETE",
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <button 
        onClick={toggleStatus}
        disabled={loading}
        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
          currentStatus === "UNREAD" 
            ? "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200" 
            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
        } disabled:opacity-50`}
      >
        {currentStatus === "UNREAD" ? <CheckCircle className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
        {currentStatus === "UNREAD" ? "Marcar visto" : "Marcar no visto"}
      </button>

      <button 
        onClick={deleteMessage}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 transition disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
        Eliminar
      </button>
    </>
  );
}
