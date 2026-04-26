import { redirect } from "next/navigation";
import { getClinicFromAuth } from "@/lib/auth";
import { ClinicSidebar } from "@/components/clinic-sidebar";

export default async function ClinicLayout({ children }: { children: React.ReactNode }) {
  const clinic = await getClinicFromAuth().catch(() => null);
  if (!clinic) redirect("/login-clinica");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <ClinicSidebar 
        clinicName={clinic.name} 
        clinicRole={clinic.role} 
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
