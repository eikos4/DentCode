"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays, Users, LayoutDashboard, MessageCircle, Settings,
  LogOut, User, Menu, X, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/reviews", label: "Reseñas", icon: Star },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

interface SidebarAuthProps {
  dentistName: string;
  dentistEmail: string;
  verificationStatus: string;
  plan: string;
}

export function SidebarAuth(props: SidebarAuthProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* ===== MOBILE TOPBAR ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 h-14 bg-white border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-blue-600 grid place-items-center text-white font-bold text-sm">D</div>
          <span className="font-semibold text-sm">Dentcode</span>
        </Link>
        <button
          onClick={() => setOpen(true)}
          className="p-2 -mr-2 rounded-md hover:bg-slate-100 transition"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ===== MOBILE OVERLAY ===== */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== SIDEBAR (drawer on mobile, fixed on desktop) ===== */}
      <aside
        className={cn(
          "bg-white border-r border-slate-200 flex flex-col",
          // Mobile: drawer
          "fixed inset-y-0 left-0 z-50 w-72 transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static
          "md:static md:translate-x-0 md:w-60 md:z-auto",
        )}
      >
        {/* Header */}
        <div className="p-4 md:p-5 flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center text-white font-bold">D</div>
            <span className="font-semibold">Dentcode</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-slate-100"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition",
                  active
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-muted",
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer user card */}
        <UserCard {...props} />
      </aside>
    </>
  );
}

function UserCard({ dentistName, dentistEmail, verificationStatus, plan }: SidebarAuthProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="p-4 border-t border-slate-200">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 grid place-items-center flex-shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">{dentistName}</p>
            <p className="text-xs text-slate-500 truncate">{dentistEmail}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 text-xs">
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            verificationStatus === "verified" && "bg-green-100 text-green-700",
            verificationStatus === "pending" && "bg-amber-100 text-amber-700",
            verificationStatus !== "verified" && verificationStatus !== "pending" && "bg-red-100 text-red-700",
          )}>
            {verificationStatus === "verified" ? "Verificado" :
             verificationStatus === "pending" ? "Pendiente" : "Rechazado"}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            {plan === "trial" ? "Prueba" : plan === "dentist" ? "Dentista" : "Clínica"}
          </span>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md transition"
      >
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      <div className="mt-3 text-xs text-muted-foreground">
        es-CL · CLP
      </div>
    </div>
  );
}
