import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

export interface AuthUser {
  id: string;
  email: string;
  role: "SUPER_ADMIN" | "CLINIC_ADMIN" | "CLINIC_STAFF" | "DENTIST" | "PATIENT";
  dentistId?: string;
  clinicId?: string;
  fullName?: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  try {
    const token = cookies().get("auth-token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) {
    throw new Error("No autenticado");
  }
  return user;
}

export async function requireRole(role: string | string[]) {
  const user = await requireAuth();
  const allowedRoles = Array.isArray(role) ? role : [role];

  // Fallback: si no hay role pero hay dentistId, asumir DENTIST (para compatibilidad con tokens antiguos)
  const effectiveRole = user.role || (user.dentistId ? "DENTIST" : undefined);

  if (!effectiveRole || !allowedRoles.includes(effectiveRole)) {
    throw new Error(`Acceso denegado. Se requiere rol: ${allowedRoles.join(" o ")}`);
  }

  return { ...user, role: effectiveRole };
}

export async function getDentistFromAuth() {
  const user = await requireRole(["DENTIST", "CLINIC_ADMIN", "CLINIC_STAFF"]);
  
  if (user.role === "DENTIST") {
    const dentist = await prisma.dentist.findUnique({
      where: { id: user.dentistId! },
      select: {
        id: true,
        email: true,
        fullName: true,
        verificationStatus: true,
        plan: true,
        onboardingCompleted: true,
        clinicId: true,
      },
    });

    if (!dentist) {
      throw new Error("Dentista no encontrado");
    }

    return { ...dentist, role: user.role };
  }
  
  // Para roles de clínica, obtener información de la clínica
  if (user.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: user.clinicId },
      include: {
        dentists: {
          where: { isActive: true },
          select: {
            id: true,
            fullName: true,
            email: true,
            specialty: true,
          },
          orderBy: { fullName: "asc" },
        },
      },
    });

    if (!clinic) {
      throw new Error("Clínica no encontrada");
    }

    return { ...clinic, role: user.role };
  }
  
  throw new Error("Configuración de usuario inválida");
}

export async function getClinicFromAuth() {
  const user = await requireRole(["CLINIC_ADMIN", "CLINIC_STAFF"]);
  
  if (!user.clinicId) {
    throw new Error("Usuario no asociado a clínica");
  }
  
  const clinic = await prisma.clinic.findUnique({
    where: { id: user.clinicId },
    include: {
      dentists: {
        where: { isActive: true },
        include: {
          _count: {
            select: {
              patients: true,
              appointments: {
                where: {
                  startAt: { gte: new Date() },
                },
              },
            },
          },
        },
        orderBy: { fullName: "asc" },
      },
      _count: {
        select: {
          dentists: true,
          patients: true,
          appointments: {
            where: {
              startAt: { gte: new Date() },
            },
          },
        },
      },
    },
  });

  if (!clinic) {
    throw new Error("Clínica no encontrada");
  }

  return { ...clinic, role: user.role };
}
