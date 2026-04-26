import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

/** Helpers de fecha */
const now = new Date();
function at(dayOffset: number, hour: number, minute = 0): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function yearsAgo(y: number, m = 0, d = 1): Date {
  return new Date(now.getFullYear() - y, m, d);
}
function thisYear(month: number, day: number): Date {
  return new Date(now.getFullYear(), month, day, 10, 0, 0);
}

async function main() {
  // ===== Admin Super Usuario =====
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@dentcode.cl" },
    update: {},
    create: {
      email: "admin@dentcode.cl",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Usuario admin creado: admin@dentcode.cl / admin123");

  // ===== Dentista demo =====
  const passwordHash = await bcrypt.hash("demo123", 12);
  const dentist = await prisma.dentist.upsert({
    where: { email: "demo@dentcode.cl" },
    update: { passwordHash },
    create: {
      email: "demo@dentcode.cl",
      passwordHash,
      fullName: "Dra. Camila Rojas",
      rut: "12.345.678-9",
      licenseNumber: "SIS-98765",
      phone: "+56912345678",
      specialty: "Odontología general y estética",
      bio: "Dentista freelance en Providencia y Ñuñoa. 10 años de experiencia.",
      emailVerified: true,
      verificationStatus: "verified",
      plan: "dentist",
      onboardingCompleted: true,
    },
  });

  // Limpiar datos demo previos (solo los de este dentista)
  await prisma.messageLog.deleteMany({});
  await prisma.attachment.deleteMany({ where: { patient: { dentistId: dentist.id } } });
  await prisma.recall.deleteMany({ where: { patient: { dentistId: dentist.id } } });
  await prisma.toothRecord.deleteMany({ where: { patient: { dentistId: dentist.id } } });
  await prisma.clinicalNote.deleteMany({ where: { patient: { dentistId: dentist.id } } });
  await prisma.appointment.deleteMany({ where: { dentistId: dentist.id } });
  await prisma.patient.deleteMany({ where: { dentistId: dentist.id } });
  await prisma.clinicLocation.deleteMany({ where: { dentistId: dentist.id } });

  // ===== Sedes =====
  const sede1 = await prisma.clinicLocation.create({
    data: { dentistId: dentist.id, name: "Consulta Providencia", address: "Av. Providencia 1234, Of. 501", city: "Santiago" },
  });
  await prisma.clinicLocation.create({
    data: { dentistId: dentist.id, name: "Consulta Ñuñoa", address: "Irarrázaval 2890, Of. 202", city: "Santiago" },
  });

  // ===== 7 Pacientes con ficha completa =====
  const patients = await Promise.all([
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Juan Pérez Soto",
        rut: "18.765.432-1",
        birthDate: yearsAgo(42, 4, 15),
        gender: "M",
        phone: "+56987654321",
        email: "juan.perez@example.cl",
        address: "Av. Providencia 2020, Depto 801",
        commune: "Providencia",
        city: "Santiago",
        occupation: "Ingeniero civil",
        referredBy: "Instagram",
        emergencyContact: "Carla Pérez · +56 9 8888 7777",
        bloodType: "O+",
        allergies: "Penicilina, látex",
        medicalHistory: "Hipertensión leve controlada. Bruxismo nocturno.",
        medications: "Losartán 50mg",
        notes: "Prefiere horarios de mañana. Usa placa de descarga.",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "María González Ríos",
        rut: "19.222.333-4",
        birthDate: yearsAgo(62, 8, 3),
        gender: "F",
        phone: "+56955667788",
        email: "maria.g@example.cl",
        address: "Los Leones 1540, Casa 3",
        commune: "Providencia",
        city: "Santiago",
        occupation: "Contadora (jubilada)",
        referredBy: "Recomendación Dra. Martínez",
        emergencyContact: "Roberto González (hijo) · +56 9 2233 4455",
        bloodType: "A+",
        allergies: "",
        medicalHistory: "Hipertensión, osteoporosis tratada. Historial de extracciones.",
        medications: "Enalapril 10mg, Calcio+Vit D",
        notes: "Prótesis parcial superior. Controles cada 4 meses.",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Pedro Ramírez López",
        rut: "20.111.222-3",
        birthDate: yearsAgo(29, 1, 20),
        gender: "M",
        phone: "+56944556677",
        email: "pedro.ramirez@example.cl",
        address: "Irarrázaval 3456, Depto 42",
        commune: "Ñuñoa",
        city: "Santiago",
        occupation: "Diseñador UX",
        referredBy: "Google",
        emergencyContact: "Valentina Ramírez · +56 9 1122 3344",
        bloodType: "B+",
        allergies: "",
        medicalHistory: "Sin antecedentes relevantes.",
        medications: "",
        notes: "Paciente nuevo. Muy interesado en blanqueamiento.",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Ana Silva Contreras",
        rut: "21.333.444-5",
        birthDate: yearsAgo(24, 10, 12),
        gender: "F",
        phone: "+56933445566",
        email: "ana.silva@example.cl",
        address: "José Domingo Cañas 1280",
        commune: "Ñuñoa",
        city: "Santiago",
        occupation: "Estudiante universitaria",
        referredBy: "Instagram",
        emergencyContact: "Paola Contreras (madre) · +56 9 7788 9900",
        bloodType: "O-",
        allergies: "Ibuprofeno",
        medicalHistory: "",
        medications: "Anticonceptivo oral",
        notes: "En tratamiento de ortodoncia (brackets superiores e inferiores).",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Roberto Muñoz Díaz",
        rut: "15.888.777-K",
        birthDate: yearsAgo(55, 2, 8),
        gender: "M",
        phone: "+56922334455",
        email: "rmunoz@example.cl",
        address: "Av. Irarrázaval 890",
        commune: "Ñuñoa",
        city: "Santiago",
        occupation: "Abogado",
        referredBy: "Colega",
        emergencyContact: "Patricia Díaz · +56 9 3344 5566",
        bloodType: "AB+",
        allergies: "Sulfas",
        medicalHistory: "Diabetes tipo 2 controlada. Enfermedad periodontal moderada.",
        medications: "Metformina 850mg",
        notes: "Requiere premedicación previa a procedimientos invasivos. Endodoncia reciente pieza 36.",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Carla Vargas Toro",
        rut: "19.555.666-7",
        birthDate: yearsAgo(34, 6, 25),
        gender: "F",
        phone: "+56977889900",
        email: "carla.vargas@example.cl",
        address: "Pedro de Valdivia 1880, Depto 1203",
        commune: "Providencia",
        city: "Santiago",
        occupation: "Arquitecta",
        referredBy: "Recomendación paciente",
        emergencyContact: "Felipe Vargas (esposo) · +56 9 8877 6655",
        bloodType: "A-",
        allergies: "",
        medicalHistory: "Embarazo 24 semanas. Gingivitis gestacional.",
        medications: "Ácido fólico, sulfato ferroso",
        notes: "Solo procedimientos conservadores durante embarazo. Sin radiografías.",
      },
    }),
    prisma.patient.create({
      data: {
        dentistId: dentist.id,
        fullName: "Diego Fuentes Morales",
        rut: "23.777.888-9",
        // Cumpleaños en 6 días (para aparecer en próximos cumpleaños)
        birthDate: (() => {
          const d = new Date(now);
          d.setDate(d.getDate() + 6);
          return new Date(now.getFullYear() - 12, d.getMonth(), d.getDate());
        })(),
        gender: "M",
        phone: "+56966778899",
        email: "fuentes.laura@example.cl",
        address: "Antonio Varas 1250",
        commune: "Providencia",
        city: "Santiago",
        occupation: "Estudiante (7° básico)",
        referredBy: "Pediatra",
        emergencyContact: "Laura Morales (madre) · +56 9 6677 8899",
        bloodType: "O+",
        allergies: "",
        medicalHistory: "Dentición mixta. Buena salud general.",
        medications: "",
        notes: "Paciente pediátrico. Buen manejo conductual. Recambio dentario en curso.",
      },
    }),
  ]);

  const [juan, maria, pedro, ana, roberto, carla, diego] = patients;

  // ===== Citas: pasadas, hoy, próximas =====
  // Pasado (últimos 6 meses) — para gráfico de ingresos y historial
  const pastAppointments = [
    // Juan
    { p: juan, days: -180, h: 10, dur: 30, t: "Limpieza", price: 35000, st: "COMPLETED" },
    { p: juan, days: -120, h: 11, dur: 45, t: "Obturación pieza 16", price: 55000, st: "COMPLETED" },
    { p: juan, days: -60, h: 9, dur: 30, t: "Control", price: 20000, st: "COMPLETED" },
    { p: juan, days: -14, h: 15, dur: 30, t: "Limpieza", price: 35000, st: "COMPLETED" },
    // María
    { p: maria, days: -150, h: 11, dur: 30, t: "Control prótesis", price: 25000, st: "COMPLETED" },
    { p: maria, days: -100, h: 12, dur: 60, t: "Ajuste prótesis", price: 45000, st: "COMPLETED" },
    { p: maria, days: -50, h: 10, dur: 30, t: "Limpieza", price: 35000, st: "COMPLETED" },
    { p: maria, days: -8, h: 16, dur: 30, t: "Control", price: 20000, st: "COMPLETED" },
    // Pedro
    { p: pedro, days: -40, h: 17, dur: 45, t: "Consulta inicial", price: 30000, st: "COMPLETED" },
    { p: pedro, days: -10, h: 16, dur: 30, t: "Limpieza", price: 35000, st: "COMPLETED" },
    // Ana
    { p: ana, days: -90, h: 18, dur: 30, t: "Control ortodoncia", price: 25000, st: "COMPLETED" },
    { p: ana, days: -60, h: 18, dur: 30, t: "Control ortodoncia", price: 25000, st: "COMPLETED" },
    { p: ana, days: -30, h: 18, dur: 30, t: "Control ortodoncia", price: 25000, st: "COMPLETED" },
    // Roberto
    { p: roberto, days: -45, h: 9, dur: 90, t: "Endodoncia pieza 36 sesión 1", price: 120000, st: "COMPLETED" },
    { p: roberto, days: -30, h: 9, dur: 90, t: "Endodoncia pieza 36 sesión 2", price: 90000, st: "COMPLETED" },
    { p: roberto, days: -20, h: 10, dur: 45, t: "Corona provisional pieza 36", price: 60000, st: "COMPLETED" },
    // Carla
    { p: carla, days: -70, h: 11, dur: 30, t: "Consulta inicial", price: 30000, st: "COMPLETED" },
    { p: carla, days: -35, h: 11, dur: 30, t: "Limpieza suave (embarazo)", price: 35000, st: "COMPLETED" },
    // Diego
    { p: diego, days: -120, h: 16, dur: 30, t: "Primera visita pediátrica", price: 30000, st: "COMPLETED" },
    { p: diego, days: -60, h: 16, dur: 30, t: "Control y profilaxis", price: 25000, st: "COMPLETED" },

    // Algunos no-show / cancelaciones
    { p: juan, days: -35, h: 10, dur: 30, t: "Control", price: 20000, st: "NO_SHOW" },
    { p: pedro, days: -20, h: 18, dur: 30, t: "Blanqueamiento evaluación", price: 0, st: "CANCELLED" },
  ];

  for (const a of pastAppointments) {
    const start = at(a.days, a.h, 0);
    const end = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: {
        dentistId: dentist.id, patientId: a.p.id, locationId: sede1.id,
        startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st,
      },
    });
  }

  // HOY: 5 citas (pasadas del día, actual y futuras)
  const todayAppts = [
    { p: juan, h: 9, m: 0, dur: 30, t: "Control y limpieza", price: 35000, st: "COMPLETED" },
    { p: maria, h: 10, m: 30, dur: 30, t: "Control trimestral", price: 25000, st: "COMPLETED" },
    // Próxima (en 1-2 horas): pendiente
    { p: ana, h: Math.min(20, Math.max(now.getHours() + 1, 14)), m: 0, dur: 30, t: "Control ortodoncia", price: 25000, st: "CONFIRMED" },
    { p: pedro, h: Math.min(20, Math.max(now.getHours() + 3, 16)), m: 30, dur: 60, t: "Blanqueamiento sesión 1", price: 120000, st: "CONFIRMED" },
    { p: carla, h: Math.min(20, Math.max(now.getHours() + 5, 18)), m: 0, dur: 30, t: "Control embarazo", price: 30000, st: "SCHEDULED" },
  ];
  for (const a of todayAppts) {
    const start = at(0, a.h, a.m);
    const end = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: {
        dentistId: dentist.id, patientId: a.p.id, locationId: sede1.id,
        startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st,
      },
    });
  }

  // Próximos días (mix de estados)
  const upcoming = [
    { p: roberto, days: 1, h: 9, dur: 60, t: "Colocación corona definitiva", price: 180000, st: "CONFIRMED" },
    { p: diego, days: 2, h: 16, dur: 30, t: "Control semestral", price: 25000, st: "CONFIRMED" },
    { p: juan, days: 3, h: 10, dur: 45, t: "Obturación pieza 26", price: 55000, st: "SCHEDULED" },
    { p: ana, days: 5, h: 18, dur: 30, t: "Control ortodoncia", price: 25000, st: "SCHEDULED" },
    { p: maria, days: 7, h: 11, dur: 30, t: "Limpieza", price: 35000, st: "CONFIRMED" },
    { p: pedro, days: 8, h: 17, dur: 60, t: "Blanqueamiento sesión 2", price: 120000, st: "SCHEDULED" },
    { p: carla, days: 12, h: 11, dur: 30, t: "Control embarazo", price: 30000, st: "SCHEDULED" },
    { p: roberto, days: 14, h: 9, dur: 30, t: "Control post-corona", price: 20000, st: "SCHEDULED" },
    { p: juan, days: 18, h: 10, dur: 30, t: "Control", price: 20000, st: "SCHEDULED" },
  ];
  for (const a of upcoming) {
    const start = at(a.days, a.h, 0);
    const end = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: {
        dentistId: dentist.id, patientId: a.p.id, locationId: sede1.id,
        startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st,
      },
    });
  }

  // ===== Notas clínicas SOAP =====
  await prisma.clinicalNote.createMany({
    data: [
      {
        patientId: juan.id, date: at(-120, 11),
        subjective: "Paciente refiere sensibilidad al frío en pieza 16 de hace 2 semanas.",
        objective: "Caries clase I oclusal en pieza 16. Esmalte comprometido sin llegada a dentina profunda. Resto de piezas sin hallazgos.",
        assessment: "Caries pieza 16.",
        plan: "Obturación con composite. Indicaciones de higiene y uso de pasta desensibilizante.",
      },
      {
        patientId: roberto.id, date: at(-45, 9),
        subjective: "Dolor pulsátil espontáneo pieza 36 desde hace 5 días. Intensifica al masticar.",
        objective: "Pieza 36 con caries profunda, percusión positiva, vitalometría negativa. Radiográficamente, ensanchamiento del espacio periodontal apical.",
        assessment: "Periodontitis apical aguda pieza 36.",
        plan: "Endodoncia convencional en 2 sesiones. Receta amoxicilina 500mg cada 8h por 7 días. Ibuprofeno 400mg SOS.",
      },
      {
        patientId: ana.id, date: at(-30, 18),
        subjective: "Sin molestias.",
        objective: "Ortodoncia en buena progresión. Arco de alambre estable. Higiene regular, requiere refuerzo.",
        assessment: "Avance normal.",
        plan: "Ajuste de arco superior. Refuerzo de técnica de cepillado con brackets. Control en 30 días.",
      },
      {
        patientId: carla.id, date: at(-35, 11),
        subjective: "Sangrado gingival al cepillado, aumentó con el embarazo.",
        objective: "Gingivitis generalizada leve a moderada. Sin caries activas. No se realizan radiografías.",
        assessment: "Gingivitis gestacional.",
        plan: "Profilaxis suave con ultrasonido de baja potencia. Instrucciones de higiene. Control en 5-6 semanas.",
      },
      {
        patientId: maria.id, date: at(-100, 12),
        subjective: "Molestia en prótesis superior al masticar.",
        objective: "Prótesis parcial superior con zona de presión en vestibular canino. Mucosa eritematosa localizada.",
        assessment: "Desajuste protésico.",
        plan: "Ajuste de prótesis con fresado selectivo. Control en 2 semanas.",
      },
    ],
  });

  // ===== Odontograma (ToothRecord) =====
  await prisma.toothRecord.createMany({
    data: [
      // Juan: obturaciones
      { patientId: juan.id, toothCode: "16", condition: "filling", note: "Composite oclusal" },
      { patientId: juan.id, toothCode: "26", condition: "caries", note: "Próxima obturación" },
      { patientId: juan.id, toothCode: "36", condition: "filling" },
      { patientId: juan.id, toothCode: "46", condition: "filling" },
      // María: prótesis + extracciones
      { patientId: maria.id, toothCode: "14", condition: "missing" },
      { patientId: maria.id, toothCode: "15", condition: "missing" },
      { patientId: maria.id, toothCode: "24", condition: "missing" },
      { patientId: maria.id, toothCode: "36", condition: "crown" },
      { patientId: maria.id, toothCode: "46", condition: "implant" },
      // Roberto: endodoncia + corona
      { patientId: roberto.id, toothCode: "36", condition: "endo", note: "Endodoncia completada, corona pendiente" },
      { patientId: roberto.id, toothCode: "37", condition: "filling" },
      { patientId: roberto.id, toothCode: "26", condition: "caries" },
      // Ana: sin caries, buena salud
      { patientId: ana.id, toothCode: "18", condition: "missing", note: "Extraída por ortodoncia" },
      { patientId: ana.id, toothCode: "28", condition: "missing", note: "Extraída por ortodoncia" },
      // Diego: caries pediátricas
      { patientId: diego.id, toothCode: "75", condition: "filling" },
      { patientId: diego.id, toothCode: "85", condition: "filling" },
      { patientId: diego.id, toothCode: "26", condition: "caries", note: "Sellante pendiente" },
    ],
  });

  // ===== Recalls =====
  await prisma.recall.createMany({
    data: [
      // Juan: limpieza cada 6 meses (pendiente futuro)
      { patientId: juan.id, type: "limpieza", dueDate: at(60, 10), notes: "Limpieza semestral" },
      // María: control trimestral (vencido)
      { patientId: maria.id, type: "control", dueDate: at(-10, 10), notes: "Control trimestral de prótesis" },
      // Pedro: limpieza (próxima)
      { patientId: pedro.id, type: "limpieza", dueDate: at(180, 10) },
      // Ana: control ortodoncia (vencido)
      { patientId: ana.id, type: "ortodoncia", dueDate: at(-3, 18), notes: "Control mensual de ortodoncia" },
      // Roberto: control post-endodoncia (próximo)
      { patientId: roberto.id, type: "endodoncia", dueDate: at(30, 10), notes: "Control post-endodoncia 6 meses" },
      // Diego: control semestral
      { patientId: diego.id, type: "control", dueDate: at(15, 16) },
      // Carla: control post-parto
      { patientId: carla.id, type: "control", dueDate: at(120, 11), notes: "Control post-parto" },
      // Completado (histórico)
      { patientId: juan.id, type: "limpieza", dueDate: at(-180, 10), doneAt: at(-178, 10), notes: "Completado" },
    ],
  });

  // ===== Attachments (referencias, sin archivos reales) =====
  await prisma.attachment.createMany({
    data: [
      {
        patientId: juan.id, category: "radiograph", subtype: "panoramic",
        url: "/uploads/demo/panoramic-juan.jpg",
        filename: "panoramica-juan-perez.jpg", mime: "image/jpeg", sizeBytes: 245000,
        note: "Panorámica inicial",
        takenAt: at(-180, 10),
      },
      {
        patientId: roberto.id, category: "radiograph", subtype: "periapical",
        url: "/uploads/demo/periapical-36-roberto.jpg",
        filename: "periapical-36-pre-endo.jpg", mime: "image/jpeg", sizeBytes: 180000,
        note: "Pre-endodoncia pieza 36",
        takenAt: at(-45, 9),
      },
      {
        patientId: roberto.id, category: "radiograph", subtype: "periapical",
        url: "/uploads/demo/periapical-36-post-roberto.jpg",
        filename: "periapical-36-post-endo.jpg", mime: "image/jpeg", sizeBytes: 176000,
        note: "Post-endodoncia pieza 36",
        takenAt: at(-20, 10),
      },
      {
        patientId: ana.id, category: "photo", subtype: "intraoral",
        url: "/uploads/demo/intraoral-ana.jpg",
        filename: "intraoral-ana-ortodoncia.jpg", mime: "image/jpeg", sizeBytes: 320000,
        note: "Progreso ortodoncia",
        takenAt: at(-30, 18),
      },
      {
        patientId: maria.id, category: "document",
        url: "/uploads/demo/consentimiento-maria.pdf",
        filename: "consentimiento-protesis-maria.pdf", mime: "application/pdf", sizeBytes: 95000,
        note: "Consentimiento firmado ajuste prótesis",
        takenAt: at(-100, 12),
      },
      {
        patientId: juan.id, category: "prescription",
        url: "/uploads/demo/receta-juan.pdf",
        filename: "receta-placa-descarga.pdf", mime: "application/pdf", sizeBytes: 42000,
        takenAt: at(-60, 9),
      },
    ],
  });

  // ===== MessageLog (historial WhatsApp simulado) =====
  const apptsForMsgs = await prisma.appointment.findMany({
    where: { dentistId: dentist.id },
    orderBy: { startAt: "desc" },
    take: 8,
  });

  await prisma.messageLog.createMany({
    data: apptsForMsgs.flatMap((a) => [
      {
        appointmentId: a.id,
        channel: "whatsapp", direction: "out", to: "+56987654321",
        body: `Hola! Te recordamos tu hora el ${a.startAt.toLocaleDateString("es-CL")}. Responde SI para confirmar.`,
        status: "simulated",
        createdAt: new Date(a.startAt.getTime() - 24 * 3600 * 1000),
      },
      ...(a.status === "CONFIRMED"
        ? [{
            appointmentId: a.id,
            channel: "whatsapp", direction: "in" as const, to: "+56987654321",
            body: "si",
            status: "received",
            createdAt: new Date(a.startAt.getTime() - 23 * 3600 * 1000),
          }]
        : []),
    ]),
  });

  // ============================================================
  // ===== DEMO CLÍNICA =====
  // ============================================================

  // Limpiar datos demo de clínica previos
  const existingClinicDemo = await prisma.clinic.findFirst({ where: { rut: "76.123.456-7" } });
  if (existingClinicDemo) {
    await prisma.appointment.deleteMany({ where: { clinicId: existingClinicDemo.id } });
    await prisma.patient.deleteMany({ where: { clinicId: existingClinicDemo.id } });
    await prisma.dentist.deleteMany({ where: { clinicId: existingClinicDemo.id } });
    await prisma.user.deleteMany({ where: { clinicId: existingClinicDemo.id } });
    await prisma.clinic.delete({ where: { id: existingClinicDemo.id } });
  }

  // Crear clínica demo
  const clinic = await prisma.clinic.create({
    data: {
      name: "Clínica Dental Demo",
      rut: "76.123.456-7",
      phone: "+56 2 2345 6789",
      email: "contacto@clinicademo.cl",
      address: "Av. Providencia 1234, Piso 3",
      city: "Santiago",
      commune: "Providencia",
      region: "Metropolitana",
      plan: "clinic",
      planEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  });

  // Usuarios de la clínica
  const clinicAdminHash = await bcrypt.hash("demo123", 12);
  await prisma.user.create({
    data: {
      email: "admin@clinicademo.cl",
      passwordHash: clinicAdminHash,
      role: "CLINIC_ADMIN",
      clinicId: clinic.id,
      isActive: true,
    },
  });
  await prisma.user.create({
    data: {
      email: "staff@clinicademo.cl",
      passwordHash: clinicAdminHash,
      role: "CLINIC_STAFF",
      clinicId: clinic.id,
      isActive: true,
    },
  });

  // 3 Dentistas de la clínica
  const [dr1, dr2, dr3] = await Promise.all([
    prisma.dentist.create({
      data: {
        email: "rodrigo.fuentes@clinicademo.cl",
        passwordHash: clinicAdminHash,
        fullName: "Dr. Rodrigo Fuentes",
        specialty: "Odontología general",
        phone: "+56911111111",
        rut: "13.111.222-3",
        clinicId: clinic.id,
        isActive: true,
        onboardingCompleted: true,
        verificationStatus: "verified",
        plan: "dentist",
      },
    }),
    prisma.dentist.create({
      data: {
        email: "patricia.lagos@clinicademo.cl",
        passwordHash: clinicAdminHash,
        fullName: "Dra. Patricia Lagos",
        specialty: "Ortodoncia",
        phone: "+56922222222",
        rut: "14.222.333-4",
        clinicId: clinic.id,
        isActive: true,
        onboardingCompleted: true,
        verificationStatus: "verified",
        plan: "dentist",
      },
    }),
    prisma.dentist.create({
      data: {
        email: "andres.molina@clinicademo.cl",
        passwordHash: clinicAdminHash,
        fullName: "Dr. Andrés Molina",
        specialty: "Implantología",
        phone: "+56933333333",
        rut: "15.333.444-5",
        clinicId: clinic.id,
        isActive: true,
        onboardingCompleted: true,
        verificationStatus: "verified",
        plan: "dentist",
      },
    }),
  ]);

  // 8 Pacientes de la clínica
  const [cp1, cp2, cp3, cp4, cp5, cp6, cp7, cp8] = await Promise.all([
    prisma.patient.create({ data: { dentistId: dr1.id, clinicId: clinic.id, fullName: "Sofía Herrera Paz", rut: "20.100.200-1", birthDate: yearsAgo(35, 3, 10), gender: "F", phone: "+56940000001", email: "sofia.herrera@example.cl", commune: "Providencia", city: "Santiago", bloodType: "A+", allergies: "", medicalHistory: "" } }),
    prisma.patient.create({ data: { dentistId: dr1.id, clinicId: clinic.id, fullName: "Lucas Vidal Torres", rut: "21.200.300-2", birthDate: yearsAgo(45, 7, 22), gender: "M", phone: "+56940000002", email: "lucas.vidal@example.cl", commune: "Las Condes", city: "Santiago", bloodType: "O+", allergies: "Penicilina", medicalHistory: "Hipertensión controlada" } }),
    prisma.patient.create({ data: { dentistId: dr2.id, clinicId: clinic.id, fullName: "Valentina Cruz Mora", rut: "22.300.400-3", birthDate: yearsAgo(22, 11, 5), gender: "F", phone: "+56940000003", email: "vale.cruz@example.cl", commune: "Ñuñoa", city: "Santiago", bloodType: "B+", allergies: "", medicalHistory: "" } }),
    prisma.patient.create({ data: { dentistId: dr2.id, clinicId: clinic.id, fullName: "Matías Rojas Neira", rut: "23.400.500-4", birthDate: yearsAgo(17, 2, 14), gender: "M", phone: "+56940000004", email: "matias.rojas@example.cl", commune: "La Florida", city: "Santiago", bloodType: "O-", allergies: "", medicalHistory: "" } }),
    prisma.patient.create({ data: { dentistId: dr3.id, clinicId: clinic.id, fullName: "Isabel Muñoz Araya", rut: "18.500.600-5", birthDate: yearsAgo(58, 6, 28), gender: "F", phone: "+56940000005", email: "isabel.munoz@example.cl", commune: "Vitacura", city: "Santiago", bloodType: "AB+", allergies: "Sulfas", medicalHistory: "Diabetes tipo 2, osteoporosis" } }),
    prisma.patient.create({ data: { dentistId: dr3.id, clinicId: clinic.id, fullName: "Gonzalo Pinto Vera", rut: "19.600.700-6", birthDate: yearsAgo(50, 9, 3), gender: "M", phone: "+56940000006", email: "gonzalo.pinto@example.cl", commune: "Lo Barnechea", city: "Santiago", bloodType: "A-", allergies: "", medicalHistory: "Sin antecedentes relevantes" } }),
    prisma.patient.create({ data: { dentistId: dr1.id, clinicId: clinic.id, fullName: "Camila Estrada Ríos", rut: "24.700.800-7", birthDate: yearsAgo(28, 1, 18), gender: "F", phone: "+56940000007", email: "camila.estrada@example.cl", commune: "Providencia", city: "Santiago", bloodType: "O+", allergies: "", medicalHistory: "" } }),
    prisma.patient.create({ data: { dentistId: dr2.id, clinicId: clinic.id, fullName: "Felipe Soto Gutiérrez", rut: "17.800.900-8", birthDate: yearsAgo(40, 5, 30), gender: "M", phone: "+56940000008", email: "felipe.soto@example.cl", commune: "Macul", city: "Santiago", bloodType: "B-", allergies: "Látex", medicalHistory: "Bruxismo severo" } }),
  ]);

  // Citas pasadas (últimos 6 meses) — para que reportes tenga datos
  const clinicPast = [
    { p: cp1, d: dr1, days: -170, h: 9,  dur: 30, t: "Limpieza dental",            price: 35000,  st: "COMPLETED" },
    { p: cp1, d: dr1, days: -100, h: 10, dur: 45, t: "Obturación pieza 26",        price: 55000,  st: "COMPLETED" },
    { p: cp1, d: dr1, days: -30,  h: 9,  dur: 30, t: "Control semestral",          price: 20000,  st: "COMPLETED" },
    { p: cp2, d: dr1, days: -155, h: 11, dur: 30, t: "Limpieza",                   price: 35000,  st: "COMPLETED" },
    { p: cp2, d: dr1, days: -80,  h: 11, dur: 60, t: "Extracción pieza 18",        price: 65000,  st: "COMPLETED" },
    { p: cp2, d: dr1, days: -25,  h: 11, dur: 30, t: "Control post-extracción",    price: 20000,  st: "COMPLETED" },
    { p: cp3, d: dr2, days: -160, h: 18, dur: 30, t: "Consulta ortodoncia",        price: 40000,  st: "COMPLETED" },
    { p: cp3, d: dr2, days: -130, h: 18, dur: 30, t: "Colocación brackets",        price: 350000, st: "COMPLETED" },
    { p: cp3, d: dr2, days: -100, h: 18, dur: 30, t: "Control ortodoncia",         price: 25000,  st: "COMPLETED" },
    { p: cp3, d: dr2, days: -70,  h: 18, dur: 30, t: "Control ortodoncia",         price: 25000,  st: "COMPLETED" },
    { p: cp3, d: dr2, days: -40,  h: 18, dur: 30, t: "Control ortodoncia",         price: 25000,  st: "COMPLETED" },
    { p: cp4, d: dr2, days: -120, h: 17, dur: 30, t: "Consulta ortodoncia",        price: 40000,  st: "COMPLETED" },
    { p: cp4, d: dr2, days: -90,  h: 17, dur: 60, t: "Colocación alineadores",     price: 280000, st: "COMPLETED" },
    { p: cp4, d: dr2, days: -55,  h: 17, dur: 30, t: "Control alineadores",        price: 25000,  st: "COMPLETED" },
    { p: cp5, d: dr3, days: -140, h: 10, dur: 60, t: "Evaluación implante",        price: 50000,  st: "COMPLETED" },
    { p: cp5, d: dr3, days: -110, h: 9,  dur: 90, t: "Cirugía implante pieza 36",  price: 550000, st: "COMPLETED" },
    { p: cp5, d: dr3, days: -50,  h: 10, dur: 30, t: "Control post-cirugía",       price: 30000,  st: "COMPLETED" },
    { p: cp6, d: dr3, days: -165, h: 11, dur: 60, t: "Evaluación implante",        price: 50000,  st: "COMPLETED" },
    { p: cp6, d: dr3, days: -130, h: 9,  dur: 90, t: "Cirugía implante pieza 46",  price: 550000, st: "COMPLETED" },
    { p: cp6, d: dr3, days: -90,  h: 11, dur: 30, t: "Control 1 mes",              price: 30000,  st: "COMPLETED" },
    { p: cp6, d: dr3, days: -45,  h: 11, dur: 30, t: "Control 3 meses",            price: 30000,  st: "COMPLETED" },
    { p: cp7, d: dr1, days: -50,  h: 14, dur: 30, t: "Limpieza",                   price: 35000,  st: "COMPLETED" },
    { p: cp8, d: dr2, days: -75,  h: 16, dur: 60, t: "Placa de descarga",          price: 80000,  st: "COMPLETED" },
    { p: cp8, d: dr2, days: -20,  h: 16, dur: 30, t: "Control placa",              price: 20000,  st: "COMPLETED" },
    // Algunos cancelados/no-show
    { p: cp2, d: dr1, days: -45,  h: 9,  dur: 30, t: "Limpieza",                   price: 35000,  st: "NO_SHOW"   },
    { p: cp5, d: dr3, days: -15,  h: 10, dur: 30, t: "Control",                    price: 30000,  st: "CANCELLED" },
  ];

  for (const a of clinicPast) {
    const start = at(a.days, a.h, 0);
    const end   = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: { dentistId: a.d.id, patientId: a.p.id, clinicId: clinic.id, startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st },
    });
  }

  // Citas de hoy (clínica)
  const clinicToday = [
    { p: cp1, d: dr1, h: 9,  m: 0,  dur: 30, t: "Limpieza dental",         price: 35000,  st: "COMPLETED" },
    { p: cp7, d: dr1, h: 10, m: 30, dur: 45, t: "Obturación pieza 14",     price: 55000,  st: "COMPLETED" },
    { p: cp3, d: dr2, h: 11, m: 0,  dur: 30, t: "Control ortodoncia",      price: 25000,  st: "CONFIRMED" },
    { p: cp5, d: dr3, h: Math.min(20, Math.max(now.getHours() + 1, 14)), m: 0, dur: 60, t: "Corona sobre implante pieza 36", price: 250000, st: "CONFIRMED" },
    { p: cp2, d: dr1, h: Math.min(20, Math.max(now.getHours() + 2, 15)), m: 0, dur: 30, t: "Control",             price: 20000,  st: "SCHEDULED" },
    { p: cp4, d: dr2, h: Math.min(20, Math.max(now.getHours() + 3, 17)), m: 0, dur: 30, t: "Control alineadores", price: 25000,  st: "SCHEDULED" },
    { p: cp6, d: dr3, h: Math.min(20, Math.max(now.getHours() + 4, 18)), m: 0, dur: 30, t: "Control 6 meses",     price: 30000,  st: "SCHEDULED" },
  ];

  for (const a of clinicToday) {
    const start = at(0, a.h, a.m);
    const end   = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: { dentistId: a.d.id, patientId: a.p.id, clinicId: clinic.id, startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st },
    });
  }

  // Próximas citas (clínica)
  const clinicUpcoming = [
    { p: cp8, d: dr2, days: 1,  h: 16, dur: 45, t: "Ajuste placa de descarga",     price: 25000,  st: "CONFIRMED" },
    { p: cp3, d: dr2, days: 2,  h: 18, dur: 30, t: "Control ortodoncia",           price: 25000,  st: "CONFIRMED" },
    { p: cp6, d: dr3, days: 3,  h: 10, dur: 60, t: "Carga implante pieza 46",      price: 200000, st: "CONFIRMED" },
    { p: cp1, d: dr1, days: 5,  h: 9,  dur: 30, t: "Blanqueamiento sesión 1",      price: 90000,  st: "SCHEDULED" },
    { p: cp4, d: dr2, days: 7,  h: 17, dur: 30, t: "Control alineadores",          price: 25000,  st: "SCHEDULED" },
    { p: cp2, d: dr1, days: 9,  h: 11, dur: 60, t: "Corona cerámica pieza 26",     price: 180000, st: "SCHEDULED" },
    { p: cp5, d: dr3, days: 12, h: 10, dur: 30, t: "Control anual implante",       price: 40000,  st: "SCHEDULED" },
    { p: cp7, d: dr1, days: 14, h: 14, dur: 30, t: "Limpieza semestral",           price: 35000,  st: "SCHEDULED" },
  ];

  for (const a of clinicUpcoming) {
    const start = at(a.days, a.h, 0);
    const end   = new Date(start.getTime() + a.dur * 60000);
    await prisma.appointment.create({
      data: { dentistId: a.d.id, patientId: a.p.id, clinicId: clinic.id, startAt: start, endAt: end, treatment: a.t, priceCLP: a.price, status: a.st },
    });
  }

  // Laboratorio demo asociado a la clínica
  const labPasswordHash = await bcrypt.hash("lab123", 12);
  const labDemo = await prisma.laboratory.upsert({
    where: { email: "lab@radiologicadental.cl" },
    update: {},
    create: {
      name: "Laboratorio Radiográfico Dental Santiago",
      rut: "77.111.222-3",
      email: "lab@radiologicadental.cl",
      passwordHash: labPasswordHash,
      phone: "+56 2 2345 6788",
      address: "Av. Libertador Bernardo O'Higgins 5678",
      city: "Santiago",
      contactName: "Carlos Medina",
      isActive: true,
    },
  });

  console.log("✅ Seed clínica demo completado");
  console.log(`   Laboratorio: ${labDemo.name}`);
  console.log(`   Lab login: ${labDemo.email} / lab123`);
  console.log(`   Clínica: ${clinic.name}`);
  console.log(`   Admin: admin@clinicademo.cl / demo123`);
  console.log(`   Staff: staff@clinicademo.cl / demo123`);
  console.log(`   Dentistas: ${dr1.fullName}, ${dr2.fullName}, ${dr3.fullName}`);
  console.log(`   Pacientes: 8 | Citas: ${clinicPast.length + clinicToday.length + clinicUpcoming.length}`);

  // Estadística
  const stats = await Promise.all([
    prisma.patient.count({ where: { dentistId: dentist.id } }),
    prisma.appointment.count({ where: { dentistId: dentist.id } }),
    prisma.clinicalNote.count({ where: { patient: { dentistId: dentist.id } } }),
    prisma.toothRecord.count({ where: { patient: { dentistId: dentist.id } } }),
    prisma.recall.count({ where: { patient: { dentistId: dentist.id } } }),
    prisma.attachment.count({ where: { patient: { dentistId: dentist.id } } }),
    prisma.messageLog.count(),
  ]);

  console.log("✅ Seed dentista demo completado");
  console.log(`   ${stats[0]} pacientes · ${stats[1]} citas · ${stats[2]} notas SOAP`);
  console.log(`   ${stats[3]} registros odontograma · ${stats[4]} recalls · ${stats[5]} adjuntos · ${stats[6]} mensajes`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
