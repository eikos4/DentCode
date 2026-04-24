import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginFormClinic } from "../../components/login-form-clinic";
import { getAuthUser } from "../../lib/auth";

export default async function LoginClinicaPage() {
  const user = await getAuthUser();
  if (user) redirect("/clinic");
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 grid place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinica Dental</h1>
          <p className="text-gray-500 mt-2">Accede al panel de tu clinica</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <LoginFormClinic />
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          No tienes cuenta?{" "}
          <Link href="/registro-clinica" className="text-blue-600 hover:underline font-medium">Registrar clinica</Link>
        </p>
      </div>
    </div>
  );
}
