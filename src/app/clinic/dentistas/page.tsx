"use client";

import { useState, useEffect } from "react";
import { UserPlus, Search, Mail, Phone, Calendar, Users, MoreHorizontal, Lock, X, CheckCircle, Loader2 } from "lucide-react";
import Link from "next/link";
interface Dentist {
  id: string;
  fullName: string;
  email: string;
  specialty: string | null;
  phone: string | null;
  isActive: boolean;
  _count?: {
    patients: number;
    appointments: number;
  };
}

interface ClinicData {
  id: string;
  name: string;
  role: string;
  dentists: Dentist[];
  _count?: {
    dentists: number;
    patients: number;
  };
}

export default function ClinicDentistsPage() {
  const [clinic, setClinic] = useState<ClinicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetModal, setResetModal] = useState<{
    open: boolean;
    dentist: Dentist | null;
    loading: boolean;
    result: { tempPassword?: string; error?: string } | null;
  }>({ open: false, dentist: null, loading: false, result: null });

  // Cargar datos
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/clinic/dentists");
        if (res.ok) {
          const data = await res.json();
          // Simular estructura de clinic para compatibilidad
          setClinic({
            id: "",
            name: "",
            role: "CLINIC_ADMIN",
            dentists: data.dentists || [],
            _count: { dentists: data.dentists?.length || 0, patients: 0 }
          });
        }
      } catch (err) {
        console.error("Error cargando dentistas:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function resetPassword(dentistId: string) {
    setResetModal(prev => ({ ...prev, loading: true, result: null }));
    try {
      const res = await fetch(`/api/clinic/dentists/${dentistId}/reset-password`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setResetModal(prev => ({ ...prev, loading: false, result: { tempPassword: data.tempPassword } }));
      } else {
        setResetModal(prev => ({ ...prev, loading: false, result: { error: data.error || "Error al resetear contraseña" } }));
      }
    } catch (err) {
      setResetModal(prev => ({ ...prev, loading: false, result: { error: "Error de conexión" } }));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!clinic) {
    return <div className="p-8 text-center text-red-600">Error cargando datos</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dentistas
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {clinic._count?.dentists || 0} profesionales activos en {clinic.name}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Buscar dentista..."
              className="pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white w-full sm:w-56 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          {clinic.role === "CLINIC_ADMIN" && (
            <Link
              href="/clinic/dentistas/invite"
              className="flex-1 sm:flex-initial justify-center px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-600/25 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" /> Invitar dentista
            </Link>
          )}
        </div>
      </div>

      {/* Modal Reset Password */}
      {resetModal.open && resetModal.dentist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Resetear Contraseña</h3>
              <button
                onClick={() => setResetModal({ open: false, dentist: null, loading: false, result: null })}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-600 mb-4">
              ¿Deseas generar una nueva contraseña temporal para <strong>{resetModal.dentist.fullName}</strong>?
            </p>

            {resetModal.result?.tempPassword && (
              <div className="p-4 bg-emerald-50 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Contraseña generada</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">Comparte esta contraseña temporal con el dentista:</p>
                <div className="bg-white p-3 rounded border font-mono text-lg text-center select-all">
                  {resetModal.result.tempPassword}
                </div>
              </div>
            )}

            {resetModal.result?.error && (
              <div className="p-4 bg-red-50 rounded-lg mb-4 text-red-700">
                {resetModal.result.error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setResetModal({ open: false, dentist: null, loading: false, result: null })}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Cerrar
              </button>
              {!resetModal.result?.tempPassword && (
                <button
                  onClick={() => resetPassword(resetModal.dentist!.id)}
                  disabled={resetModal.loading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {resetModal.loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  ) : (
                    "Generar contraseña"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Total dentistas</p>
          <p className="text-2xl font-bold">{clinic._count?.dentists || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Calendar className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Citas esta semana</p>
          <p className="text-2xl font-bold">
            {clinic.dentists?.reduce((sum, d) => sum + (d._count?.appointments || 0), 0) || 0}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <Users className="w-5 h-5 text-violet-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Pacientes totales</p>
          <p className="text-2xl font-bold">{clinic._count?.patients || 0}</p>
        </div>
        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <MoreHorizontal className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Especialidades</p>
          <p className="text-2xl font-bold">
            {new Set(clinic.dentists?.map(d => d.specialty).filter(Boolean) || []).size}
          </p>
        </div>
      </div>

      {/* Dentistas List */}
      <div className="bg-white rounded-2xl border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h2 className="font-semibold text-lg">Equipo dental</h2>
        </div>
        
        {!clinic.dentists || clinic.dentists.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">Sin dentistas registrados</h3>
            <p className="text-sm text-slate-500 mb-6">
              Comienza invitando dentistas para que se unan a tu clínica
            </p>
            {clinic.role === "CLINIC_ADMIN" && (
              <Link
                href="/clinic/dentistas/invite"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
              >
                <UserPlus className="w-4 h-4" /> Invitar primer dentista
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {clinic.dentists.map((dentist) => (
              <div key={dentist.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-500 text-white grid place-items-center text-lg font-bold flex-shrink-0">
                    {dentist.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">
                          {dentist.fullName}
                        </h3>
                        <p className="text-sm text-slate-600">
                          {dentist.specialty || "Odontólogo general"}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {dentist.email}
                          </span>
                          {dentist.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {dentist.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-end gap-2 text-right">
                        <div className="text-xs text-slate-500">
                          <div>{dentist._count?.patients || 0} pacientes</div>
                          <div>{dentist._count?.appointments || 0} citas</div>
                        </div>
                        {clinic.role === "CLINIC_ADMIN" && (
                          <div className="flex gap-1">
                            <Link
                              href={`/clinic/dentistas/${dentist.id}`}
                              className="p-1.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                              title="Ver perfil"
                            >
                              <Users className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setResetModal({ open: true, dentist, loading: false, result: null })}
                              className="p-1.5 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition"
                              title="Resetear contraseña"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
