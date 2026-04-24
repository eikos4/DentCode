/** Plantillas de WhatsApp para envío a pacientes. */

export type TemplateContext = {
  dentistName: string;
  clinicName?: string;
};

export type PatientCtx = {
  fullName: string;
  firstName: string;
  nextAppointmentAt?: Date | null;
  lastVisitAt?: Date | null;
};

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long" }).format(d);
}
function fmtTime(d: Date) {
  return new Intl.DateTimeFormat("es-CL", { hour: "2-digit", minute: "2-digit" }).format(d);
}

export type TemplateId = "reminder" | "recall" | "birthday" | "post_visit" | "promo" | "welcome" | "custom";

export type Template = {
  id: TemplateId;
  label: string;
  description: string;
  icon: string; // emoji
  build: (p: PatientCtx, ctx: TemplateContext, extra?: { customMessage?: string }) => string;
  requiresUpcomingAppt?: boolean;
};

export const TEMPLATES: Template[] = [
  {
    id: "reminder",
    label: "Recordatorio de cita",
    description: "Confirma asistencia con botón SI/NO",
    icon: "⏰",
    requiresUpcomingAppt: true,
    build: (p, ctx) => {
      const when = p.nextAppointmentAt
        ? `el *${fmtDate(p.nextAppointmentAt)}* a las *${fmtTime(p.nextAppointmentAt)}*`
        : "en la fecha agendada";
      return (
        `Hola ${p.firstName} 👋\n\n` +
        `Te recordamos que tienes hora con *${ctx.dentistName}* ${when}.\n\n` +
        `Responde:\n• *SI* para confirmar\n• *NO* para reprogramar\n\n` +
        `— ${ctx.clinicName ?? "DentCode"}`
      );
    },
  },
  {
    id: "recall",
    label: "Control / limpieza semestral",
    description: "Invita a agendar control periódico",
    icon: "🦷",
    build: (p, ctx) => {
      const since = p.lastVisitAt
        ? `Ya pasaron *${Math.floor((Date.now() - p.lastVisitAt.getTime()) / (30 * 24 * 3600 * 1000))} meses* desde tu última visita`
        : "Es momento de agendar tu control dental";
      return (
        `Hola ${p.firstName} 👋\n\n` +
        `${since}. Te sugerimos agendar tu control con *${ctx.dentistName}* para mantener tu salud bucal al día.\n\n` +
        `¿Te coordinamos una hora esta semana? Solo responde este mensaje.\n\n` +
        `— ${ctx.clinicName ?? "DentCode"}`
      );
    },
  },
  {
    id: "birthday",
    label: "Felicitación de cumpleaños",
    description: "Saludo personalizado + sonrisa",
    icon: "🎂",
    build: (p, ctx) =>
      `¡Feliz cumpleaños ${p.firstName}! 🎂🎉\n\n` +
      `Gracias por confiar en *${ctx.dentistName}*. Te deseamos un gran año lleno de sonrisas.\n\n` +
      `Como regalo, este mes tienes *20% de descuento* en tu próxima limpieza. 🦷✨\n\n` +
      `— ${ctx.clinicName ?? "DentCode"}`,
  },
  {
    id: "post_visit",
    label: "Encuesta post-consulta (NPS)",
    description: "Pregunta de satisfacción 0–10",
    icon: "⭐",
    build: (p, ctx) =>
      `Hola ${p.firstName} 👋\n\n` +
      `Esperamos que hayas tenido una buena experiencia con *${ctx.dentistName}*.\n\n` +
      `Del 0 al 10, ¿qué tan probable es que nos recomiendes a un amigo o familiar?\n\n` +
      `Tu respuesta nos ayuda muchísimo. ¡Gracias!`,
  },
  {
    id: "promo",
    label: "Promoción / oferta",
    description: "Mensaje comercial al paciente",
    icon: "🎁",
    build: (p, ctx) =>
      `Hola ${p.firstName} 👋\n\n` +
      `Este mes en *${ctx.clinicName ?? ctx.dentistName}* tenemos promociones especiales:\n\n` +
      `• 20% off en limpieza dental\n` +
      `• Evaluación de ortodoncia sin costo\n` +
      `• Plan de blanqueamiento con 3 cuotas\n\n` +
      `Responde este WhatsApp para agendar tu hora. 🦷✨`,
  },
  {
    id: "welcome",
    label: "Bienvenida nuevo paciente",
    description: "Para pacientes recién registrados",
    icon: "👋",
    build: (p, ctx) =>
      `¡Hola ${p.firstName}! Bienvenido/a a *${ctx.clinicName ?? ctx.dentistName}* 👋\n\n` +
      `Gracias por elegirnos. Por este medio te enviaremos tus confirmaciones, recordatorios y documentos.\n\n` +
      `Si tienes cualquier duda, responde este mismo WhatsApp. ¡Nos vemos pronto! 🦷`,
  },
  {
    id: "custom",
    label: "Mensaje personalizado",
    description: "Escribe tu propio mensaje",
    icon: "✍️",
    build: (p, _ctx, extra) =>
      (extra?.customMessage ?? "").replace(/\{nombre\}/g, p.firstName).replace(/\{apellido\}/g, p.fullName.split(" ")[1] ?? ""),
  },
];

export function getTemplate(id: TemplateId) {
  return TEMPLATES.find(t => t.id === id) ?? TEMPLATES[0];
}
