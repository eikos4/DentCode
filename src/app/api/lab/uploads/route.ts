import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireLabAuth } from "@/lib/lab-auth";
import { saveUpload } from "@/lib/storage";

export async function GET(req: NextRequest) {
  try {
    const lab = requireLabAuth(req);
    const uploads = await prisma.labUpload.findMany({
      where: { labId: lab.labId },
      include: { patient: { select: { fullName: true, rut: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(uploads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const lab = requireLabAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const patientRut = formData.get("patientRut") as string;
    const category = (formData.get("category") as string) || "radiograph";
    const subtype = formData.get("subtype") as string | null;
    const description = formData.get("description") as string | null;
    const orderId = formData.get("orderId") as string | null;

    if (!file || !patientRut) {
      return NextResponse.json({ error: "Se requiere archivo y RUT del paciente" }, { status: 400 });
    }

    const { url, filename, sizeBytes, mime } = await saveUpload({ patientId: `lab/${lab.labId}`, file });

    const patient = await prisma.patient.findFirst({ where: { rut: patientRut } });

    const upload = await prisma.labUpload.create({
      data: {
        labId: lab.labId,
        patientRut,
        patientId: patient?.id || null,
        fileName: filename,
        fileUrl: url,
        fileType: mime,
        category,
        subtype,
        description,
        isMatched: !!patient,
        matchedAt: patient ? new Date() : null,
      },
    });

    // Si hay una orden, vincularla y marcarla como completada
    if (orderId) {
      await prisma.labOrder.update({
        where: { id: orderId },
        data: { 
          status: "COMPLETED",
          resultId: upload.id
        }
      });
    }

    return NextResponse.json(upload, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
