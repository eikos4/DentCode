"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldCheck,
  ShieldAlert,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Key,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Building2,
  Calendar,
  TrendingUp,
  Power,
} from "lucide-react";

interface Dentist {
  id: string;
  email: string;
  fullName: string | null;
  rut: string | null;
  specialty: string | null;
  phone: string | null;
  plan: string;
  verificationStatus: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    patients: number;
    appointments: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDentistsPage() {
  const router = useRouter();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchDentists();
  }, [pagination.page, search, planFilter, verificationFilter]);

  const fetchDentists = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(planFilter && { plan: planFilter }),
        ...(verificationFilter && { verificationStatus: verificationFilter }),
      });

      const res = await fetch(`/api/admin/dentists?${params}`);
      const data = await res.json();

      if (res.ok) {
        setDentists(data.dentists);
        setPagination(data.pagination);
      } else {
        setMessage({ type: "error", text: data.error || "Error al cargar dentistas" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    try {
      const res = await fetch(`/api/admin/dentists/${id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        fetchDentists();
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/dentists/${id}/toggle-status`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        fetchDentists();
      } else {
        setMessage({ type: "error", text: data.error || "Error al cambiar estado" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedDentist || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/dentists/${selectedDentist.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
        setShowResetModal(false);
        setNewPassword("");
        setSelectedDentist(null);
      } else {
        setMessage({ type: "error", text: data.error || "Error al resetear contraseña" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const openResetModal = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setNewPassword("");
    setShowResetModal(true);
  };

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
            <ShieldCheck className="w-3 h-3" /> Verificado
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
            <Shield className="w-3 h-3" /> Pendiente
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
            <ShieldAlert className="w-3 h-3" /> Rechazado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
            <Shield className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      trial: "bg-purple-100 text-purple-700",
      dentist: "bg-blue-100 text-blue-700",
      clinic: "bg-emerald-100 text-emerald-700",
      enterprise: "bg-orange-100 text-orange-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[plan] || "bg-gray-100 text-gray-600"}`}>
        {plan === "trial" ? "Trial" : plan === "dentist" ? "Dentista" : plan === "clinic" ? "Clínica" : plan}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Administración</h1>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Gestión de Dentistas
            </h2>
            <p className="text-gray-500 mt-1">
              {pagination.total} dentistas registrados en la plataforma
            </p>
          </div>
        </div>

        {/* Mensajes */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o RUT..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los planes</option>
                <option value="trial">Trial</option>
                <option value="dentist">Dentista</option>
                <option value="clinic">Clínica</option>
                <option value="enterprise">Enterprise</option>
              </select>
              <select
                value={verificationFilter}
                onChange={(e) => {
                  setVerificationFilter(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="verified">Verificados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Dentista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Verificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estadísticas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Último acceso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Cargando dentistas...
                    </td>
                  </tr>
                ) : dentists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron dentistas
                    </td>
                  </tr>
                ) : (
                  dentists.map((dentist) => (
                    <tr key={dentist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center font-bold">
                            {dentist.fullName?.charAt(0) || dentist.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {dentist.fullName || "Sin nombre"}
                            </p>
                            <p className="text-sm text-gray-500">{dentist.email}</p>
                            {dentist.rut && (
                              <p className="text-xs text-gray-400">RUT: {dentist.rut}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getPlanBadge(dentist.plan)}</td>
                      <td className="px-6 py-4">
                        {getVerificationBadge(dentist.verificationStatus)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <p>{dentist._count.patients} pacientes</p>
                          <p>{dentist._count.appointments} citas</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {dentist.lastLoginAt
                            ? new Date(dentist.lastLoginAt).toLocaleDateString("es-CL")
                            : "Nunca"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          dentist.isActive 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-red-100 text-red-700"
                        }`}>
                          {dentist.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleStatus(dentist.id)}
                            className={`p-2 rounded-lg ${
                              dentist.isActive 
                                ? "text-red-600 hover:bg-red-50" 
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={dentist.isActive ? "Deshabilitar" : "Habilitar"}
                          >
                            <Power className="w-5 h-5" />
                          </button>
                          {dentist.verificationStatus === "pending" && (
                            <>
                              <button
                                onClick={() => handleVerify(dentist.id, "verified")}
                                className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                title="Aprobar"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleVerify(dentist.id, "rejected")}
                                className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                                title="Rechazar"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => openResetModal(dentist)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Resetear contraseña"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando {dentists.length} de {pagination.total} dentistas
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Reset Password */}
      {showResetModal && selectedDentist && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resetear contraseña
            </h3>
            <p className="text-gray-500 mb-4">
              Dentista: <span className="font-medium">{selectedDentist.fullName || selectedDentist.email}</span>
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva contraseña
              </label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Ingresa la nueva contraseña"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!newPassword}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
