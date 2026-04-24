import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, UserPlus } from "lucide-react";

export default async function ClinicPacientesPage({ searchParams }: { searchParams: { q?: string } }) {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");
  const q = searchParams.q || "";
  const patients = await prisma.patient.findMany({
    where: {
      clinicId: clinic.id,
      ...(q ? { OR: [{ fullName: { contains: q, mode: "insensitive" } }, { rut: { contains: q } }] } : {}),
    },
    include: { dentist: { select: { fullName: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm">{patients.length} pacientes registrados</p>
        </div>
        <Link href="/clinic/pacientes/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
          <UserPlus className="w-4 h-4" /> Nuevo paciente
        </Link>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {patients.length === 0 ? (
          <div className="text-center py-12 text-gray-400"><Users className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Sin pacientes</p></div>
        ) : patients.map((p) => (
          <Link key={p.id} href={`/clinic/pacientes/${p.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50">
            <div>
              <p className="font-medium text-sm text-gray-900">{p.fullName}</p>
              <p className="text-xs text-gray-500">{p.rut || "Sin RUT"} · {p.dentist.fullName}</p>
            </div>
            <p className="text-xs text-gray-400">{p.phone || "—"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
