/**
 * Cliente mínimo para WhatsApp Cloud API (Meta).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
import { prisma } from "./prisma";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export type SendResult = { ok: boolean; providerId?: string; error?: string };

export async function sendWhatsAppText(to: string, body: string, appointmentId?: string): Promise<SendResult> {
  // Si no hay credenciales, registramos como simulado para que la app funcione en dev.
  if (!TOKEN || !PHONE_ID) {
    await prisma.messageLog.create({
      data: {
        appointmentId,
        channel: "whatsapp",
        direction: "out",
        to,
        body,
        status: "simulated",
      },
    });
    return { ok: true, providerId: "simulated" };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: to.replace(/\D/g, ""),
        type: "text",
        text: { body },
      }),
    });
    const data = await res.json();
    const providerId = data?.messages?.[0]?.id;
    await prisma.messageLog.create({
      data: {
        appointmentId,
        channel: "whatsapp",
        direction: "out",
        to,
        body,
        status: res.ok ? "sent" : "failed",
        providerId,
      },
    });
    return { ok: res.ok, providerId, error: res.ok ? undefined : JSON.stringify(data) };
  } catch (err: any) {
    return { ok: false, error: String(err) };
  }
}

export function buildConfirmationMessage(params: {
  patientName: string;
  dentistName: string;
  startAt: Date;
}) {
  const when = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(params.startAt);
  return (
    `Hola ${params.patientName} 👋\n\n` +
    `Te recordamos tu hora con ${params.dentistName} el ${when}.\n\n` +
    `Responde:\n• *SI* para confirmar\n• *NO* para cancelar\n\n— Dentcode`
  );
}
