/**
 * Script de inicialización para Sprint 1.
 * - Genera `slug` para dentistas sin slug.
 * - Crea horario semanal por defecto (L-V 9-18) si no existe.
 * - Crea servicios básicos si no existe ninguno.
 * - Marca isPublished=true para el dentista demo.
 *
 * Uso:  npx tsx scripts/setup-public-profiles.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/slug";

const prisma = new PrismaClient();

async function ensureUniqueSlug(base: string, excludeId: string): Promise<string> {
  let slug = base || "dentista";
  let n = 1;
  while (true) {
    const existing = await prisma.dentist.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
    if (n > 50) return `${base}-${Date.now()}`;
  }
}

async function main() {
  const dentists = await prisma.dentist.findMany();
  console.log(`Procesando ${dentists.length} dentistas...`);

  for (const d of dentists) {
    // 1. Slug
    if (!d.slug) {
      const base = slugify(d.fullName);
      const unique = await ensureUniqueSlug(base, d.id);
      await prisma.dentist.update({ where: { id: d.id }, data: { slug: unique, isPublished: true } });
      console.log(`  ✓ ${d.fullName} → /dentista/${unique}`);
    }

    // 2. Horario semanal por defecto (L-V)
    const hasSchedule = await prisma.weeklySchedule.count({ where: { dentistId: d.id } });
    if (hasSchedule === 0) {
      for (let day = 1; day <= 5; day++) {
        await prisma.weeklySchedule.create({
          data: {
            dentistId: d.id,
            dayOfWeek: day,
            openTime: "09:00",
            closeTime: "18:00",
            slotMinutes: 30,
            enabled: true,
          },
        });
      }
      console.log(`  ✓ Horario L-V 9-18 creado`);
    }

    // 3. Servicios básicos
    const hasServices = await prisma.serviceOffering.count({ where: { dentistId: d.id } });
    if (hasServices === 0) {
      await prisma.serviceOffering.createMany({
        data: [
          { dentistId: d.id, name: "Consulta general", description: "Revisión y diagnóstico inicial", durationMin: 30, priceCLP: 25000, order: 1 },
          { dentistId: d.id, name: "Limpieza dental", description: "Profilaxis y destartraje", durationMin: 45, priceCLP: 35000, order: 2 },
          { dentistId: d.id, name: "Urgencia dental", description: "Atención por dolor o emergencia", durationMin: 30, priceCLP: 40000, order: 3 },
        ],
      });
      console.log(`  ✓ 3 servicios base creados`);
    }

    // 4. Publicar y crear PublicProfile mínimo
    if (!d.isPublished) {
      await prisma.dentist.update({ where: { id: d.id }, data: { isPublished: true } });
    }

    const hasProfile = await prisma.publicProfile.findUnique({ where: { dentistId: d.id } });
    if (!hasProfile) {
      await prisma.publicProfile.create({
        data: {
          dentistId: d.id,
          bioPublic: d.bio || `Profesional odontológico con dedicación y experiencia.`,
          languages: JSON.stringify(["Español"]),
          paymentMethods: JSON.stringify(["Efectivo", "Débito", "Crédito", "Transferencia"]),
          acceptsInsurance: true,
        },
      });
    }
  }

  console.log("\n✅ Listo. Sprint 1 activado.");
  console.log("Visita /buscar para ver los perfiles públicos.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
