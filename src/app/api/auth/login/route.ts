import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const dentist = await prisma.dentist.findUnique({ where: { email } });
    if (!dentist || !dentist.passwordHash) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, dentist.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    await prisma.dentist.update({ where: { id: dentist.id }, data: { lastLoginAt: new Date() } });

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
