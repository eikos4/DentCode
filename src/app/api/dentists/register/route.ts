import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUniqueSlug } from "@/lib/slug";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  rut: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const existing = await prisma.dentist.findUnique({ where: { email: body.email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const slug = await generateUniqueSlug(body.fullName);
    const planEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias trial

    const dentist = await prisma.dentist.create({
      data: {
        email: body.email,
        passwordHash,
        fullName: body.fullName,
        phone: body.phone,
        specialty: body.specialty,
        rut: body.rut,
        slug,
        plan: "trial",
        planEndsAt,
        emailVerified: false,
        verificationStatus: "pending",
        onboardingStep: 0,
        onboardingCompleted: false,
      },
    });

    const token = jwt.sign(
      { id: dentist.id, dentistId: dentist.id, email: dentist.email, role: "DENTIST", fullName: dentist.fullName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true, dentistId: dentist.id });
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
