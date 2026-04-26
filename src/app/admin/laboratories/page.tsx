"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Search,
  Mail,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  MoreHorizontal,
  Key,
} from "lucide-react";

interface Laboratory {
  id: string;
  name: string;
  rut: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  contactName: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    uploads: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminLaboratoriesPage() {
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedLab, setSelectedLab] = useState<Laboratory | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchLaboratories();
  }, [pagination.page, search]);

  const fetchLaboratories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
      });

      const res = await fetch(`/api/admin/laboratories?${params}`);
      const data = await res.json();

      if (res.ok) {
        setLaboratories(data.laboratories);
        setPagination(data.pagination);
      } else {
        setMessage({ type: "error", text: data.error || "Error al cargar laboratorios" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedLab || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/laboratories/${selectedLab.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Contraseña actualizada correctamente" });
        setShowResetModal(false);
        setNewPassword("");
        setSelectedLab(null);
      } else {
        setMessage({ type: "error", text: data.error || "Error al resetear contraseña" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const openResetModal = (lab: Laboratory) => {
    setSelectedLab(lab);
    setNewPassword("");
    setShowResetModal(true);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/laboratories/${id}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: `Laboratorio ${!currentStatus ? "activado" : "desactivado"} correctamente` });
        fetchLaboratories();
      } else {
        setMessage({ type: "error", text: data.error || "Error al actualizar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-purple-600" />
              Gestión de Laboratorios
            </h2>
            <p className="text-gray-500 mt-1">
              {pagination.total} laboratorios registrados en la plataforma
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
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, RUT o email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
                    Laboratorio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Estadísticas
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
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      Cargando laboratorios...
                    </td>
                  </tr>
                ) : laboratories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron laboratorios
                    </td>
                  </tr>
                ) : (
                  laboratories.map((lab) => (
                    <tr key={lab.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                            <FlaskConical className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lab.name}</p>
                            {lab.rut && (
                              <p className="text-xs text-gray-500">RUT: {lab.rut}</p>
                            )}
                            {lab.contactName && (
                              <p className="text-xs text-gray-400">Contacto: {lab.contactName}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {lab.email}
                          </p>
                          {lab.phone && (
                            <p className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {lab.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {lab.address && (
                            <p className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {lab.address}
                            </p>
                          )}
                          {lab.city && <p>{lab.city}</p>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          <p>{lab._count.uploads} radiografías</p>
                          <p className="text-xs text-gray-400">
                            Registrado: {new Date(lab.createdAt).toLocaleDateString("es-CL")}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lab.isActive
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {lab.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openResetModal(lab)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                            title="Resetear contraseña"
                          >
                            <Key className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleStatus(lab.id, lab.isActive)}
                            className={`p-2 rounded-lg ${
                              lab.isActive
                                ? "text-red-600 hover:bg-red-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                            title={lab.isActive ? "Desactivar" : "Activar"}
                          >
                            <MoreHorizontal className="w-5 h-5" />
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
              Mostrando {laboratories.length} de {pagination.total} laboratorios
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Reset Password */}
      {showResetModal && selectedLab && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Resetear contraseña
            </h3>
            <p className="text-gray-500 mb-4">
              Laboratorio: <span className="font-medium">{selectedLab.name}</span>
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
