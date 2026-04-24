import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Clock, Server, Brain, BarChart3, AlertTriangle, Bug, Mail } from "lucide-react";

export const metadata = {
  title: "Seguridad y Soporte — DentCode",
  description: "Seguridad, cumplimiento y soporte de DentCode, parte del ecosistema Leucode.IA.",
};

export default function SoportePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold shadow-sm">D</div>
            <span className="font-semibold tracking-tight">DentCode</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 grid place-items-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Seguridad y Cumplimiento</h1>
            <p className="text-sm text-slate-500 mt-1">Última actualización: Abril 2026</p>
          </div>
        </div>

        <p className="text-slate-600 text-lg leading-relaxed mb-12">
          Cinco dominios donde aplicamos controles técnicos, organizativos y contractuales para proteger los datos de tu consulta.
        </p>

        {/* Pillars grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              icon: Lock,
              title: "Cifrado extremo a extremo",
              desc: "Datos protegidos en tránsito y en reposo, sin excepciones.",
              items: ["TLS 1.2+ en todas las conexiones", "AES-256 para datos en reposo", "Gestión de llaves con rotación automática", "Hashing robusto de credenciales (bcrypt/argon2)"],
            },
            {
              icon: ShieldCheck,
              title: "Control de accesos",
              desc: "Cada usuario ve solo lo que necesita para su rol.",
              items: ["RBAC: roles por médico, admisión, admin", "Segundo factor (2FA) disponible", "Aislamiento por tenant (multi-clínica)", "Principio de mínimo privilegio"],
            },
            {
              icon: BarChart3,
              title: "Auditoría inmutable",
              desc: "Todo acceso a ficha clínica queda registrado.",
              items: ["Logs de acceso, edición y exportación", "Registros con timestamp, IP y usuario", "Retención prolongada e integridad verificable", "Visibilidad para compliance de la clínica"],
            },
            {
              icon: Server,
              title: "Infraestructura resiliente",
              desc: "Cloud de clase mundial con redundancia geográfica.",
              items: ["Proveedores certificados (ISO 27001 / SOC 2)", "Respaldos cifrados y probados periódicamente", "Redes privadas, firewall y WAF", "Monitoreo 24/7 de infraestructura"],
            },
            {
              icon: Brain,
              title: "IA responsable",
              desc: "IA como copiloto del profesional, nunca sustituto.",
              items: ["No entrenamos modelos con datos identificables", "Proveedores con cláusulas de no retención", "Auditoría específica de acciones de IA", "El profesional valida siempre la salida clínica"],
            },
            {
              icon: Clock,
              title: "Continuidad operacional",
              desc: "Porque una clínica no puede detenerse.",
              items: ["Objetivo RPO ≤ 1h · RTO ≤ 4h", "Plan de recuperación ante desastres (DRP)", "Escalamiento y guardia de incidentes", "Ventanas de mantención notificadas"],
            },
          ].map(({ icon: Icon, title, desc, items }) => (
            <div key={title} className="p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 grid place-items-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg">{title}</h3>
              <p className="text-sm text-slate-600 mt-1 mb-3">{desc}</p>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item} className="text-sm text-slate-500 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-400 mt-2 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Security lifecycle */}
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6">
          <h2>Seguridad en el ciclo de vida</h2>
          <p>La seguridad no se agrega al final: se diseña desde la primera línea de código.</p>

          <div className="grid md:grid-cols-2 gap-4 not-prose mt-6 mb-10">
            {[
              { title: "Diseño", desc: "Modelado de amenazas, revisiones de arquitectura, privacidad por diseño desde el kickoff." },
              { title: "Desarrollo", desc: "Revisión de código obligatoria, linters de seguridad, gestión de secretos, dependencias auditadas." },
              { title: "Pruebas", desc: "SAST, DAST y pruebas automatizadas en cada despliegue. Pentests periódicos planificados." },
              { title: "Operación", desc: "Monitoreo continuo, alertas de anomalías, parcheo oportuno y gestión de vulnerabilidades." },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <h4 className="font-bold text-sm text-slate-900 mb-1">{title}</h4>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>

          <h2>Gestión de incidentes</h2>
          <p>Un plan documentado, probado y comunicado con nuestras clínicas.</p>
          <ul>
            <li>Detección y triage 24/7</li>
            <li>Notificación a la clínica sin demora injustificada</li>
            <li>Análisis de causa raíz (RCA) documentado</li>
            <li>Lecciones aprendidas y mejora continua</li>
          </ul>
          <p>
            <a href="mailto:security@leucode.ia" className="text-blue-600 hover:underline font-medium flex items-center gap-1.5 not-prose">
              <AlertTriangle className="w-4 h-4" /> Reportar incidente a security@leucode.ia
            </a>
          </p>

          <h2>Divulgación responsable</h2>
          <p>Si eres investigador de seguridad y encontraste una vulnerabilidad, queremos saberlo.</p>
          <ul>
            <li>Reporta a <a href="mailto:security@leucode.ia" className="text-blue-600 hover:underline">security@leucode.ia</a> con detalle reproducible</li>
            <li>No explotes ni accedas a datos de terceros</li>
            <li>Te responderemos en 72 horas hábiles</li>
            <li>Reconocimiento público opcional tras la mitigación</li>
          </ul>

          <h2>Subencargados de confianza</h2>
          <p>Trabajamos con proveedores líderes bajo acuerdos de tratamiento de datos y cláusulas de confidencialidad.</p>
          <div className="grid md:grid-cols-2 gap-4 not-prose mt-6 mb-10">
            {[
              { title: "Cloud e infraestructura", desc: "Proveedores certificados ISO 27001 / SOC 2 con presencia regional LATAM." },
              { title: "Bases de datos gestionadas", desc: "Cifrado en reposo, respaldos automáticos y alta disponibilidad." },
              { title: "Comunicaciones", desc: "Correo transaccional, SMS y videollamada con proveedores especializados." },
              { title: "Modelos de IA", desc: "Cláusulas de no retención y no entrenamiento con datos del cliente." },
              { title: "Pagos", desc: "Pasarelas certificadas PCI-DSS cuando aplica facturación a pacientes." },
              { title: "Observabilidad", desc: "Monitoreo, métricas y logs agregados sin datos clínicos identificables." },
            ].map(({ title, desc }) => (
              <div key={title} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <h4 className="font-bold text-sm text-slate-900 mb-1">{title}</h4>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            ))}
          </div>

          <hr className="my-10" />

          <div className="not-prose p-6 rounded-2xl border border-blue-100 bg-blue-50/50">
            <h3 className="font-bold text-lg text-slate-900 mb-2">¿Necesitas documentación adicional?</h3>
            <p className="text-sm text-slate-600 mb-4">
              Entregamos a clínicas contratantes: DPA, lista de subencargados, políticas de seguridad, matriz de controles y cuestionarios de due diligence (CAIQ).
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:contacto@leucode.ia?subject=Solicitud%20de%20documentaci%C3%B3n%20de%20seguridad"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition"
              >
                <Mail className="w-4 h-4" /> Solicitar documentación
              </a>
              <a
                href="mailto:security@leucode.ia"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Bug className="w-4 h-4" /> security@leucode.ia
              </a>
            </div>
          </div>

          <p className="text-sm text-slate-400 mt-10">© 2026 Leucode.IA · Todos los derechos reservados.</p>
        </div>
      </main>
    </div>
  );
}
