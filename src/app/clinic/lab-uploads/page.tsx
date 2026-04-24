"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FlaskConical, 
  Search, 
  CheckCircle, 
  Clock, 
  FileImage,
  User,
  Link as LinkIcon,
  Loader2,
  X,
  Check
} from "lucide-react";
import Link from "next/link";

interface LabUpload {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  patientRut: string;
  subtype: string | null;
  description: string | null;
  isMatched: boolean;
  createdAt: string;
  laboratory: {
    name: string;
    contactName: string | null;
    phone: string | null;
  };
  patient?: {
    id: string;
    fullName: string;
    rut: string;
  } | null;
}

interface Patient {
  id: string;
  fullName: string;
  rut: string | null;
}

export default function ClinicLabUploadsPage() {
  const [uploads, setUploads] = useState<LabUpload[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "matched">("all");
  const [searchRut, setSearchRut] = useState("");
  const [selectedUpload, setSelectedUpload] = useState<LabUpload | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Cargar uploads
      const uploadsRes = await fetch(`/api/clinic/lab-uploads?status=${filter}`);
      if (!uploadsRes.ok) throw new Error("Error al cargar uploads");
      const uploadsData = await uploadsRes.json();
      setUploads(uploadsData.uploads || []);

      // Cargar pacientes para vinculación
      const patientsRes = await fetch("/api/clinic/patients");
      if (!patientsRes.ok) throw new Error("Error al cargar pacientes");
      const patientsData = await patientsRes.json();
      setPatients(patientsData.patients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedUpload || !selectedPatientId) return;

    setMatching(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/clinic/lab-uploads/${selectedUpload.id}/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: selectedPatientId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al vincular");
      }

      setMessage({ type: "success", text: "Radiografía vinculada exitosamente" });
      setSelectedUpload(null);
      setSelectedPatientId("");
      loadData();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setMatching(false);
    }
  };

  const filteredUploads = uploads.filter(u => {
    if (searchRut) {
      return u.patientRut.includes(searchRut.replace(/[.-]/g, ""));
    }
    return true;
  });

  const getSubtypeLabel = (subtype: string | null) => {
    const labels: Record<string, string> = {
      panoramic: "Panorámica",
      periapical: "Periapical",
      bitewing: "Bite-wing",
      occlusal: "Oclusal",
      tomography: "Tomografía",
      cephalometric: "Cefalométrica",
      other: "Otra",
    };
    return labels[subtype || ""] || subtype || "Sin tipo";
  };

  const pendingCount = uploads.filter(u => !u.isMatched).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/clinic" className="p-2 hover:bg-slate-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900">Radiografías de Laboratorio</h1>
                <p className="text-xs text-slate-500">
                  {pendingCount > 0 ? `${pendingCount} pendientes de vinculación` : "Todas vinculadas"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {message && (
          <div className={`mb-6 p-4 rounded-xl flex items-start gap-3 ${
            message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <X className="w-5 h-5 flex-shrink-0" />}
            <p className="text-sm">{message.text}</p>
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex rounded-xl border border-slate-200 bg-white overflow-hidden">
            {[
              { id: "all", label: "Todas" },
              { id: "pending", label: `Pendientes (${pendingCount})` },
              { id: "matched", label: "Vinculadas" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  filter === f.id 
                    ? "bg-blue-50 text-blue-700" 
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchRut}
              onChange={(e) => setSearchRut(e.target.value)}
              placeholder="Buscar por RUT..."
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredUploads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <FileImage className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchRut ? "No se encontraron resultados" : "No hay radiografías"}
            </h3>
            <p className="text-slate-500">
              {searchRut ? "Intente con otro RUT" : "Los laboratorios aún no han subido radiografías"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUploads.map((upload) => (
              <div
                key={upload.id}
                className={`bg-white rounded-2xl border p-6 transition ${
                  upload.isMatched ? "border-slate-200" : "border-amber-300 bg-amber-50/30"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icono estado */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    upload.isMatched ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"
                  }`}>
                    {upload.isMatched ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-slate-900">{upload.fileName}</h3>
                        <p className="text-sm text-slate-500">
                          {getSubtypeLabel(upload.subtype)} · Subido por {upload.laboratory.name}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        upload.isMatched 
                          ? "bg-green-100 text-green-700" 
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {upload.isMatched ? "Vinculada" : "Pendiente"}
                      </span>
                    </div>

                    <div className="mt-3 grid sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          RUT: <span className="font-medium">{upload.patientRut}</span>
                        </span>
                      </div>
                      {upload.patient && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="font-medium">{upload.patient.fullName}</span>
                        </div>
                      )}
                    </div>

                    {upload.description && (
                      <p className="mt-3 text-sm text-slate-500 italic">
                        "{upload.description}"
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => { setSelectedUpload(upload); setPreviewUrl(upload.fileUrl); }}
                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        Ver archivo
                      </button>
                      {!upload.isMatched && (
                        <button
                          onClick={() => setSelectedUpload(upload)}
                          className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-1"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Vincular a paciente
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de vinculación */}
      {selectedUpload && !previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Vincular radiografía a paciente
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Seleccione el paciente que corresponde al RUT {selectedUpload.patientRut}
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
              {patients.map((patient) => (
                <label
                  key={patient.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    selectedPatientId === patient.id 
                      ? "border-blue-500 bg-blue-50" 
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="patient"
                    value={patient.id}
                    checked={selectedPatientId === patient.id}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-slate-900">{patient.fullName}</p>
                    {patient.rut && (
                      <p className="text-xs text-slate-500">RUT: {patient.rut}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setSelectedUpload(null); setSelectedPatientId(""); }}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleMatch}
                disabled={!selectedPatientId || matching}
                className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {matching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Vinculando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Confirmar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de preview */}
      {previewUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={() => { setPreviewUrl(null); setSelectedUpload(null); }}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => { setPreviewUrl(null); setSelectedUpload(null); }}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewUrl} 
              alt="Radiografía" 
              className="max-w-full max-h-[85vh] rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
