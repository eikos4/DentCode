import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentDentistId } from "@/lib/auth";
import { saveUpload } from "@/lib/storage";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const dentistId = await getCurrentDentistId();
    if (!dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

    // Guardar imagen usando la utilidad existente
    const saved = await saveUpload({ 
      id: dentistId, 
      file, 
      category: "dentists" 
    });

    // Actualizar photoUrl del dentista
    await prisma.dentist.update({
      where: { id: dentistId },
      data: { photoUrl: saved.url }
    });

    return NextResponse.json({ url: saved.url });
  } catch (error: any) {
    console.error("Photo upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
