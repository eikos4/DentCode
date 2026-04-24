"use client";
import { CheckCircle2, XCircle, MessageCircle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

export function IntegrationsTab({
  whatsappConfigured,
  verifyToken,
}: {
  whatsappConfigured: boolean;
  verifyToken: string;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/whatsapp/webhook`
      : "/api/whatsapp/webhook";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Integraciones</h2>
        <p className="text-sm text-slate-500">
          Conecta servicios externos para mejorar tu flujo de trabajo
        </p>
      </div>

      {/* WhatsApp */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-slate-900">WhatsApp Business API</h3>
            <p className="text-xs text-slate-500">
              Envía recordatorios y solicitudes de reseña automáticamente
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {whatsappConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Conectado</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">No configurado</span>
              </>
            )}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <p className="text-sm text-slate-600">
            Para conectar WhatsApp, configura las siguientes variables de entorno en tu servidor:
          </p>
          <div className="space-y-2">
            <EnvRow
              label="WHATSAPP_PHONE_NUMBER_ID"
              desc="ID del número de teléfono de WhatsApp Business"
              configured={whatsappConfigured}
            />
            <EnvRow
              label="WHATSAPP_ACCESS_TOKEN"
              desc="Token de acceso de la API de Meta"
              configured={whatsappConfigured}
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-slate-700">Configuración del Webhook</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-24 flex-shrink-0">URL:</span>
              <code className="flex-1 text-xs bg-slate-100 px-3 py-1.5 rounded-lg truncate">
                {webhookUrl}
              </code>
              <button
                onClick={() => copy(webhookUrl, "url")}
                className="p-1 rounded hover:bg-slate-100 text-slate-400"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied === "url" && (
                <span className="text-xs text-green-600">Copiado</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 w-24 flex-shrink-0">Verify Token:</span>
              <code className="flex-1 text-xs bg-slate-100 px-3 py-1.5 rounded-lg truncate">
                {verifyToken}
              </code>
              <button
                onClick={() => copy(verifyToken, "token")}
                className="p-1 rounded hover:bg-slate-100 text-slate-400"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              {copied === "token" && (
                <span className="text-xs text-green-600">Copiado</span>
              )}
            </div>
          </div>
        </div>

        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Ver documentación <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Future integrations placeholder */}
      <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-6 text-center">
        <p className="text-sm text-slate-500">
          Más integraciones próximamente: Google Calendar, Mercado Pago, etc.
        </p>
      </div>
    </div>
  );
}

function EnvRow({
  label,
  desc,
  configured,
}: {
  label: string;
  desc: string;
  configured: boolean;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          configured ? "bg-green-500" : "bg-slate-300"
        }`}
      />
      <div className="flex-1 min-w-0">
        <code className="text-xs font-mono text-slate-700">{label}</code>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </div>
  );
}
