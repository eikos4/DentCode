import Link from "next/link";
import { ArrowLeft, FileText, Shield, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Términos de Servicio — DentCode",
  description: "Términos de servicio de DentCode, parte del ecosistema Leucode.IA.",
};

const TOC = [
  "Aceptación de los términos",
  "Definiciones",
  "Descripción del servicio",
  "Elegibilidad y registro",
  "Cuentas y credenciales",
  "Roles",
  "Uso aceptable",
  "Asistencia con IA",
  "Telemedicina",
  "Datos clínicos y privacidad",
  "Propiedad intelectual",
  "Planes, precios y pagos",
  "Programa piloto",
  "Disponibilidad y soporte",
  "Garantías y limitaciones",
  "Limitación de responsabilidad",
  "Indemnidad",
  "Suspensión y terminación",
  "Modificaciones",
  "Ley aplicable",
  "Contacto",
];

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 glass bg-white/80 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold shadow-sm">D</div>
            <span className="font-bold tracking-tight">DentCode</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <Link href="/privacidad" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">Privacidad</Link>
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium">Términos</span>
              <Link href="/soporte" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">Seguridad</Link>
            </nav>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 grid place-items-center">
              <FileText className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Términos de Servicio</h1>
              <p className="text-slate-400 mt-1">Última actualización: Abril 2026 · Ecosistema Leucode.IA</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/privacidad" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition">
              <Shield className="w-3.5 h-3.5" /> Política de Privacidad
            </Link>
            <Link href="/soporte" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition">
              <ShieldCheck className="w-3.5 h-3.5" /> Seguridad
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-12 flex gap-12">
        {/* Sidebar TOC */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contenido</p>
            <nav className="space-y-1 text-sm border-l border-slate-200 pl-3 max-h-[70vh] overflow-y-auto">
              {TOC.map((item, i) => (
                <a key={i} href={`#t${i + 1}`} className="block py-1 text-slate-500 hover:text-blue-600 transition truncate">
                  {i + 1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="p-8 md:p-10 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:scroll-mt-24 prose-h3:text-lg prose-h3:mt-6 prose-li:my-1">

          <h2 id="t1">1. Aceptación de los términos</h2>
          <p>Al acceder o utilizar la plataforma Leucode.IA (el &ldquo;Servicio&rdquo;), ya sea como clínica, profesional, paciente o visitante, aceptas quedar vinculado por estos Términos de Servicio (los &ldquo;Términos&rdquo;) y por nuestra <Link href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>. Si no estás de acuerdo, no utilices el Servicio.</p>
          <p>Las clínicas podrán suscribir adicionalmente un Contrato de Prestación de Servicios y un Acuerdo de Tratamiento de Datos (DPA), que prevalecerán sobre estos Términos en caso de discrepancia.</p>

          <h2 id="t2">2. Definiciones</h2>
          <ul>
            <li><strong>Leucode / Nosotros:</strong> Leucode.IA, titular y operador del Servicio.</li>
            <li><strong>Clínica:</strong> centro médico, hospital o entidad prestadora de salud que contrata el Servicio.</li>
            <li><strong>Profesional:</strong> médico, odontólogo, psicólogo u otro profesional de la salud habilitado que opera la plataforma bajo una Clínica.</li>
            <li><strong>Paciente:</strong> persona atendida por la Clínica mediante el Servicio.</li>
            <li><strong>Usuario:</strong> cualquier persona que utiliza la plataforma, incluidos personal administrativo y visitantes del sitio público.</li>
            <li><strong>Datos Clínicos:</strong> información de salud asociada a un Paciente identificable.</li>
            <li><strong>Contenido:</strong> datos, textos, archivos, imágenes y cualquier información cargada por un Usuario.</li>
          </ul>

          <h2 id="t3">3. Descripción del servicio</h2>
          <p>Leucode.IA es una plataforma de software como servicio (SaaS) orientada a salud digital, que puede incluir:</p>
          <ul>
            <li>Ficha clínica electrónica, agendamiento y gestión de atenciones.</li>
            <li>Telemedicina y comunicaciones entre profesional y paciente.</li>
            <li>Emisión de documentos clínicos (recetas, órdenes, informes).</li>
            <li>Herramientas de apoyo con inteligencia artificial (transcripción, resúmenes, sugerencias).</li>
            <li>Integraciones con laboratorios, farmacias, firma electrónica y sistemas de la Clínica.</li>
            <li>Paneles de gestión, indicadores y auditoría.</li>
          </ul>
          <p>Las funcionalidades disponibles dependen del plan contratado y pueden evolucionar.</p>

          <h2 id="t4">4. Elegibilidad y registro</h2>
          <ul>
            <li>Para utilizar funciones clínicas, el Profesional debe contar con título, inscripción y habilitación vigentes ante la autoridad sanitaria correspondiente.</li>
            <li>La Clínica es responsable de validar la habilitación de los Profesionales que operan bajo su organización.</li>
            <li>Los Pacientes deben ser mayores de edad o actuar a través de su representante legal.</li>
            <li>La información entregada durante el registro debe ser veraz, completa y mantenerse actualizada.</li>
          </ul>

          <h2 id="t5">5. Cuentas y credenciales</h2>
          <ul>
            <li>Cada cuenta es personal e intransferible. Está prohibido compartir credenciales.</li>
            <li>El Usuario es responsable de la confidencialidad de su contraseña y de todas las actividades realizadas con su cuenta.</li>
            <li>Debes notificar de inmediato cualquier uso no autorizado a <a href="mailto:soporte@leucode.ia" className="text-blue-600 hover:underline">soporte@leucode.ia</a>.</li>
            <li>Recomendamos activar segundo factor de autenticación cuando esté disponible.</li>
          </ul>

          <h2 id="t6">6. Roles: clínicas, profesionales y pacientes</h2>
          <h3>6.1 Clínica</h3>
          <ul>
            <li>Es responsable del acto clínico y de la ficha clínica de sus Pacientes.</li>
            <li>Actúa como responsable del tratamiento de Datos Clínicos; Leucode actúa como encargado.</li>
            <li>Gestiona los accesos de su personal y configura los permisos por rol.</li>
            <li>Obtiene y conserva los consentimientos informados que correspondan.</li>
          </ul>
          <h3>6.2 Profesional</h3>
          <ul>
            <li>Mantiene el juicio clínico sobre diagnósticos, prescripciones y decisiones terapéuticas.</li>
            <li>Debe revisar críticamente toda sugerencia generada por herramientas de IA antes de emitir cualquier documento clínico.</li>
          </ul>
          <h3>6.3 Paciente</h3>
          <ul>
            <li>Debe entregar información veraz y completa para su atención.</li>
            <li>Comprende que la plataforma es un canal de atención y no sustituye los servicios de urgencia.</li>
          </ul>

          <h2 id="t7">7. Uso aceptable</h2>
          <p>Te comprometes a no:</p>
          <ul>
            <li>Utilizar el Servicio para fines ilícitos o contrarios a la ética médica.</li>
            <li>Cargar contenido falso, difamatorio, malicioso o que vulnere derechos de terceros.</li>
            <li>Intentar acceder a datos, cuentas o sistemas sin autorización.</li>
            <li>Realizar ingeniería inversa, descompilación o extracción masiva del Servicio.</li>
            <li>Interferir con la seguridad, disponibilidad o integridad de la plataforma.</li>
            <li>Utilizar el Servicio para publicidad no solicitada a Pacientes.</li>
            <li>Reutilizar Datos Clínicos fuera de la finalidad de atención autorizada.</li>
          </ul>

          <h2 id="t8">8. Asistencia con inteligencia artificial</h2>
          <p>El Servicio puede ofrecer funciones asistidas por IA. Estas funciones son de apoyo al profesional y no constituyen un diagnóstico médico.</p>
          <ul>
            <li>El Profesional debe validar y asumir la responsabilidad de todo contenido clínico emitido.</li>
            <li>Los resultados pueden contener errores, omisiones o sesgos; se deben usar con criterio clínico.</li>
            <li>Leucode no garantiza resultados específicos derivados del uso de IA.</li>
            <li>No utilizamos Datos Clínicos identificables para entrenar modelos de terceros.</li>
          </ul>

          <h2 id="t9">9. Telemedicina y atenciones remotas</h2>
          <ul>
            <li>La telemedicina se presta por el Profesional habilitado y bajo la responsabilidad de la Clínica.</li>
            <li>La calidad de la atención remota depende de la conexión, dispositivo y condiciones del Paciente.</li>
            <li>Ante síntomas de urgencia, el Paciente debe acudir a un servicio presencial o contactar al SAMU 131.</li>
            <li>Las grabaciones, si las hubiere, se realizarán solo con consentimiento y bajo las reglas de la Clínica.</li>
          </ul>

          <h2 id="t10">10. Datos clínicos y privacidad</h2>
          <p>El tratamiento de datos personales se rige por la <Link href="/privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link> y, cuando corresponda, por el Acuerdo de Tratamiento de Datos (DPA) firmado con la Clínica.</p>

          <h2 id="t11">11. Propiedad intelectual</h2>
          <ul>
            <li>La plataforma, su código, diseño, marcas y documentación son propiedad de Leucode.IA.</li>
            <li>Se otorga al Usuario una licencia limitada, no exclusiva, revocable e intransferible para usar el Servicio conforme a estos Términos.</li>
            <li>El Contenido cargado por la Clínica y los Pacientes sigue siendo de su titularidad.</li>
          </ul>

          <h2 id="t12">12. Planes, precios y pagos</h2>
          <ul>
            <li>Los precios y plan contratado se establecerán en la orden de servicio aceptada por la Clínica.</li>
            <li>Los valores se expresarán en pesos chilenos (CLP) o UF, con los impuestos que correspondan.</li>
            <li>El no pago oportuno puede dar lugar a suspensión del Servicio, previa notificación.</li>
          </ul>

          <h2 id="t13">13. Programa piloto</h2>
          <p>El Servicio puede ofrecerse en modalidad piloto, con funcionalidades en desarrollo. Durante esta etapa podrán existir ventanas de mantención y cambios frecuentes de funcionalidades.</p>

          <h2 id="t14">14. Disponibilidad y soporte</h2>
          <p>Hacemos esfuerzos razonables para mantener el Servicio disponible 24/7. El soporte se entrega en español a <a href="mailto:soporte@leucode.ia" className="text-blue-600 hover:underline">soporte@leucode.ia</a>.</p>

          <h2 id="t15">15. Garantías y limitaciones</h2>
          <p>El Servicio se proporciona &ldquo;tal cual&rdquo; y &ldquo;según disponibilidad&rdquo;. Leucode no otorga garantías implícitas de comerciabilidad, idoneidad para un fin particular ni de ausencia de errores.</p>

          <h2 id="t16">16. Limitación de responsabilidad</h2>
          <p>La responsabilidad total de Leucode frente a la Clínica estará limitada al monto efectivamente pagado durante los 12 meses anteriores al hecho que origina la reclamación. Leucode no será responsable por daños indirectos, incidentales ni lucro cesante.</p>

          <h2 id="t17">17. Indemnidad</h2>
          <p>La Clínica y los Profesionales se obligan a mantener indemne a Leucode frente a reclamaciones de terceros derivadas de decisiones clínicas, uso indebido del Servicio o contenido que infrinja derechos de terceros.</p>

          <h2 id="t18">18. Suspensión y terminación</h2>
          <p>Podremos suspender o terminar el acceso en caso de incumplimiento. Al terminar, Leucode pondrá a disposición los datos para exportación por un plazo razonable, y luego procederá a su eliminación segura.</p>

          <h2 id="t19">19. Modificaciones a los términos</h2>
          <p>Podremos actualizar estos Términos. La versión vigente se publicará en esta misma URL indicando su fecha de actualización.</p>

          <h2 id="t20">20. Ley aplicable y jurisdicción</h2>
          <p>Estos Términos se rigen por las leyes de la República de Chile. Cualquier controversia será sometida a los tribunales ordinarios con asiento en Santiago.</p>

          <h2 id="t21">21. Contacto</h2>
          <p>Consultas legales / contractuales: <a href="mailto:contacto@leucode.ia" className="text-blue-600 hover:underline">contacto@leucode.ia</a></p>
          <p>Soporte técnico: <a href="mailto:soporte@leucode.ia" className="text-blue-600 hover:underline">soporte@leucode.ia</a></p>

          <hr className="my-10" />
          <p className="text-sm text-slate-400">
            Estos Términos de Servicio son informativos y podrán ser complementados o reemplazados por contratos específicos firmados entre Leucode.IA y cada Clínica.
          </p>
          <p className="text-sm text-slate-400">© 2026 Leucode.IA · Todos los derechos reservados.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
