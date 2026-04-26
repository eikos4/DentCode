"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  FlaskConical, 
  Upload, 
  Search, 
  LogOut, 
  FileImage, 
  CheckCircle, 
  Clock,
  Loader2,
  X,
  FileText,
  User,
  Building2,
  Stethoscope,
  Calendar,
  Eye,
  AlertCircle,
  Check,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  MoreVertical
} from "lucide-react";

interface LabOrder {
  id: string;
  patientId: string;
  dentistId: string;
  clinicId: string | null;
  examType: string;
  notes: string | null;
  status: "PENDING" | "IN_PROGRESS" | "READY" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  patient: { fullName: string; rut: string };
  dentist: { fullName: string };
  clinic: { name: string } | null;
  result?: any;
}

interface UploadHistory {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  patientRut: string;
  subtype: string | null;
  description: string | null;
  isMatched: boolean;
  createdAt: string;
  patient?: {
    fullName: string;
    rut: string;
  } | null;
}

interface PatientInfo {
  id: string;
  fullName: string;
  rut: string | null;
  birthDate: string | null;
  gender: string | null;
  phone: string | null;
  email: string | null;
  clinic?: { name: string } | null;
  dentist?: { fullName: string; specialty: string } | null;
}

export default function LabDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "upload">("orders");
  
  // Estados para búsqueda/subida manual
  const [patientRut, setPatientRut] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subtype, setSubtype] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Estados para Órdenes
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);

  // Historial
  const [uploads, setUploads] = useState<UploadHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Modales
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activePreviewUpload, setActivePreviewUpload] = useState<UploadHistory | null>(null);

  useEffect(() => {
    loadOrders();
    loadUploads();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/lab/orders");
      if (!res.ok) throw new Error("Error al cargar órdenes");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUploads = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/lab/uploads");
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setUploads(data.uploads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/lab/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Error al actualizar estado");
      loadOrders();
    } catch (err) {
      console.error(err);
      alert("No se pudo actualizar el estado");
    }
  };

  // Buscar paciente por RUT (Manual)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const cleanRut = patientRut.replace(/[^0-9Kk]/g, "");
      if (cleanRut.length >= 7) {
        searchPatient(patientRut);
      } else {
        setSelectedPatient(null);
        setPatientSearchError(null);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [patientRut]);

  const searchPatient = async (rut: string) => {
    setSearchingPatient(true);
    setPatientSearchError(null);
    setSelectedPatient(null);
    try {
      const res = await fetch(`/api/lab/patients/search?rut=${encodeURIComponent(rut)}`);
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data = await res.json();
      if (data.patients && data.patients.length > 0) {
        setSelectedPatient(data.patients[0]);
      } else {
        setPatientSearchError("No se encontró paciente con ese RUT");
      }
    } catch (err: any) {
      setPatientSearchError("Error al buscar paciente");
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !patientRut) return;

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patientRut", patientRut);
      formData.append("subtype", subtype);
      formData.append("description", description);
      
      // Si viene de una orden, la vinculamos
      if (selectedOrder) {
        formData.append("orderId", selectedOrder.id);
      }

      const res = await fetch("/api/lab/uploads", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir archivo");

      setMessage({ type: "success", text: "Radiografía subida exitosamente" });
      resetUploadForm();
      loadUploads();
      loadOrders();
      if (selectedOrder) setActiveTab("orders");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setPatientRut("");
    setSelectedPatient(null);
    setSelectedFile(null);
    setSubtype("");
    setDescription("");
    setPreviewUrl(null);
    setSelectedOrder(null);
  };

  const handleSelectOrder = (order: LabOrder) => {
    setSelectedOrder(order);
    setPatientRut(order.patient.rut);
    setSubtype(order.examType);
    setDescription(`Examen solicitado por Dr(a). ${order.dentist.fullName}`);
    setActiveTab("upload");
  };

  const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9Kk]/g, "").toUpperCase();
    if (clean.length < 2) return clean;
    const body = clean.slice(0, -1);
    const dv = clean.slice(-1);
    return `${body.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}-${dv}`;
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      PENDING: "bg-amber-100 text-amber-700 border-amber-200",
      IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
      READY: "bg-emerald-100 text-emerald-700 border-emerald-200",
      COMPLETED: "bg-slate-100 text-slate-500 border-slate-200",
      CANCELLED: "bg-red-100 text-red-700 border-red-200"
    };
    const labels: any = {
      PENDING: "Pendiente",
      IN_PROGRESS: "En Proceso",
      READY: "Listo",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">Portal Laboratorio</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ecosistema DentCode</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "orders" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Órdenes
              </button>
              <button 
                onClick={() => { setActiveTab("upload"); resetUploadForm(); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === "upload" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                Subida Rápida
              </button>
            </nav>
            <button
              onClick={() => { fetch("/api/auth/lab-logout", { method: "POST" }).then(() => router.push("/login-laboratorio")); }}
              className="text-slate-400 hover:text-red-600 transition"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Columna Principal (Órdenes o Formulario) */}
          <div className="lg:col-span-8 space-y-6">
            
            {activeTab === "orders" ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                    <h2 className="font-bold text-slate-900">Órdenes de Trabajo Pendientes</h2>
                  </div>
                  <button onClick={loadOrders} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition">
                    <RefreshCw className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {loadingOrders ? (
                    <div className="p-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-sm text-slate-500 font-medium">Cargando tareas...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-slate-200" />
                      </div>
                      <p className="text-slate-500 font-medium">No tienes órdenes pendientes</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusBadge(order.status)}
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                #{order.id.slice(-6)} · {new Date(order.createdAt).toLocaleDateString("es-CL")}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{order.patient.fullName}</h3>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" /> {order.patient.rut}
                              </span>
                              <span className="flex items-center gap-1 font-bold text-blue-600">
                                <FileText className="w-3.5 h-3.5" /> {order.examType.toUpperCase()}
                              </span>
                              {order.clinic && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3.5 h-3.5" /> {order.clinic.name}
                                </span>
                              )}
                            </div>
                            {order.notes && (
                              <p className="mt-3 text-xs bg-white border border-slate-100 p-2 rounded-lg italic text-slate-500">
                                "{order.notes}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {order.status === "PENDING" && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}
                                className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl hover:bg-blue-100 transition"
                              >
                                EMPEZAR
                              </button>
                            )}
                            {order.status === "IN_PROGRESS" && (
                              <button 
                                onClick={() => updateOrderStatus(order.id, "READY")}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl hover:bg-emerald-100 transition"
                              >
                                MARCAR LISTO
                              </button>
                            )}
                            {order.status !== "COMPLETED" && (
                              <button 
                                onClick={() => handleSelectOrder(order)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-100"
                              >
                                <Upload className="w-3.5 h-3.5" /> SUBIR RESULTADO
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                    <Upload className="w-6 h-6 text-blue-600" />
                    {selectedOrder ? "Subir Resultado de Orden" : "Subida de Radiografía Directa"}
                  </h2>
                  {selectedOrder && (
                    <button 
                      onClick={() => { resetUploadForm(); setActiveTab("orders"); }}
                      className="text-sm font-bold text-slate-400 hover:text-slate-600"
                    >
                      Cancelar
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">RUT Paciente</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={patientRut}
                          onChange={(e) => setPatientRut(formatRut(e.target.value))}
                          disabled={!!selectedOrder}
                          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-slate-100 transition-all font-medium"
                          placeholder="12.345.678-9"
                        />
                        {searchingPatient && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tipo de Examen</label>
                      <select
                        value={subtype}
                        onChange={(e) => setSubtype(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                      >
                        <option value="">Seleccione...</option>
                        <option value="panoramic">Panorámica</option>
                        <option value="periapical">Periapical</option>
                        <option value="bitewing">Bite-wing</option>
                        <option value="tomography">Tomografía / Cone Beam</option>
                        <option value="cephalometric">Cefalométrica</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                  </div>

                  {selectedPatient && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-900">{selectedPatient.fullName}</p>
                        <p className="text-xs text-emerald-600 font-medium">
                          {selectedPatient.clinic?.name || "Sin clínica asociada"} · {selectedPatient.dentist?.fullName || "Sin dentista"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Observaciones Técnicas</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                      placeholder="Añade notas sobre el examen..."
                    />
                  </div>

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all group cursor-pointer relative">
                    <input type="file" id="lab-file" className="hidden" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.dcm,.dicom" />
                    <label htmlFor="lab-file" className="cursor-pointer block">
                      {previewUrl ? (
                        <img src={previewUrl} className="max-h-48 mx-auto rounded-xl shadow-lg" alt="Preview" />
                      ) : (
                        <div className="space-y-4">
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <FileImage className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">Seleccionar Imagen o DICOM</p>
                            <p className="text-sm text-slate-400">Arrastra los archivos o haz click para explorar</p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={uploading || (!selectedFile || !patientRut)}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20"
                  >
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    {selectedOrder ? "COMPLETAR ORDEN Y ENVIAR" : "SUBIR RADIOGRAFÍA"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Lateral (Historial) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Subidas Recientes
              </h2>
              
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="py-8 text-center text-slate-400 text-sm">Cargando...</div>
                ) : uploads.length === 0 ? (
                  <p className="py-8 text-center text-slate-400 text-sm italic">No hay subidas recientes</p>
                ) : (
                  uploads.map((up) => (
                    <div key={up.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <FileImage className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{up.patient?.fullName || up.patientRut}</p>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{up.subtype}</p>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">
                        {new Date(up.createdAt).toLocaleDateString("es-CL", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => router.push("/laboratorio/dashboard?tab=history")}
                className="w-full mt-6 py-2.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition border border-slate-100 rounded-xl"
              >
                VER HISTORIAL COMPLETO
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
