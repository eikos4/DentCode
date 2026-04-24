import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "../../../../lib/prisma";

const schema = z.object({
  dentistSlug: z.string(),
  date: z.string().optional(),
  duration: z.number().int().min(15).max(180).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dentistSlug = searchParams.get("slug");
    const date = searchParams.get("date");
    if (!dentistSlug || !date) {
      return NextResponse.json({ error: "Se requiere slug y date" }, { status: 400 });
    }
    const dentist = await prisma.dentist.findUnique({
      where: { slug: dentistSlug },
      include: { weeklySchedule: true },
    });
    if (!dentist || !dentist.isPublished) {
      return NextResponse.json({ error: "Dentista no encontrado" }, { status: 404 });
    }
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    const schedule = dentist.weeklySchedule.find((s) => s.dayOfWeek === dayOfWeek && s.enabled);
    if (!schedule) return NextResponse.json({ slots: [] });

    const startHour = parseInt(schedule.openTime.split(":")[0]);
    const startMin = parseInt(schedule.openTime.split(":")[1]);
    const endHour = parseInt(schedule.closeTime.split(":")[0]);
    const endMin = parseInt(schedule.closeTime.split(":")[1]);
    const slotMin = schedule.slotMinutes || 30;

    const slots: string[] = [];
    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;
    while (current + slotMin <= end) {
      const h = Math.floor(current / 60).toString().padStart(2, "0");
      const m = (current % 60).toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
      current += slotMin;
    }

    const dateStart = new Date(targetDate); dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(targetDate); dateEnd.setHours(23, 59, 59, 999);
    const existing = await prisma.appointment.findMany({
      where: { dentistId: dentist.id, startAt: { gte: dateStart, lte: dateEnd } },
      select: { startAt: true },
    });
    const busy = existing.map((a) => {
      const h = a.startAt.getHours().toString().padStart(2, "0");
      const m = a.startAt.getMinutes().toString().padStart(2, "0");
      return `${h}:${m}`;
    });

    return NextResponse.json({ slots: slots.filter((s) => !busy.includes(s)) });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
