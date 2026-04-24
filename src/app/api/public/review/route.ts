import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  treatment: z.string().optional(),
  patientName: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { token: data.token },
    });
    if (!reviewRequest) {
      return NextResponse.json({ error: "Enlace de revision invalido" }, { status: 404 });
    }
    if (reviewRequest.submittedAt) {
      return NextResponse.json({ error: "Esta revision ya fue enviada" }, { status: 409 });
    }
    if (reviewRequest.expiresAt && reviewRequest.expiresAt < new Date()) {
      return NextResponse.json({ error: "Este enlace ha expirado" }, { status: 410 });
    }
    const review = await prisma.review.create({
      data: {
        dentistId: reviewRequest.dentistId,
        patientName: data.patientName || reviewRequest.patientName,
        rating: data.rating,
        comment: data.comment || null,
        treatment: data.treatment || null,
        verified: true,
        published: true,
      },
    });
    await prisma.reviewRequest.update({
      where: { token: data.token },
      data: { submittedAt: new Date(), reviewId: review.id },
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
