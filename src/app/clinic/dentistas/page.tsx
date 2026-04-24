import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { DentistCard } from "../../../components/dentist-card";

export default async function ClinicDentistasPage() {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  const dentists = await prisma.dentist.findMany({
    where: { clinicId: clinic.id },
    include: { _count: { select: { patients: true, appointments: true } } },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dentistas</h1>
          <p className="text-gray-500 text-sm">{dentists.length} dentistas en la clinica</p>
        </div>
        {clinic.role === "CLINIC_ADMIN" && (
          <Link href="/clinic/dentistas/invite" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <UserPlus className="w-4 h-4" /> Invitar dentista
          </Link>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {dentists.map((d) => (
          <DentistCard key={d.id} dentist={d as any} />
        ))}
      </div>
    </div>
  );
}
