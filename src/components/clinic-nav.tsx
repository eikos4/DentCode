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
    <div className="flex items-center gap-6">
      <nav className="hidden md:flex items-center gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                item.current
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="flex items-center gap-2">
        {role === "CLINIC_ADMIN" && (
          <Link
            href="/clinic/dentistas/invite"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invitar
          </Link>
        )}
        
        <Link
          href="/login"
          className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Salir
        </Link>
      </div>
    </div>
  );
}
