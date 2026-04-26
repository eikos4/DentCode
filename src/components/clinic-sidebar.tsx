"use client";
import { useState, useEffect } from "react";
import { Building2, Menu, X, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { ClinicNav } from "./clinic-nav";
import { useRouter, usePathname } from "next/navigation";

interface ClinicSidebarProps {
  clinicName: string;
  clinicRole: string;
}

export function ClinicSidebar({ clinicName, clinicRole }: ClinicSidebarProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Cerrar el menú cuando cambie la ruta
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Bloquear el scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login-clinica");
    router.refresh();
  };

  return (
    <>
      {/* Botón de Hamburguesa Móvil */}
      <div className="lg:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Abrir menú"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay para móvil */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 w-64 shrink-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Clinic Branding */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm truncate leading-tight">
                {clinicName}
              </h2>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                Panel Administrativo
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ClinicNav role={clinicRole as any} />
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                 <User className="w-3 h-3 text-slate-500" />
               </div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Usuario</p>
            </div>
            <p className="text-xs font-semibold text-slate-700 truncate">
              {clinicRole === "CLINIC_ADMIN" ? "Admin Master" : "Staff Clínico"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
