import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterClinicForm } from "../../components/register-form-clinic";
import { getAuthUser } from "@/lib/auth";

export default async function RegistroClinicaPage() {
  const user = await getAuthUser();
  if (user) redirect("/clinic");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 grid place-items-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Registra tu clinica</h1>
          <p className="text-gray-500 mt-2">Crea la cuenta de tu clinica dental en Dentcode</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <RegisterClinicForm />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          Ya tienes cuenta?{" "}
          <Link href="/login-clinica" className="text-blue-600 hover:underline font-medium">Iniciar sesion</Link>
        </p>
      </div>
    </div>
  );
}
