import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateUniqueSlug } from "@/lib/slug";
import { saveUpload } from "@/lib/storage";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const rut = formData.get("rut") as string;
    const licenseNumber = formData.get("licenseNumber") as string;
    const specialty = formData.get("specialty") as string;
    
    // Clinic Info
    const clinicName = formData.get("clinicName") as string;
    const address = formData.get("address") as string;
    const commune = formData.get("commune") as string;
    const region = formData.get("region") as string;
    
    // Plan
    const plan = (formData.get("plan") as string) || "trial";

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, contraseña y nombre son requeridos" }, { status: 400 });
    }

    const existing = await prisma.dentist.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const slug = await generateUniqueSlug(fullName);
    const planEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 dias trial

    // Create Dentist within a transaction to ensure all or nothing
    const result = await prisma.$transaction(async (tx) => {
      const dentist = await tx.dentist.create({
        data: {
          email,
          passwordHash,
          fullName,
          phone,
          specialty,
          rut,
          licenseNumber,
          slug,
          plan,
          planEndsAt,
          emailVerified: false,
          verificationStatus: "pending",
          onboardingStep: 5, // Completado
          onboardingCompleted: true,
        },
      });

      // Create primary location
      if (clinicName || address) {
        await tx.clinicLocation.create({
          data: {
            dentistId: dentist.id,
            name: clinicName || "Consultorio Principal",
            address,
            commune,
            region,
            isActive: true,
          },
        });
      }

      // Handle files
      const licenseFile = formData.get("licenseFile");
      const degreeFile = formData.get("degreeFile");
      const idFile = formData.get("idFile");

      const filesToSave = [
        { file: licenseFile, type: "license" },
        { file: degreeFile, type: "degree" },
        { file: idFile, type: "id_card" },
      ];

      for (const item of filesToSave) {
        if (item.file instanceof File) {
          const saved = await saveUpload({ id: dentist.id, file: item.file, category: "verification" });
          await tx.verificationDocument.create({
            data: {
              dentistId: dentist.id,
              type: item.type,
              url: saved.url,
              status: "pending",
            },
          });
        }
      }

      return dentist;
    });

    const token = jwt.sign(
      { id: result.id, dentistId: result.id, email: result.email, role: "DENTIST", fullName: result.fullName },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({ ok: true, dentistId: result.id });
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    
    return res;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 });
  }
}
