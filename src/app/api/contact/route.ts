import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, accountType, context } = body;

    if (!name || !email || !accountType || !context) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    const message = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        accountType,
        context,
      },
    });

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error) {
    console.error("Error saving contact message:", error);
    return NextResponse.json({ error: "Error al guardar el mensaje" }, { status: 500 });
  }
}
