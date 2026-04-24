import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";

// POST - Vincular radiografía a un paciente existente
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();
    await requireRole(["CLINIC_ADMIN", "CLINIC_STAFF"]);

    const { id } = params;
    const { patientId } = await req.json();

    if (!patientId) {
      return NextResponse.json(
        { error: "ID del paciente es requerido" },
        { status: 400 }
      );
    }

    // Verificar que el paciente existe y pertenece a esta clínica
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clinicId: user.clinicId || undefined,
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: "Paciente no encontrado o no pertenece a esta clínica" },
        { status: 404 }
      );
    }

    // Actualizar el upload vinculándolo al paciente
    const upload = await prisma.labUpload.update({
      where: { id },
      data: {
        patientId,
        isMatched: true,
        matchedAt: new Date(),
        matchedBy: user.id,
      },
      include: {
        laboratory: {
          select: { name: true },
        },
      },
    });

    // Opcional: Crear un Attachment vinculado al paciente
    await prisma.attachment.create({
      data: {
        patientId,
        category: "radiograph",
        subtype: upload.subtype || "radiograph",
        url: upload.fileUrl,
        filename: upload.fileName,
        mime: upload.fileType,
        sizeBytes: 0, // No tenemos el tamaño guardado
        note: `Subido por laboratorio: ${upload.laboratory.name}. ${upload.description || ""}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Radiografía vinculada exitosamente al paciente",
      upload: {
        id: upload.id,
        patientName: patient.fullName,
        fileUrl: upload.fileUrl,
      },
    });
  } catch (error: any) {
    console.error("Match lab upload error:", error);
    return NextResponse.json(
      { error: error.message || "Error al vincular radiografía" },
      { status: 401 }
    );
  }
}
