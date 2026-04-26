"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  FileText,
  TrendingUp,
  LogOut,
  Building,
  UserPlus,
  FlaskConical,
} from "lucide-react";

interface ClinicNavProps {
  role: "CLINIC_ADMIN" | "CLINIC_STAFF";
}

export function ClinicNav({ role }: ClinicNavProps) {
  const pathname = usePathname();
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/clinic",
      icon: LayoutDashboard,
      current: pathname === "/clinic",
    },
    {
      name: "Dentistas",
      href: "/clinic/dentistas",
      icon: Users,
      current: pathname.startsWith("/clinic/dentistas"),
    },
    {
      name: "Agenda",
      href: "/clinic/schedule",
      icon: Calendar,
      current: pathname.startsWith("/clinic/schedule"),
    },
    {
      name: "Pacientes",
      href: "/clinic/pacientes",
      icon: Building,
      current: pathname.startsWith("/clinic/pacientes"),
    },
    {
      name: "Radiografías Lab",
      href: "/clinic/lab-uploads",
      icon: FlaskConical,
      current: pathname.startsWith("/clinic/lab-uploads"),
    },
    {
      name: "Reportes",
      href: "/clinic/reports",
      icon: TrendingUp,
      current: pathname.startsWith("/clinic/reports"),
      adminOnly: true,
    },
    {
      name: "Configuración",
      href: "/clinic/settings",
      icon: Settings,
      current: pathname.startsWith("/clinic/settings"),
      adminOnly: true,
    },
  ].filter(item => !item.adminOnly || role === "CLINIC_ADMIN");

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                item.current
                  ? "bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-colors ${item.current ? "text-blue-600" : "text-slate-400"}`} />
              {item.name}
            </Link>
          );
        })}
      </div>
      
      <div className="pt-4 border-t border-slate-100 space-y-1">
        {role === "CLINIC_ADMIN" && (
          <Link
            href="/clinic/dentistas/invite"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            <UserPlus className="w-4.5 h-4.5" />
            Invitar Dentista
          </Link>
        )}
        
        <Link
          href="/login"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4.5 h-4.5" />
          Cerrar Sesión
        </Link>
      </div>
    </div>
  );
}
