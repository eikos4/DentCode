import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Mail, ArrowRight, Calendar, Shield } from "lucide-react";

export default function RegistroExitoPage() {
  // TODO: Check if user completed registration
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-sky-500 p-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¡Registro completado!</h1>
            <p className="text-blue-100">Tu cuenta está lista para usar</p>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm text-green-800 font-medium">Email de verificación enviado</p>
                  <p className="text-xs text-green-600 mt-1">
                    Revisa tu bandeja de entrada (y carpeta de spam) y haz clic en el enlace para activar tu cuenta.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">¿Qué pasa ahora?</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Verificación profesional</p>
                    <p className="text-xs text-slate-600">
                      Nuestro equipo revisará tus documentos en 24-48 horas hábiles.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Explora la plataforma</p>
                    <p className="text-xs text-slate-600">
                      Mientras esperas verificación, puedes familiarizarte con el dashboard y configurar tu agenda.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-2">Próximos pasos recomendados</h3>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>1. Verifica tu email para activar la cuenta</li>
                <li>2. Ingresa al dashboard para explorar las funciones</li>
                <li>3. Configura tus horarios de atención</li>
                <li>4. Importa tu lista de pacientes (opcional)</li>
                <li>5. Personaliza tus plantillas de WhatsApp</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="flex-1 text-center px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-sky-500 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition flex items-center justify-center gap-2"
              >
                Ir al dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              <Link
                href="/"
                className="flex-1 text-center px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition"
              >
                Volver al inicio
              </Link>
            </div>

            <div className="text-center text-xs text-slate-500">
              <p>¿No recibiste el email? <a href="/reenviar-verificacion" className="text-blue-600 hover:underline">Reenviar verificación</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
