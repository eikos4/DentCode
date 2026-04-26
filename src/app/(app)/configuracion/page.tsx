import { prisma } from "@/lib/prisma";
import { getDentistFromAuth } from "@/lib/auth";
import { ConfigClient } from "./config-client";

export const dynamic = "force-dynamic";

function safeParse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

export default async function ConfigPage() {
  const dentist = await getDentistFromAuth();
  const full = await prisma.dentist.findUnique({
    where: { id: dentist.id },
    include: {
      publicProfile: true,
      locations: true,
      services: { orderBy: { order: "asc" } },
      weeklySchedule: true,
    },
  });

  if (!full) return null;

  const whatsappConfigured = Boolean(
    process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID,
  );

  return (
    <div className="p-3 md:p-6 max-w-5xl mx-auto">
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-xs md:text-sm text-slate-600 mt-1">
          Gestiona tu perfil público, servicios, horarios y sedes.
        </p>
      </div>

      <ConfigClient
        dentist={{
          id: full.id,
          fullName: full.fullName,
          email: full.email,
          rut: full.rut,
          licenseNumber: full.licenseNumber,
          specialty: full.specialty,
          phone: full.phone,
          bio: full.bio,
          photoUrl: full.photoUrl,
          slug: full.slug,
          isPublished: full.isPublished,
          verificationStatus: full.verificationStatus,
          plan: full.plan,
        }}
        publicProfile={{
          bioPublic: full.publicProfile?.bioPublic || "",
          experience: full.publicProfile?.experience || "",
          languages: safeParse<string[]>(full.publicProfile?.languages, ["Español"]),
          paymentMethods: safeParse<string[]>(full.publicProfile?.paymentMethods, []),
          insuranceProviders: safeParse<string[]>(full.publicProfile?.insuranceProviders, []),
          education: safeParse<string[]>(full.publicProfile?.education, []),
          acceptsInsurance: full.publicProfile?.acceptsInsurance || false,
          emergencyCare: full.publicProfile?.emergencyCare || false,
          facebookUrl: full.publicProfile?.facebookUrl || "",
          instagramUrl: full.publicProfile?.instagramUrl || "",
        }}
        services={full.services.map((s: typeof full.services[number]) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          durationMin: s.durationMin,
          priceCLP: s.priceCLP,
          active: s.active,
          order: s.order,
        }))}
        schedule={full.weeklySchedule.map((w: typeof full.weeklySchedule[number]) => ({
          id: w.id,
          dayOfWeek: w.dayOfWeek,
          openTime: w.openTime,
          closeTime: w.closeTime,
          slotMinutes: w.slotMinutes,
          enabled: w.enabled,
        }))}
        locations={full.locations.map((l: typeof full.locations[number]) => ({
          id: l.id,
          name: l.name,
          address: l.address,
          commune: l.commune,
          city: l.city,
          region: l.region,
          phone: l.phone,
        }))}
        whatsappConfigured={whatsappConfigured}
        verifyToken={process.env.WHATSAPP_VERIFY_TOKEN ?? "dentcode-verify"}
      />
    </div>
  );
}
