import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const { email, password } = schema.parse(await req.json());

    const user = await prisma.user.findUnique({
      where: { email },
      include: { clinic: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    if (!["CLINIC_ADMIN", "CLINIC_STAFF"].includes(user.role)) {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, clinicId: user.clinicId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true, role: user.role, clinicId: user.clinicId });
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
