import Link from "next/link";
import { User, Mail, Phone, Calendar } from "lucide-react";

interface DentistCardProps {
  dentist: {
    id: string;
    fullName: string;
    email: string;
    specialty?: string;
    _count?: {
      patients: number;
      appointments: number;
    };
  };
  showActions?: boolean;
}

export function DentistCard({ dentist, showActions = false }: DentistCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 text-white grid place-items-center text-sm font-bold">
        {dentist.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{dentist.fullName}</p>
        <p className="text-xs text-slate-500 truncate">
          {dentist.specialty || "Odontólogo general"}
        </p>
        {dentist._count && (
          <p className="text-[11px] text-slate-400 mt-0.5">
            {dentist._count.patients} pacientes · {dentist._count.appointments} citas
          </p>
        )}
      </div>
      
      {showActions && (
        <div className="flex items-center gap-1">
          <Link
            href={`/clinic/dentists/${dentist.id}`}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Ver perfil"
          >
            <User className="w-4 h-4" />
          </Link>
          <a
            href={`mailto:${dentist.email}`}
            className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            title="Enviar email"
          >
            <Mail className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
