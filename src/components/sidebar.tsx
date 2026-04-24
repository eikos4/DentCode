"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, LayoutDashboard, MessageCircle, Settings } from "lucide-react";
import { cn } from "../lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/mensajes", label: "Mensajes", icon: MessageCircle },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-60 border-r bg-white hidden md:flex flex-col">
      <div className="p-5 flex items-center gap-2 border-b">
        <div className="w-8 h-8 rounded-lg bg-primary grid place-items-center text-white font-bold">D</div>
        <span className="font-semibold">Dentcode</span>
      </div>
      <nav className="p-3 space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm",
                active ? "bg-primary/10 text-primary font-medium" : "text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto p-4 text-xs text-muted-foreground border-t">
        Demo · es-CL · CLP
      </div>
    </aside>
  );
}
