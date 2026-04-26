import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { ClinicNav } from "@/components/clinic-nav";
import { Building2 } from "lucide-react";

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50">
        {/* Clinic Branding */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm truncate leading-tight">
                {clinic.name}
              </h2>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Panel Administrativo
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ClinicNav role={clinic.role as "CLINIC_ADMIN" | "CLINIC_STAFF"} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Usuario</p>
            <p className="text-xs font-semibold text-slate-700 truncate">{clinic.role === "CLINIC_ADMIN" ? "Admin Master" : "Staff Clínico"}</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
