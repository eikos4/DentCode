import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { ClinicNav } from "@/components/clinic-nav";

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-sm">{clinic.name}</h2>
          <p className="text-xs text-gray-500">{clinic.role === "CLINIC_ADMIN" ? "Administrador" : "Staff"}</p>
        </div>
        <nav className="flex-1 p-3">
          <ClinicNav role={clinic.role as "CLINIC_ADMIN" | "CLINIC_STAFF"} />
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
