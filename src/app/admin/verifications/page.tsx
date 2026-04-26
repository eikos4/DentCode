"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeft,
  AlertCircle,
  Search,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Award,
} from "lucide-react";

interface VerificationDoc {
  id: string;
  type: string;
  url: string;
  status: string;
}

interface Dentist {
  id: string;
  email: string;
  fullName: string | null;
  rut: string | null;
  licenseNumber: string | null;
  specialty: string | null;
  phone: string | null;
  bio: string | null;
  photoUrl: string | null;
  verificationStatus: string;
  verificationNotes: string | null;
  createdAt: string;
  _count: {
    patients: number;
    appointments: number;
  };
  verificationDocs: VerificationDoc[];
}

export default function AdminVerificationsPage() {
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState<"verify" | "reject" | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/dentists?verificationStatus=pending&limit=100");
      const data = await res.json();

      if (res.ok) {
        setDentists(data.dentists);
      } else {
        setMessage({ type: "error", text: data.error || "Error al cargar verificaciones" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedDentist || !action) return;

    try {
      const res = await fetch(`/api/admin/dentists/${selectedDentist.id}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "verify" ? "verified" : "rejected",
          notes,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: `Dentista ${action === "verify" ? "verificado" : "rechazado"} correctamente`,
        });
        setShowModal(false);
        setSelectedDentist(null);
        setAction(null);
        setNotes("");
        fetchPendingVerifications();
      } else {
        setMessage({ type: "error", text: data.error || "Error al procesar" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error de conexión" });
    }
  };

  const openModal = (dentist: Dentist, actionType: "verify" | "reject") => {
    setSelectedDentist(dentist);
    setAction(actionType);
    setNotes("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedDentist(null);
    setAction(null);
    setNotes("");
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
              <Shield className="w-6 h-6 text-amber-600" />
              Verificaciones Pendientes
            </h2>
            <p className="text-gray-500 mt-1">
              {dentists.length} dentistas esperando verificación
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

        {/* Lista de verificaciones */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando verificaciones...</p>
          </div>
        ) : dentists.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay verificaciones pendientes
            </h3>
            <p className="text-gray-500">
              Todos los dentistas han sido verificados. ¡Buen trabajo!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dentists.map((dentist) => (
              <div
                key={dentist.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    {/* Info del dentista */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center text-xl font-bold">
                          {dentist.fullName?.charAt(0) || dentist.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {dentist.fullName || "Sin nombre registrado"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" /> {dentist.email}
                            </span>
                            {dentist.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-4 h-4" /> {dentist.phone}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {dentist.rut && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                RUT: {dentist.rut}
                              </span>
                            )}
                            {dentist.licenseNumber && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                <Award className="w-3 h-3" />
                                Licencia: {dentist.licenseNumber}
                              </span>
                            )}
                            {dentist.specialty && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                {dentist.specialty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {dentist.bio && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Biografía:</span> {dentist.bio}
                          </p>
                        </div>
                      )}

                      {/* Estadísticas */}
                      <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                        <span>Registrado: {new Date(dentist.createdAt).toLocaleDateString("es-CL")}</span>
                        <span>{dentist._count.patients} pacientes</span>
                        <span>{dentist._count.appointments} citas</span>
                      </div>

                      {/* Documentos de Verificación */}
                      <div className="mt-6">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Documentos de Verificación</h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {dentist.verificationDocs.length > 0 ? (
                            dentist.verificationDocs.map((doc) => (
                              <a
                                key={doc.id}
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition group"
                              >
                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate capitalize">
                                    {doc.type.replace("_", " ")}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Eye className="w-3 h-3" /> Ver documento
                                  </p>
                                </div>
                              </a>
                            ))
                          ) : (
                            <p className="text-sm text-gray-400 italic">No hay documentos cargados</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex lg:flex-col gap-2">
                      <button
                        onClick={() => openModal(dentist, "verify")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar
                      </button>
                      <button
                        onClick={() => openModal(dentist, "reject")}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de verificación */}
      {showModal && selectedDentist && action && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  action === "verify" ? "bg-emerald-100" : "bg-red-100"
                }`}
              >
                {action === "verify" ? (
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {action === "verify" ? "Aprobar dentista" : "Rechazar dentista"}
                </h3>
                <p className="text-gray-500">
                  {selectedDentist.fullName || selectedDentist.email}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  action === "verify"
                    ? "Notas sobre la verificación..."
                    : "Motivo del rechazo..."
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 text-white rounded-lg ${
                  action === "verify"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {action === "verify" ? "Confirmar aprobación" : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
