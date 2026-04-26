"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, Phone, MapPin, Briefcase, FileText, Camera, Shield,
  ChevronRight, ChevronLeft, Check, AlertCircle, Loader2, Eye, EyeOff,
  Calendar, Clock, CreditCard, Building, Stethoscope, Award,
} from "lucide-react";
import { formatRut, isValidRut, cleanRut } from "@/lib/rut";

const SPECIALTIES = [
  "Odontología general",
  "Ortodoncia",
  "Endodoncia",
  "Periodoncia",
  "Implantología",
  "Rehabilitación oral",
  "Odontopediatría",
  "Cirugía maxilofacial",
  "Odontología estética",
  "Otro",
];

const REGIONS = [
  "Región Metropolitana",
  "Región de Valparaíso",
  "Región del Biobío",
  "Región de Araucanía",
  "Región de Antofagasta",
  "Región de Coquimbo",
  "Región de Los Lagos",
  "Región de Los Ríos",
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Ñuble",
  "Región del Maule",
  "Región de Libertador General Bernardo O'Higgins",
  "Región de Aysén del General Carlos Ibáñez del Campo",
  "Región de Magallanes y de la Antártica Chilena",
];

interface FormData {
  // Paso 1: Cuenta básica
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  
  // Paso 2: Información profesional
  rut: string;
  licenseNumber: string;
  specialty: string;
  university: string;
  graduationYear: string;
  
  // Paso 3: Ubicación y consultorio
  clinicName: string;
  address: string;
  commune: string;
  region: string;
  lat?: number;
  lng?: number;
  
  // Paso 4: Documentación
  licenseFile: File | null;
  degreeFile: File | null;
  idFile: File | null;
  
  // Paso 5: Plan y confirmación
  plan: "trial" | "dentist" | "clinic";
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingAccepted: boolean;
}

const initialState: FormData = {
  email: "", password: "", confirmPassword: "", fullName: "", phone: "",
  rut: "", licenseNumber: "", specialty: "", university: "", graduationYear: "",
  clinicName: "", address: "", commune: "", region: "Región Metropolitana",
  licenseFile: null, degreeFile: null, idFile: null,
  plan: "trial", termsAccepted: false, privacyAccepted: false, marketingAccepted: false,
};

