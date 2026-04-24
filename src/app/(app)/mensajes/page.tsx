import { redirect } from "next/navigation";
import { getAuthUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import Link from "next/link";
import { MessageCircle, Send, Clock } from "lucide-react";
import { formatDate } from "../../../lib/utils";

export default async function MensajesPage() {
  const user = await getAuthUser();
  if (!user || !user.dentistId) redirect("/login");

  const messages = await prisma.messageLog.findMany({
    where: { appointment: { dentistId: user.dentistId } },
    include: { appointment: { select: { startAt: true, patient: { select: { fullName: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mensajes</h1>
          <p className="text-gray-500 text-sm">Historial de comunicaciones con pacientes</p>
        </div>
        <Link
          href="/configuracion?tab=integrations"
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <Send className="w-4 h-4" /> Configurar WhatsApp
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No hay mensajes aun</p>
            <p className="text-xs mt-1">Los mensajes de WhatsApp apareceran aqui</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className="p-4 flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.direction === "out" ? "bg-blue-100" : "bg-green-100"
                }`}>
                  {msg.direction === "out" ? <Send className="w-4 h-4 text-blue-600" /> : <MessageCircle className="w-4 h-4 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {msg.appointment?.patient?.fullName || msg.to}
                  </p>
                  <p className="text-sm text-gray-600 mt-0.5 truncate">{msg.body}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400">{formatDate(msg.createdAt)}</p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    msg.status === "delivered" ? "bg-green-100 text-green-700" :
                    msg.status === "failed" ? "bg-red-100 text-red-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{msg.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
