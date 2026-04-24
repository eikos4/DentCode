"use client";

import { useState } from "react";
import { Lock, X, CheckCircle, Loader2 } from "lucide-react";

interface ResetPasswordButtonProps {
  dentistId: string;
  dentistName: string;
}

export function ResetPasswordButton({ dentistId, dentistName }: ResetPasswordButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ tempPassword?: string; error?: string } | null>(null);

  async function resetPassword() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/clinic/dentists/${dentistId}/reset-password`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ tempPassword: data.tempPassword });
      } else {
        setResult({ error: data.error || "Error al resetear contraseña" });
      }
    } catch (err) {
      setResult({ error: "Error de conexión" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-sm font-medium rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition flex items-center gap-2"
      >
        <Lock className="w-4 h-4" /> Cambiar contraseña
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Resetear Contraseña</h3>
              <button
                onClick={() => { setIsOpen(false); setResult(null); }}
                className="p-1 rounded hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-slate-600 mb-4">
              ¿Deseas generar una nueva contraseña temporal para <strong>{dentistName}</strong>?
            </p>

            {result?.tempPassword && (
              <div className="p-4 bg-emerald-50 rounded-lg mb-4">
                <div className="flex items-center gap-2 text-emerald-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Contraseña generada</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">Comparte esta contraseña temporal con el dentista:</p>
                <div className="bg-white p-3 rounded border font-mono text-lg text-center select-all">
                  {result.tempPassword}
                </div>
              </div>
            )}

            {result?.error && (
              <div className="p-4 bg-red-50 rounded-lg mb-4 text-red-700">
                {result.error}
              </div>
            )}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setIsOpen(false); setResult(null); }}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Cerrar
              </button>
              {!result?.tempPassword && (
                <button
                  onClick={resetPassword}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generando...</>
                  ) : (
                    "Generar contraseña"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
