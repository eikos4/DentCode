import { redirect } from "next/navigation";
import { DentistRegistrationWizard } from "./dentist-registration-wizard";

export default function RegistroPage() {
  // TODO: Add redirect if already logged in
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Registra tu consulta en <span className="text-blue-600">Dentcode</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Únete a la red de dentistas digitales más grande de Chile. 
              Comienza con 14 días gratis, sin compromiso.
            </p>
          </div>
          
          <DentistRegistrationWizard />
        </div>
      </div>
    </div>
  );
}
