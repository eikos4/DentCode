import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import { getAuthUser } from "../../../../lib/auth";
import cuid from "cuid";

// Use crypto for cuid replacement if needed
function generateToken() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const schema = z.object({
  dentistId: z.string(),
  patientName: z.string().min(2),
  patientPhone: z.string().optional(),
  patientEmail: z.string().email().optional().or(z.literal("")),
  appointmentId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const data = schema.parse(await req.json());
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const request = await prisma.reviewRequest.create({
      data: {
        dentistId: data.dentistId,
        patientName: data.patientName,
        patientPhone: data.patientPhone || null,
        patientEmail: data.patientEmail || null,
        appointmentId: data.appointmentId || null,
        token: generateToken(),
        expiresAt,
      },
    });
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/review/${request.token}`;
    return NextResponse.json({ ok: true, token: request.token, url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