export function DentistRegistrationWizard() {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FormData>(initialState);
  const router = useRouter();

  const update = (field: keyof FormData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!data.email) newErrors.email = "Email requerido";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) newErrors.email = "Email inválido";
      if (!data.password) newErrors.password = "Contraseña requerida";
      else if (data.password.length < 8) newErrors.password = "Mínimo 8 caracteres";
      if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden";
      if (!data.fullName) newErrors.fullName = "Nombre completo requerido";
      if (!data.phone) newErrors.phone = "Teléfono requerido";
    }

    if (step === 2) {
      if (!data.rut) newErrors.rut = "RUT requerido";
      else if (!isValidRut(cleanRut(data.rut))) newErrors.rut = "RUT inválido";
      if (!data.licenseNumber) newErrors.licenseNumber = "Número de licencia requerido";
      if (!data.specialty) newErrors.specialty = "Especialidad requerida";
      if (!data.university) newErrors.university = "Universidad requerida";
      if (!data.graduationYear) newErrors.graduationYear = "Año de egreso requerido";
      else if (isNaN(Number(data.graduationYear)) || Number(data.graduationYear) < 1950 || Number(data.graduationYear) > new Date().getFullYear()) {
        newErrors.graduationYear = "Año inválido";
      }
    }

    if (step === 3) {
      if (!data.clinicName) newErrors.clinicName = "Nombre del consultorio requerido";
      if (!data.address) newErrors.address = "Dirección requerida";
      if (!data.commune) newErrors.commune = "Comuna requerida";
      if (!data.region) newErrors.region = "Región requerida";
    }

    if (step === 4) {
      if (!data.licenseFile) newErrors.licenseFile = "Licencia profesional requerida";
      if (!data.degreeFile) newErrors.degreeFile = "Título profesional requerido";
    }

    if (step === 5) {
      if (!data.termsAccepted) newErrors.terms = "Debes aceptar los términos y condiciones";
      if (!data.privacyAccepted) newErrors.privacy = "Debes aceptar la política de privacidad";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(prev => Math.min(prev + 1, 5));
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const submit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    
    try {
      // TODO: Implementar registro real
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) formData.append(key, value);
        else if (typeof value === "boolean") formData.append(key, value ? "true" : "false");
        else if (value) formData.append(key, String(value));
      });

      const res = await fetch("/api/dentists/register", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // TODO: Redirigir a dashboard o página de verificación
        router.push("/registro/exito");
      } else {
        const error = await res.json();
        setErrors({ submit: error.message || "Error al registrar" });
      }
    } catch (err) {
      setErrors({ submit: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = ["Cuenta", "Profesional", "Ubicación", "Documentos", "Confirmar"];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Progress bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                    i + 1 === step
                      ? "bg-blue-600 text-white"
                      : i + 1 < step
                      ? "bg-green-600 text-white"
                      : "bg-slate-300 text-slate-600"
                  }`}
                >
                  {i + 1 < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`ml-2 text-sm ${i + 1 === step ? "text-blue-600 font-medium" : "text-slate-600"}`}>
                  {title}
                </span>
                {i < stepTitles.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${i + 1 < step ? "bg-green-600" : "bg-slate-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form content */}
        <div className="p-8">
          {/* Step 1: Cuenta */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Crea tu cuenta</h2>
                <p className="text-slate-600 mt-2">Información básica para tu perfil</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-1" /> Email profesional
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tu@consultorio.cl"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" /> Teléfono
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre completo</label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dr. Juan Pérez Soto"
                />
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={data.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 8 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={data.confirmPassword}
                    onChange={(e) => update("confirmPassword", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Repite tu contraseña"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Profesional */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Información profesional</h2>
                <p className="text-slate-600 mt-2">Datos para verificar tu identidad profesional</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">RUT</label>
                  <input
                    type="text"
                    value={data.rut}
                    onChange={(e) => update("rut", formatRut(e.target.value))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="12.345.678-9"
                  />
                  {errors.rut && <p className="text-red-500 text-sm mt-1">{errors.rut}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">N° Licencia SIS</label>
                  <input
                    type="text"
                    value={data.licenseNumber}
                    onChange={(e) => update("licenseNumber", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SIS-12345"
                  />
                  {errors.licenseNumber && <p className="text-red-500 text-sm mt-1">{errors.licenseNumber}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Especialidad principal</label>
                <select
                  value={data.specialty}
                  onChange={(e) => update("specialty", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona tu especialidad</option>
                  {SPECIALTIES.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
                {errors.specialty && <p className="text-red-500 text-sm mt-1">{errors.specialty}</p>}
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Universidad</label>
                  <input
                    type="text"
                    value={data.university}
                    onChange={(e) => update("university", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Universidad de Chile"
                  />
                  {errors.university && <p className="text-red-500 text-sm mt-1">{errors.university}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Año de egreso</label>
                  <input
                    type="text"
                    value={data.graduationYear}
                    onChange={(e) => update("graduationYear", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2015"
                  />
                  {errors.graduationYear && <p className="text-red-500 text-sm mt-1">{errors.graduationYear}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Ubicación */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Ubicación del consultorio</h2>
                <p className="text-slate-600 mt-2">¿Dónde atiendes a tus pacientes?</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Nombre del consultorio</label>
                <input
                  type="text"
                  value={data.clinicName}
                  onChange={(e) => update("clinicName", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Consultorio Dr. Pérez"
                />
                {errors.clinicName && <p className="text-red-500 text-sm mt-1">{errors.clinicName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección completa</label>
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Av. Providencia 1234, Oficina 501"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Región</label>
                  <select
                    value={data.region}
                    onChange={(e) => update("region", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {REGIONS.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Comuna</label>
                  <input
                    type="text"
                    value={data.commune}
                    onChange={(e) => update("commune", e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Providencia"
                  />
                  {errors.commune && <p className="text-red-500 text-sm mt-1">{errors.commune}</p>}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Ubicación en mapa</p>
                    <p className="text-xs text-blue-600 mt-1">
                      La dirección será geolocalizada para que los pacientes puedan encontrarte fácilmente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Documentos */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Verificación profesional</h2>
                <p className="text-slate-600 mt-2">Sube los documentos para verificar tu identidad</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Award className="w-4 h-4 inline mr-1" /> Licencia profesional
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => update("licenseFile", e.target.files?.[0] || null)}
                      className="hidden"
                      id="license-file"
                    />
                    <label htmlFor="license-file" className="cursor-pointer">
                      {data.licenseFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-slate-700">{data.licenseFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Haz clic para subir o arrastra aquí</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                  {errors.licenseFile && <p className="text-red-500 text-sm mt-1">{errors.licenseFile}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-1" /> Título profesional
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => update("degreeFile", e.target.files?.[0] || null)}
                      className="hidden"
                      id="degree-file"
                    />
                    <label htmlFor="degree-file" className="cursor-pointer">
                      {data.degreeFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-slate-700">{data.degreeFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Haz clic para subir o arrastra aquí</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                  {errors.degreeFile && <p className="text-red-500 text-sm mt-1">{errors.degreeFile}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" /> Cédula de identidad (opcional)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => update("idFile", e.target.files?.[0] || null)}
                      className="hidden"
                      id="id-file"
                    />
                    <label htmlFor="id-file" className="cursor-pointer">
                      {data.idFile ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-slate-700">{data.idFile.name}</span>
                        </div>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Haz clic para subir o arrastra aquí</p>
                          <p className="text-xs text-slate-500 mt-1">PDF, JPG o PNG (máx. 5MB)</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-amber-800 font-medium">Proceso de verificación</p>
                    <p className="text-xs text-amber-600 mt-1">
                      Tus documentos serán revisados por nuestro equipo dentro de 24-48 horas hábiles. 
                      Mientras tanto, podrás explorar la plataforma con funciones limitadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Confirmar */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Confirma y comienza</h2>
                <p className="text-slate-600 mt-2">Revisa tu información y elige tu plan</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-slate-900 mb-4">Resumen del registro</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Nombre:</p>
                    <p className="font-medium">{data.fullName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Email:</p>
                    <p className="font-medium">{data.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Especialidad:</p>
                    <p className="font-medium">{data.specialty}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Consultorio:</p>
                    <p className="font-medium">{data.clinicName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-600">Dirección:</p>
                    <p className="font-medium">{data.address}, {data.commune}, {data.region}</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Elige tu plan</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      id: "trial",
                      name: "Prueba gratuita",
                      price: "$0",
                      period: "14 días",
                      features: ["Agenda completa", "Hasta 50 pacientes", "WhatsApp básico", "Sin tarjeta"],
                      recommended: false,
                    },
                    {
                      id: "dentist",
                      name: "Plan Dentista",
                      price: "$30.000",
                      period: "/ mes",
                      features: ["Pacientes ilimitados", "WhatsApp pro", "Reportes", "Soporte prioritario"],
                      recommended: true,
                    },
                    {
                      id: "clinic",
                      name: "Plan Clínica",
                      price: "$200.000",
                      period: "/ mes",
                      features: ["Multi-dentista", "Dashboard avanzado", "API", "Dedicado"],
                      recommended: false,
                    },
                  ].map((plan) => (
                    <div
                      key={plan.id}
                      className={`relative rounded-lg border-2 p-4 cursor-pointer transition ${
                        data.plan === plan.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                      onClick={() => update("plan", plan.id as any)}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                          Recomendado
                        </div>
                      )}
                      <div className="text-center">
                        <h4 className="font-semibold">{plan.name}</h4>
                        <div className="mt-2">
                          <span className="text-2xl font-bold">{plan.price}</span>
                          <span className="text-slate-600">{plan.period}</span>
                        </div>
                        <ul className="mt-3 space-y-1 text-xs text-left">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-1">
                              <Check className="w-3 h-3 text-green-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.termsAccepted}
                    onChange={(e) => update("termsAccepted", e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">
                    Acepto los <a href="/terminos" className="text-blue-600 hover:underline">términos y condiciones</a> de Dentcode
                  </span>
                </label>
                {errors.terms && <p className="text-red-500 text-sm">{errors.terms}</p>}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.privacyAccepted}
                    onChange={(e) => update("privacyAccepted", e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">
                    He leído y acepto la <a href="/privacidad" className="text-blue-600 hover:underline">política de privacidad</a>
                  </span>
                </label>
                {errors.privacy && <p className="text-red-500 text-sm">{errors.privacy}</p>}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.marketingAccepted}
                    onChange={(e) => update("marketingAccepted", e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-sm text-slate-700">
                    Deseo recibir novedades y promociones por email y WhatsApp
                  </span>
                </label>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>

            {step < stepTitles.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-medium hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Completar registro
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center gap-8 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Datos seguros
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="w-4 h-4" />
            Sin tarjeta requerida
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Verificación 24-48h
          </div>
        </div>
      </div>
    </>
  );
}
