import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCLP(value?: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", { dateStyle: "medium" }).format(date);
}

export function formatTime(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return new Intl.DateTimeFormat("es-CL", { timeStyle: "short" }).format(date);
}

/** Devuelve el dentista "actual" (MVP: demo). Reemplazar por auth real. */
export async function getCurrentDentistId(): Promise<string> {
  const { prisma } = await import("./prisma");
  const d = await prisma.dentist.findFirst({ where: { email: "demo@dentcode.cl" } });
  if (!d) throw new Error("Dentista demo no encontrado. Ejecuta `npm run db:seed`.");
  return d.id;
}
