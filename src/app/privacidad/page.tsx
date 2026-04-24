import Link from "next/link";
import { ArrowLeft, Shield, FileText, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad — DentCode",
  description: "Política de privacidad de DentCode, parte del ecosistema Leucode.IA.",
};

const TOC = [
  "Responsable del tratamiento",
  "Alcance y a quién aplica",
  "Datos que recopilamos",
  "Finalidades del tratamiento",
  "Base legal y consentimiento",
  "Rol de las clínicas",
  "Pacientes: tus derechos",
  "Uso de inteligencia artificial",
  "Terceros y subencargados",
  "Seguridad de la información",
  "Plazos de conservación",
  "Transferencias internacionales",
  "Menores de edad",
  "Cookies",
  "Notificación de brechas",
  "Cambios a esta política",
  "Contacto y derechos",
];

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 glass bg-white/80 border-b border-slate-200/60">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 hover:text-blue-600 transition">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 grid place-items-center text-white font-bold shadow-sm">D</div>
            <span className="font-bold tracking-tight">DentCode</span>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1 text-sm">
              <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-medium">Privacidad</span>
              <Link href="/terminos" className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition">Términos</Link>
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
          <div className="absolute top-[-30%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-sky-500/15 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-400/20 grid place-items-center">
              <Shield className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">Política de Privacidad</h1>
              <p className="text-slate-400 mt-1">Última actualización: Abril 2026 · Ecosistema Leucode.IA</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/terminos" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition">
              <FileText className="w-3.5 h-3.5" /> Términos de Servicio
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
            <nav className="space-y-1 text-sm border-l border-slate-200 pl-3">
              {TOC.map((item, i) => (
                <a key={i} href={`#s${i + 1}`} className="block py-1 text-slate-500 hover:text-blue-600 transition truncate">
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

          <h2 id="s1">1. Responsable del tratamiento</h2>
          <p>
            Leucode.IA (en adelante, &ldquo;Leucode&rdquo;, &ldquo;nosotros&rdquo; o &ldquo;la Plataforma&rdquo;) es responsable del tratamiento de los datos personales descritos en esta política, con domicilio en Santiago de Chile y contacto en <a href="mailto:contacto@leucode.ia" className="text-blue-600 hover:underline">contacto@leucode.ia</a>.
          </p>

          <h2 id="s2">2. Alcance y a quién aplica</h2>
          <p>Esta política aplica a dos grupos de titulares:</p>
          <ul>
            <li><strong>Pacientes:</strong> personas que reciben atención clínica gestionada a través de Leucode.IA por parte de una clínica o profesional que utiliza la plataforma.</li>
            <li><strong>Clínicas y usuarios profesionales:</strong> centros médicos, hospitales, profesionales de la salud y personal administrativo que operan la plataforma para atender a sus pacientes.</li>
          </ul>
          <p>También cubre a visitantes del sitio web público que completan formularios de contacto o postulación al programa piloto.</p>

          <h2 id="s3">3. Datos que recopilamos</h2>

          <h3>3.1 De pacientes</h3>
          <ul>
            <li><strong>Identificación:</strong> nombre, RUT o identificador nacional, fecha de nacimiento, sexo, contacto (correo, teléfono).</li>
            <li><strong>Datos clínicos (sensibles):</strong> historial médico, diagnósticos, recetas, exámenes, imágenes médicas, alergias, antecedentes, evoluciones, notas del profesional, consentimientos informados.</li>
            <li><strong>Datos de atención:</strong> agendamientos, teleconsultas, videollamadas, mensajería con el profesional, datos de facturación o pago cuando aplique.</li>
            <li><strong>Datos técnicos:</strong> dirección IP, dispositivo, navegador, logs de acceso y auditoría.</li>
          </ul>

          <h3>3.2 De clínicas y usuarios profesionales</h3>
          <ul>
            <li><strong>Datos de la institución:</strong> razón social, RUT, dirección, especialidades, prestadores asociados.</li>
            <li><strong>Datos de usuarios:</strong> nombre, correo, rol (médico, enfermería, admisión, administración), credenciales cifradas.</li>
            <li><strong>Datos operacionales:</strong> agendas, configuraciones, integraciones habilitadas, métricas de uso.</li>
            <li><strong>Datos de auditoría:</strong> registros de acceso a fichas, acciones realizadas, IP, timestamp.</li>
          </ul>

          <h3>3.3 Del sitio web público</h3>
          <ul>
            <li>Datos del formulario de contacto: nombre, correo, teléfono, empresa, mensaje.</li>
            <li>Datos analíticos agregados y cookies (ver sección 14).</li>
          </ul>

          <h2 id="s4">4. Finalidades del tratamiento</h2>
          <ul>
            <li>Prestar el servicio de gestión clínica, telemedicina, historial clínico electrónico y asistencia con IA médica.</li>
            <li>Permitir a la clínica administrar agendamientos, atenciones, prescripciones y comunicaciones con sus pacientes.</li>
            <li>Emitir documentos clínicos (recetas, órdenes, informes) y facturar cuando corresponda.</li>
            <li>Proveer soporte técnico y mantener la continuidad operacional.</li>
            <li>Garantizar la seguridad, prevenir fraudes y cumplir obligaciones legales.</li>
            <li>Mejorar la plataforma mediante métricas agregadas y, cuando exista base legal o consentimiento, mediante datos disociados.</li>
          </ul>

          <h2 id="s5">5. Base legal y consentimiento</h2>
          <p>Tratamos datos personales bajo las siguientes bases, conforme a la Ley 19.628 sobre Protección de la Vida Privada (Chile):</p>
          <ul>
            <li>Consentimiento del paciente o titular, especialmente para datos sensibles de salud.</li>
            <li>Ejecución de un contrato entre la clínica y Leucode, y entre la clínica y el paciente.</li>
            <li>Cumplimiento de obligaciones legales sanitarias, tributarias y de conservación de fichas clínicas.</li>
            <li>Interés legítimo para seguridad, prevención de fraude y mejora de la plataforma, siempre ponderado con los derechos del titular.</li>
          </ul>

          <h2 id="s6">6. Rol de las clínicas: responsable y encargado</h2>
          <p>Respecto de los datos clínicos de los pacientes, la clínica actúa como responsable del tratamiento, y Leucode.IA actúa como encargado (proveedor tecnológico) que procesa los datos siguiendo las instrucciones de la clínica y las condiciones del contrato de servicio.</p>
          <p>Respecto de los datos de los usuarios profesionales que operan la plataforma, así como de los visitantes del sitio web, Leucode.IA actúa como responsable.</p>

          <h2 id="s7">7. Pacientes: tus derechos</h2>
          <p>Como paciente, puedes ejercer en cualquier momento los siguientes derechos (conocidos como derechos ARCO+):</p>
          <ul>
            <li><strong>Acceso:</strong> conocer qué datos tuyos tratamos y cómo.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o desactualizados.</li>
            <li><strong>Cancelación / Supresión:</strong> solicitar la eliminación cuando proceda legalmente.</li>
            <li><strong>Oposición:</strong> oponerte a ciertos tratamientos por motivos fundados.</li>
            <li><strong>Portabilidad:</strong> obtener una copia de tus datos en formato legible y estructurado.</li>
            <li><strong>Revocar consentimiento:</strong> retirar el consentimiento previamente otorgado.</li>
          </ul>
          <p>Como la clínica es responsable de tu ficha clínica, te recomendamos dirigir primero la solicitud a tu centro médico. Leucode colaborará con la clínica para atender tu petición en los plazos legales.</p>

          <h2 id="s8">8. Uso de inteligencia artificial</h2>
          <p>Leucode.IA incorpora modelos de inteligencia artificial para asistir al profesional de salud (por ejemplo: transcripción de consulta, resúmenes clínicos, sugerencias documentales, apoyo diagnóstico). Estas funciones son de apoyo y no sustituyen el juicio clínico del profesional tratante.</p>
          <ul>
            <li>Los modelos operan bajo cifrado y aislamiento por tenant (clínica).</li>
            <li>No utilizamos los datos clínicos identificables para entrenar modelos de terceros.</li>
            <li>Cuando se realicen mejoras del producto con datos, se hará con información disociada o anonimizada, o bajo consentimiento específico.</li>
            <li>Se registra auditoría de las acciones realizadas con apoyo de IA.</li>
          </ul>

          <h2 id="s9">9. Terceros y subencargados</h2>
          <p>Para prestar el servicio, utilizamos proveedores tecnológicos bajo acuerdos de confidencialidad y tratamiento de datos, tales como:</p>
          <ul>
            <li>Infraestructura de nube y bases de datos.</li>
            <li>Servicios de comunicación (correo transaccional, SMS, videollamada).</li>
            <li>Servicios de pago y facturación cuando correspondan.</li>
            <li>Proveedores de modelos de IA, bajo condiciones de no-retención y no-entrenamiento con datos del cliente.</li>
          </ul>
          <p>La lista actualizada de subencargados puede ser solicitada por la clínica al correo de contacto.</p>

          <h2 id="s10">10. Seguridad de la información</h2>
          <ul>
            <li>Cifrado en tránsito (TLS 1.2+) y en reposo (AES-256).</li>
            <li>Control de acceso por rol y principio de mínimo privilegio.</li>
            <li>Autenticación robusta, con soporte para segundo factor.</li>
            <li>Registros de auditoría inmutables de accesos y modificaciones a fichas clínicas.</li>
            <li>Copias de respaldo cifradas y plan de continuidad operacional.</li>
            <li>Pruebas de seguridad y revisiones periódicas del código.</li>
          </ul>

          <h2 id="s11">11. Plazos de conservación</h2>
          <p>La ficha clínica se conserva durante los plazos que establece la normativa sanitaria chilena aplicable a prestadores de salud. Los datos administrativos y de contacto se conservan mientras exista relación con la clínica o el usuario, y luego por los plazos legales de prescripción.</p>
          <p>Si finaliza el contrato con la clínica, Leucode devolverá o eliminará los datos de forma segura conforme a lo pactado.</p>

          <h2 id="s12">12. Transferencias internacionales</h2>
          <p>Algunos proveedores de infraestructura pueden operar desde fuera de Chile. En tales casos, aplicamos salvaguardas contractuales y técnicas para mantener un nivel de protección equivalente al exigido por la ley chilena.</p>

          <h2 id="s13">13. Menores de edad</h2>
          <p>La atención de pacientes menores se realiza a través de su madre, padre o representante legal, quien otorga el consentimiento correspondiente. La clínica es responsable de validar dicha representación.</p>

          <h2 id="s14">14. Cookies y tecnologías similares</h2>
          <p>En el sitio web público usamos cookies estrictamente necesarias (sesión, seguridad) y, opcionalmente, cookies analíticas agregadas. Puedes configurar tu navegador para rechazarlas. Dentro de la aplicación clínica, usamos únicamente cookies necesarias para el funcionamiento y la seguridad de la sesión.</p>

          <h2 id="s15">15. Notificación de brechas</h2>
          <p>Ante un incidente de seguridad que afecte datos personales, notificaremos a la clínica sin demora injustificada, entregando la información disponible para que pueda cumplir con sus obligaciones frente a los pacientes y autoridades competentes.</p>

          <h2 id="s16">16. Cambios a esta política</h2>
          <p>Podemos actualizar esta política para reflejar cambios legales, técnicos o de negocio. Publicaremos la nueva versión en esta misma URL, indicando la fecha de última actualización. Si los cambios son sustanciales, se informará por los canales habituales.</p>

          <h2 id="s17">17. Contacto y ejercicio de derechos</h2>
          <p>Para consultas sobre privacidad o ejercer tus derechos, escríbenos a:</p>
          <p><a href="mailto:contacto@leucode.ia" className="text-blue-600 hover:underline font-medium">contacto@leucode.ia</a></p>
          <p className="text-sm text-slate-500">Asunto sugerido: &ldquo;Protección de datos — [Acceso / Rectificación / Eliminación / Otro]&rdquo;</p>

          <hr className="my-10" />
          <p className="text-sm text-slate-400">
            Esta política es meramente informativa y no reemplaza los contratos específicos firmados entre Leucode.IA y cada clínica, ni los consentimientos informados otorgados por los pacientes ante su prestador de salud.
          </p>
          <p className="text-sm text-slate-400">© 2026 Leucode.IA · Todos los derechos reservados.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
