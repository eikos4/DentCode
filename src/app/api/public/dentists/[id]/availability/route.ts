import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, parse, addMinutes, format, isAfter, isBefore } from "date-fns";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date"); // YYYY-MM-DD

    if (!dateStr) {
      return NextResponse.json({ error: "Fecha es requerida" }, { status: 400 });
    }

    const targetDate = new Date(dateStr + "T12:00:00"); 
    const dayOfWeek = targetDate.getDay();

    const schedule = await prisma.weeklySchedule.findFirst({
      where: {
        dentistId: params.id,
        dayOfWeek: dayOfWeek,
        enabled: true
      }
    });

    if (!schedule) {
      return NextResponse.json({ slots: [], message: "No atiende este día" });
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        dentistId: params.id,
        startAt: {
          gte: startOfDay(targetDate),
          lte: endOfDay(targetDate)
        },
        status: { not: "CANCELLED" }
      }
    });

    const slots = [];
    let currentTime = parse(schedule.openTime, "HH:mm", targetDate);
    const endTime = parse(schedule.closeTime, "HH:mm", targetDate);

    while (isBefore(currentTime, endTime)) {
      const slotEnd = addMinutes(currentTime, schedule.slotMinutes);
      
      const isOccupied = existingAppointments.some(apt => {
        const aptStart = new Date(apt.startAt);
        return currentTime.getTime() === aptStart.getTime();
      });

      const now = new Date();
      const isPast = isBefore(currentTime, now);

      if (!isOccupied && !isPast) {
        slots.push({
          time: format(currentTime, "HH:mm"),
          fullDate: currentTime.toISOString()
        });
      }

      currentTime = slotEnd;
    }

    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
