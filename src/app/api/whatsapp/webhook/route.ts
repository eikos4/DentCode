import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { prisma } from "../../../../lib/prisma";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "dentcode-verify";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge || "", { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];
    if (message) {
      const from = message.from;
      const text = message.text?.body || "";
      await prisma.messageLog.create({
        data: {
          channel: "whatsapp",
          direction: "in",
          to: from,
          body: text,
          status: "received",
        },
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 200 }); // WhatsApp requiere 200 siempre
  }
}
