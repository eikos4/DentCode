import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Solo SUPER_ADMIN puede acceder
    await requireRole("SUPER_ADMIN");

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan");
    const verificationStatus = searchParams.get("verificationStatus");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const skip = (page - 1) * limit;

    // Construir where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { rut: { contains: search, mode: "insensitive" } },
      ];
    }
    
    if (plan) {
      where.plan = plan;
    }
    
    if (verificationStatus) {
      where.verificationStatus = verificationStatus;
    }

    // Obtener dentistas
    const [dentists, total] = await Promise.all([
      prisma.dentist.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          fullName: true,
          rut: true,
          specialty: true,
          phone: true,
          plan: true,
          verificationStatus: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              patients: true,
              appointments: true,
            },
          },
          verificationDocs: {
            select: {
              id: true,
              type: true,
              url: true,
              status: true,
            }
          }
        },
      }),
      prisma.dentist.count({ where }),
    ]);

    return NextResponse.json({
      dentists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
