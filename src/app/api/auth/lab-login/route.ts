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

    const lab = await prisma.laboratory.findUnique({ where: { email } });
    if (!lab || !lab.passwordHash) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    if (!lab.isActive) {
      return NextResponse.json({ error: "Laboratorio inactivo" }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, lab.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Credenciales invalidas" }, { status: 401 });
    }

    const token = jwt.sign(
      { labId: lab.id, labName: lab.name, role: "LABORATORY" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true, labId: lab.id });
    res.cookies.set("lab_token", token, {
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
