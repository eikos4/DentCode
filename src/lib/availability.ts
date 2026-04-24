import { prisma } from "./prisma";

export type TimeSlot = {
  start: Date;
  end: Date;
  iso: string; // YYYY-MM-DDTHH:mm
};

function parseHHMM(s: string): { h: number; m: number } {
  const [h, m] = s.split(":").map(Number);
  return { h: h || 0, m: m || 0 };
}

function toIso(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Devuelve slots libres para un dentista en una fecha dada.
 * Considera WeeklySchedule y evita solaparse con Appointment existentes.
 */
export async function getAvailableSlots(params: {
  dentistId: string;
  date: Date; // cualquier hora del día solicitado
  durationMin: number;
}): Promise<TimeSlot[]> {
  const { dentistId, date, durationMin } = params;
  const dayOfWeek = date.getDay();

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayStart.getDate() + 1);

  // 1. Horario del día
  const schedules = await prisma.weeklySchedule.findMany({
    where: { dentistId, dayOfWeek, enabled: true },
    orderBy: { openTime: "asc" },
  });

  if (schedules.length === 0) return [];

  // 2. Citas existentes en ese día
  const appts = await prisma.appointment.findMany({
    where: {
      dentistId,
      startAt: { gte: dayStart, lt: dayEnd },
      status: { notIn: ["CANCELLED", "NO_SHOW"] },
    },
    select: { startAt: true, endAt: true },
  }) as { startAt: Date; endAt: Date }[];

  const slots: TimeSlot[] = [];
  const now = new Date();

  for (const sched of schedules) {
    const open = parseHHMM(sched.openTime);
    const close = parseHHMM(sched.closeTime);
    const step = sched.slotMinutes || 30;

    let cursor = new Date(dayStart);
    cursor.setHours(open.h, open.m, 0, 0);

    const endOfWindow = new Date(dayStart);
    endOfWindow.setHours(close.h, close.m, 0, 0);

    while (cursor.getTime() + durationMin * 60000 <= endOfWindow.getTime()) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMin * 60000);

      // futuro
      if (slotStart > now) {
        // no colisiona con cita existente
        const overlaps = appts.some(
          (a) => slotStart < a.endAt && slotEnd > a.startAt,
        );
        if (!overlaps) {
          slots.push({
            start: slotStart,
            end: slotEnd,
            iso: toIso(slotStart),
          });
        }
      }
      cursor = new Date(cursor.getTime() + step * 60000);
    }
  }

  return slots;
}

/** Próximo slot disponible (para mostrar en /buscar). */
export async function getNextAvailableSlot(
  dentistId: string,
  durationMin = 30,
  daysAhead = 14,
): Promise<Date | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const slots = await getAvailableSlots({ dentistId, date: d, durationMin });
    if (slots.length > 0) return slots[0].start;
  }
  return null;
}
