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
  ChevronRight
} from "lucide-react";

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
  const [patientRut, setPatientRut] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subtype, setSubtype] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploads, setUploads] = useState<UploadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activePreviewUpload, setActivePreviewUpload] = useState<UploadHistory | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  // Buscar paciente por RUT con debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Limpiar RUT para contar solo números (sin puntos ni guión)
      const cleanRut = patientRut.replace(/[^0-9Kk]/g, "");
      if (cleanRut.length >= 7) { // RUT chileno tiene al menos 7 dígitos + DV
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
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error en la búsqueda");
      }
      const data = await res.json();
      
      if (data.patients && data.patients.length > 0) {
        setSelectedPatient(data.patients[0]);
      } else {
        setSelectedPatient(null);
        setPatientSearchError("No se encontró paciente con ese RUT");
      }
    } catch (err: any) {
      console.error("Error buscando paciente:", err);
      setPatientSearchError(err.message || "Error al buscar paciente");
    } finally {
      setSearchingPatient(false);
    }
  };

  const loadUploads = async () => {
    try {
      const res = await fetch("/api/lab/uploads");
      if (!res.ok) throw new Error("Error al cargar historial");
      const data = await res.json();
      setUploads(data.uploads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !patientRut) {
      setMessage({ type: "error", text: "RUT del paciente y archivo son requeridos" });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("patientRut", patientRut);
      formData.append("subtype", subtype);
      formData.append("description", description);

      const res = await fetch("/api/lab/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al subir archivo");
      }

      setMessage({ 
        type: "success", 
        text: data.message || "Radiografía subida exitosamente" 
      });

      setPatientRut("");
      setSelectedPatient(null);
      setSelectedFile(null);
      setSubtype("");
      setDescription("");
      setPreviewUrl(null);
      loadUploads();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/lab-logout", { method: "POST" });
    router.push("/login-laboratorio");
  };

  const formatRut = (rut: string) => {
    const clean = rut.replace(/[^0-9Kk]/g, "").toUpperCase();
    if (clean.length < 2) return clean;
    if (clean.length <= 9) {
      const body = clean.slice(0, -1);
      const dv = clean.slice(-1);
      const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `${formattedBody}-${dv}`;
    }
    return clean;
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const openPreview = (upload: UploadHistory) => {
    setActivePreviewUpload(upload);
    setShowPreviewModal(true);
  };

  const closePreview = () => {
    setShowPreviewModal(false);
    setActivePreviewUpload(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">Portal Laboratorio</h1>
                <p className="text-xs text-slate-500">Subir radiografías</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-red-600 transition"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario de subida */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Nueva Radiografía
            </h2>

            {message && (
              <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
                message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* RUT del paciente */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  RUT del Paciente
                </label>
                <div className="relative">
                  <Search className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 transition ${
                    searchingPatient ? "text-blue-500" : "text-slate-400"
                  }`} />
                  <input
                    type="text"
                    value={patientRut}
                    onChange={(e) => setPatientRut(formatRut(e.target.value))}
                    placeholder="12.345.678-9"
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchingPatient && (
                    <Loader2 className="w-5 h-5 text-blue-500 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                  )}
                  {!searchingPatient && selectedPatient && (
                    <CheckCircle className="w-5 h-5 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese el RUT sin puntos ni guión, se formateará automáticamente
                </p>
              </div>

              {/* Info del paciente encontrado */}
              {selectedPatient && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-green-900">{selectedPatient.fullName}</p>
                      <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-green-700">
                        {selectedPatient.birthDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {calculateAge(selectedPatient.birthDate)} años
                          </span>
                        )}
                        {selectedPatient.gender && (
                          <span>{selectedPatient.gender === "M" ? "Masculino" : "Femenino"}</span>
                        )}
                        {selectedPatient.clinic && (
                          <span className="flex items-center gap-1 col-span-2">
                            <Building2 className="w-3 h-3" />
                            {selectedPatient.clinic.name}
                          </span>
                        )}
                        {selectedPatient.dentist && (
                          <span className="flex items-center gap-1 col-span-2">
                            <Stethoscope className="w-3 h-3" />
                            {selectedPatient.dentist.fullName} ({selectedPatient.dentist.specialty})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error de búsqueda */}
              {patientSearchError && !searchingPatient && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-900">{patientSearchError}</p>
                    <p className="text-xs text-amber-700 mt-1">
                      La radiografía se subirá pero quedará pendiente de vinculación por la clínica.
                    </p>
                  </div>
                </div>
              )}

              {/* Tipo de radiografía */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Tipo de Radiografía
                </label>
                <select
                  value={subtype}
                  onChange={(e) => setSubtype(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Seleccione tipo...</option>
                  <option value="panoramic">Panorámica</option>
                  <option value="periapical">Periapical</option>
                  <option value="bitewing">Bite-wing</option>
                  <option value="occlusal">Oclusal</option>
                  <option value="tomography">Tomografía/Cone Beam</option>
                  <option value="cephalometric">Cefalométrica</option>
                  <option value="other">Otra</option>
                </select>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notas / Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Observaciones, indicaciones del médico, etc."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Subida de archivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Archivo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition">
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.dcm,.dicom"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    required
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    ) : (
                      <>
                        <FileImage className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-600">
                          <span className="text-blue-600 font-medium">Click para seleccionar</span> o arrastre aquí
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          JPG, PNG o DICOM (máx 50MB)
                        </p>
                      </>
                    )}
                  </label>
                </div>
                {selectedFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="w-4 h-4" />
                    <span className="truncate">{selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Subir Radiografía
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Historial de uploads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Historial de Subidas
            </h2>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : uploads.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileImage className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay radiografías subidas aún</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {uploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          upload.isMatched ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                        }`}>
                          {upload.isMatched ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-slate-900">{upload.fileName}</p>
                          <p className="text-xs text-slate-500">
                            RUT: {upload.patientRut} · {upload.subtype || "Sin tipo"}
                          </p>
                          {upload.patient && (
                            <p className="text-xs text-green-600">
                              ✓ Vinculado a: {upload.patient.fullName}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        upload.isMatched 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {upload.isMatched ? "Vinculada" : "Pendiente"}
                      </span>
                    </div>
                    {upload.description && (
                      <p className="mt-2 text-xs text-slate-500 italic">
                        "{upload.description}"
                      </p>
                    )}
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => openPreview(upload)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                        Ver radiografía
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de Preview Profesional */}
      {showPreviewModal && activePreviewUpload && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={closePreview}
        >
          <div 
            className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activePreviewUpload.isMatched ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                }`}>
                  <FileImage className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{activePreviewUpload.fileName}</h3>
                  <p className="text-xs text-slate-500">
                    {activePreviewUpload.subtype || "Radiografía"} · {new Date(activePreviewUpload.createdAt).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
              <button
                onClick={closePreview}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Info del paciente */}
            {activePreviewUpload.patient && (
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium text-slate-700">{activePreviewUpload.patient.fullName}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500">RUT: {activePreviewUpload.patientRut}</span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-xs font-medium ${
                    activePreviewUpload.isMatched 
                      ? "bg-green-100 text-green-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {activePreviewUpload.isMatched ? "Vinculada" : "Pendiente"}
                  </span>
                </div>
              </div>
            )}

            {/* Imagen */}
            <div className="p-4 bg-slate-900 flex items-center justify-center overflow-auto max-h-[60vh]">
              <img 
                src={activePreviewUpload.fileUrl} 
                alt={activePreviewUpload.fileName}
                className="max-w-full max-h-[55vh] object-contain rounded-lg"
              />
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex justify-between items-center">
              <div className="text-sm text-slate-500">
                {activePreviewUpload.description && (
                  <p>Notas: {activePreviewUpload.description}</p>
                )}
              </div>
              <a
                href={activePreviewUpload.fileUrl}
                download={activePreviewUpload.fileName}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
              >
                <Upload className="w-4 h-4" />
                Descargar
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
