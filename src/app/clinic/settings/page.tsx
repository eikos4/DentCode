import { redirect } from "next/navigation";
import { getClinicFromAuth } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { ClinicSettingsForm } from "../../../components/clinic-settings-form";

export default async function ClinicSettingsPage() {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  const data = await prisma.clinic.findUnique({
    where: { id: clinic.id },
    include: { locations: { where: { isActive: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>
        <p className="text-gray-500 text-sm">Datos de la clinica y configuracion general</p>
      </div>
      <ClinicSettingsForm clinic={data as any} />
    </div>
  );
}
