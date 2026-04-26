"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Phone, Mail, Calendar, User, FileText, 
  Stethoscope, Loader2, Grid3X3, Box, FlaskConical, 
  Plus, Clock, CheckCircle, Eye, AlertCircle, RefreshCw 
} from "lucide-react";
import { Odontogram3D } from "../../../../components/odontogram-3d";
import { Jaw3D } from "../../../../components/jaw-3d";

interface LabOrder {
  id: string;
  examType: string;
  notes: string | null;
  status: "PENDING" | "IN_PROGRESS" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  laboratory?: { name: string };
  result?: { fileUrl: string; fileName: string };
}

interface Patient {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  rut: string | null;
  birthDate: string | null;
  address: string | null;
  insurance: string | null;
  notes: string | null;
  createdAt: string;
  dentist?: {
    id: string;
    fullName: string;
  };
}

interface Appointment {
  id: string;
  startAt: string;
  endAt: string;
  treatment: string | null;
  status: string;
  priceCLP: number | null;
  dentist: { fullName: string };
}

export default function PatientProfilePage() {
  const { id } = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "odontogram" | "jaw3d" | "history" | "lab">("info");
  const [odontogramView, setOdontogramView] = useState<"flat" | "jaw">("flat");

  // Estado para nueva orden
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ examType: "", notes: "", labId: "" });
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      try {
        const [pRes, aRes] = await Promise.all([
          fetch(`/api/clinic/patients/${id}`),
          fetch(`/api/clinic/patients/${id}/appointments`),
        ]);
        
        if (pRes.ok) {
          const pData = await pRes.json();
          setPatient(pData.patient);
        }
        if (aRes.ok) {
          const aData = await aRes.json();
          setAppointments(aData.appointments || []);
        }
      } catch (err) {
        console.error("Error cargando paciente:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (id) loadPatient();
  }, [id]);

  const loadLabOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/dentist/lab-orders?patientId=${id}`);
      if (res.ok) {
        const data = await res.json();
        setLabOrders(data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === "lab") {
      loadLabOrders();
    }
  }, [activeTab, id]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/dentist/lab-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: id,
          ...newOrder
        })
      });
      if (res.ok) {
        setShowOrderModal(false);
        setNewOrder({ examType: "", notes: "", labId: "" });
        loadLabOrders();
      }
    } catch (err) {
      alert("Error al crear orden");
    } finally {
      setCreatingOrder(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: "bg-amber-100 text-amber-700",
      IN_PROGRESS: "bg-blue-100 text-blue-700",
      READY: "bg-emerald-100 text-emerald-700",
      COMPLETED: "bg-slate-100 text-slate-500",
      CANCELLED: "bg-red-100 text-red-700"
    };
    const labels: any = {
      PENDING: "Pendiente",
      IN_PROGRESS: "En Proceso",
      READY: "Listo p/ Entrega",
      COMPLETED: "Subido",
      CANCELLED: "Cancelado"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Paciente No Encontrado</h2>
        <p className="text-slate-500">El ID del paciente no existe o fue eliminado.</p>
        <Link href="/clinic/pacientes" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20">
          Volver a Pacientes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/clinic/pacientes" className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition">
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Ficha del Paciente</h1>
          <p className="text-sm text-slate-600">Historial clínico completo</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: "info", label: "Información", icon: User },
          { id: "odontogram", label: "Odontograma", icon: Grid3X3 },
          { id: "jaw3d", label: "Vista 3D", icon: Box },
          { id: "history", label: "Historial", icon: Calendar },
          { id: "lab", label: "Órdenes Lab", icon: FlaskConical },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              if (tab.id === "jaw3d") setOdontogramView("jaw");
            }}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Sections */}
      {activeTab === "info" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-500 text-white grid place-items-center text-2xl font-bold flex-shrink-0">
                  {patient.fullName.split(" ").map(s => s[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold text-slate-900">{patient.fullName}</h2>
                  <p className="text-sm text-slate-500">{patient.rut || "Sin RUT"}</p>
                  <div className="flex flex-wrap gap-3 mt-3">
                    {patient.phone && (
                      <a href={`https://wa.me/${patient.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition">
                        <Phone className="w-4 h-4" /> {patient.phone}
                      </a>
                    )}
                    {patient.email && (
                      <a href={`mailto:${patient.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition">
                        <Mail className="w-4 h-4" /> {patient.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-400" /> Información General
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><p className="text-xs text-slate-500 uppercase">Nacimiento</p><p className="text-sm font-medium">{patient.birthDate ? new Date(patient.birthDate).toLocaleDateString("es-CL") : "No registrada"}</p></div>
                <div><p className="text-xs text-slate-500 uppercase">Previsión</p><p className="text-sm font-medium">{patient.insurance || "No registrada"}</p></div>
                <div className="md:col-span-2"><p className="text-xs text-slate-500 uppercase">Dirección</p><p className="text-sm font-medium">{patient.address || "No registrada"}</p></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lab Orders Tab */}
      {activeTab === "lab" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="w-6 h-6 text-blue-600" /> Órdenes de Laboratorio
            </h2>
            <button 
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100 text-sm font-bold"
            >
              <Plus className="w-4 h-4" /> SOLICITAR EXAMEN
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {loadingOrders ? (
                <div className="p-12 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando órdenes...</div>
              ) : labOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <FlaskConical className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-500 font-medium">No hay órdenes solicitadas para este paciente</p>
                </div>
              ) : (
                labOrders.map((order) => (
                  <div key={order.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-bold text-slate-900">{order.examType.toUpperCase()}</span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Solicitado el {new Date(order.createdAt).toLocaleDateString("es-CL")}
                        </p>
                        {order.notes && <p className="text-xs text-slate-400 mt-1 italic">"{order.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.result && (
                        <a 
                          href={order.result.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition"
                        >
                          <Eye className="w-4 h-4" /> VER RADIOGRAFÍA
                        </a>
                      )}
                      {order.status === "READY" && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> LISTO EN LAB
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nueva Orden */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Nueva Orden de Examen</h3>
              <button onClick={() => setShowOrderModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateOrder} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Tipo de Radiografía</label>
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  value={newOrder.examType}
                  onChange={(e) => setNewOrder({...newOrder, examType: e.target.value})}
                >
                  <option value="">Seleccione...</option>
                  <option value="panoramic">Panorámica</option>
                  <option value="periapical">Periapical</option>
                  <option value="bitewing">Bite-wing</option>
                  <option value="tomography">Tomografía / Cone Beam</option>
                  <option value="cephalometric">Cefalométrica</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Indicaciones / Notas</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                  rows={4}
                  placeholder="Instrucciones específicas para el laboratorio..."
                  value={newOrder.notes}
                  onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                />
              </div>
              <button 
                type="submit" 
                disabled={creatingOrder}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {creatingOrder ? "Enviando..." : "ENVIAR SOLICITUD A LABORATORIO"}
              </button>
            </form>
          </div>
        </div>
      )}

      {activeTab === "odontogram" && odontogramView === "flat" && <Odontogram3D patientName={patient.fullName} onToothClick={(t) => console.log(t)} />}
      {activeTab === "jaw3d" && <Jaw3D patientName={patient.fullName} onToothClick={(t) => console.log(t)} />}
      {activeTab === "history" && (
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-6 border-b border-slate-200"><h3 className="font-semibold text-lg">Historial de Atenciones</h3></div>
          <div className="divide-y divide-slate-100">
            {appointments.map(apt => (
              <div key={apt.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{apt.treatment || "Consulta"}</p>
                  <p className="text-sm text-slate-500">{apt.dentist.fullName} · {new Date(apt.startAt).toLocaleDateString("es-CL")}</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{apt.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function X(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
  );
}
