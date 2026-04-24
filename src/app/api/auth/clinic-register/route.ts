import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

const schema = z.object({
  name: z.string().min(2),
  rut: z.string().min(8),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());

    const existing = await prisma.clinic.findUnique({ where: { rut: body.rut } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una clinica con ese RUT" }, { status: 409 });
    }

    const adminHash = await bcrypt.hash(body.adminPassword, 12);
    const planEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias trial

    const clinic = await prisma.clinic.create({
      data: {
        name: body.name,
        rut: body.rut,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        plan: "trial",
        planEndsAt,
        isActive: true,
      },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: body.adminEmail,
        passwordHash: adminHash,
        role: "CLINIC_ADMIN",
        clinicId: clinic.id,
        isActive: true,
      },
    });

    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: "CLINIC_ADMIN", clinicId: clinic.id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true, clinicId: clinic.id });
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
