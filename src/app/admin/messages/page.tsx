import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageSquare, Trash2, CheckCircle, Mail, Phone, Clock } from "lucide-react";
import { AdminMessageActions } from "./admin-message-actions";

export const metadata = {
  title: "Mensajes de Contacto — Admin",
};

export default async function AdminMessagesPage() {
  const user = await getAuthUser();
  if (!user || user.role !== "SUPER_ADMIN") redirect("/login");

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            Mensajes de Contacto
          </h1>
          <p className="text-slate-500 mt-1">Bandeja de entrada de la página principal</p>
        </div>
        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
          {messages.length} mensajes totales
        </div>
      </div>

      <div className="grid gap-4">
        {messages.length === 0 ? (
          <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No hay mensajes por ahora.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-6 rounded-xl border transition-all ${
                msg.status === "UNREAD" 
                  ? "bg-white border-blue-200 shadow-sm shadow-blue-100 ring-1 ring-blue-50" 
                  : "bg-slate-50 border-slate-200 opacity-80"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    {msg.status === "UNREAD" ? (
                      <span className="flex w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    ) : (
                      <span className="flex w-2.5 h-2.5 rounded-full bg-slate-300 shrink-0" />
                    )}
                    <h3 className="font-semibold text-slate-900 text-lg">{msg.name}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                      {msg.accountType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${msg.email}`} className="hover:text-blue-600">{msg.email}</a>
                    </div>
                    {msg.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${msg.phone}`} className="hover:text-blue-600">{msg.phone}</a>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {new Date(msg.createdAt).toLocaleString("es-CL")}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-white border border-slate-100 text-slate-700 text-sm whitespace-pre-wrap">
                    {msg.context}
                  </div>
                </div>

                <div className="shrink-0 flex md:flex-col gap-2">
                  <AdminMessageActions id={msg.id} currentStatus={msg.status} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
