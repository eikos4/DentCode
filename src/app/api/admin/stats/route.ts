import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Solo SUPER_ADMIN puede acceder
    await requireRole("SUPER_ADMIN");

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Estadísticas globales
    const [
      totalDentists,
      totalClinics,
      totalPatients,
      totalAppointments,
      monthAppointments,
      pendingVerifications,
      trialEndingSoon,
      monthRevenue,
    ] = await Promise.all([
      prisma.dentist.count(),
      prisma.clinic.count(),
      prisma.patient.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { startAt: { gte: startOfMonth, lte: endOfMonth } },
      }),
      prisma.dentist.count({ where: { verificationStatus: "pending" } }),
      prisma.dentist.count({
        where: {
          plan: "trial",
          createdAt: { lt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.appointment.aggregate({
        where: { startAt: { gte: startOfMonth, lte: endOfMonth }, status: "COMPLETED" },
        _sum: { priceCLP: true },
      }),
    ]);

    // Estadísticas por plan
    const dentistsByPlan = await prisma.dentist.groupBy({
      by: ["plan"],
      _count: { id: true },
    });

    // Dentistas nuevos por mes (últimos 6 meses)
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const newDentistsByMonth = await prisma.dentist.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: { id: true },
    });

    return NextResponse.json({
      overview: {
        totalDentists,
        totalClinics,
        totalPatients,
        totalAppointments,
        monthAppointments,
        pendingVerifications,
        trialEndingSoon,
        monthRevenue: monthRevenue._sum.priceCLP || 0,
      },
      dentistsByPlan: dentistsByPlan.map((p) => ({
        plan: p.plan,
        count: p._count.id,
      })),
      newDentistsByMonth,
    });
  } catch (error: any) {
    if (error.message?.includes("Acceso denegado")) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
