"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

export function LandingContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    accountType: "Dentista independiente",
    context: "",
  });
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Error al enviar mensaje");
      
      setStatus("success");
      setFormData({ name: "", email: "", phone: "", accountType: "Dentista independiente", context: "" });
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-14 p-12 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center text-center anim-fade-up">
        <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">¡Mensaje enviado!</h3>
        <p className="mt-2 text-slate-500">Gracias por contactarnos. Nuestro equipo revisará tu caso y te contactaremos en menos de 24 horas.</p>
        <button 
          onClick={() => setStatus("idle")} 
          className="mt-8 px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-14 grid md:grid-cols-2 gap-5 p-8 md:p-10 rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 anim-fade-up">
      <label className="text-sm font-medium text-slate-700">
        Nombre
        <input 
          required 
          value={formData.name}
          onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
          className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" 
        />
      </label>
      
      <label className="text-sm font-medium text-slate-700">
        Email
        <input 
          type="email" 
          required 
          value={formData.email}
          onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
          className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" 
        />
      </label>
      
      <label className="text-sm font-medium text-slate-700">
        Teléfono / WhatsApp
        <input 
          placeholder="+56 9 82232855" 
          value={formData.phone}
          onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))}
          className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition" 
        />
      </label>
      
      <label className="text-sm font-medium text-slate-700">
        Tipo de cuenta
        <select 
          value={formData.accountType}
          onChange={(e) => setFormData(p => ({ ...p, accountType: e.target.value }))}
          className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition bg-white"
        >
          <option>Dentista independiente</option>
          <option>Clínica dental</option>
          <option>Laboratorio</option>
          <option>Otro</option>
        </select>
      </label>
      
      <label className="text-sm font-medium text-slate-700 md:col-span-2">
        Cuéntanos tu contexto
        <textarea 
          rows={4} 
          required
          placeholder="¿Cuántos pacientes atiendes al mes?" 
          value={formData.context}
          onChange={(e) => setFormData(p => ({ ...p, context: e.target.value }))}
          className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition resize-none" 
        />
      </label>

      {status === "error" && (
        <div className="md:col-span-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.
        </div>
      )}

      <div className="md:col-span-2 flex items-center justify-between flex-wrap gap-4 pt-2">
        <p className="text-xs text-slate-400">Al enviar aceptas la Política de Privacidad de Leucode.IA.</p>
        <button 
          type="submit" 
          disabled={status === "loading"}
          className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white font-bold hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-70 disabled:pointer-events-none"
        >
          {status === "loading" ? "Enviando..." : <><Send className="w-4 h-4" /> Enviar</>}
        </button>
      </div>
    </form>
  );
}
