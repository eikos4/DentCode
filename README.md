# Dentcode

Plataforma para dentistas freelance en **Chile**: agenda, fichas de pacientes, odontograma y recordatorios por **WhatsApp**.

## Stack

- Next.js 14 (App Router) + TypeScript
- Prisma ORM + PostgreSQL
- Tailwind CSS
- Zod para validación
- JWT para autenticación
- WhatsApp Cloud API (Meta)

## Setup rápido (Windows)

### Requisitos
- PostgreSQL instalado localmente o Docker
- Node.js 18+

### 1. Preparar base de datos

```powershell
# Con Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15

# O instala PostgreSQL nativo y crea la BD:
createdb dentcode
```

### 2. Instalar y configurar

```powershell
npm install
copy .env.example .env
# Edita .env con tu DATABASE_URL
npx prisma db push
npm run db:seed
npm run dev
```

Abre http://localhost:3000

### Usuarios demo

| Portal | Email | Password |
|--------|-------|----------|
| Dentista | `demo@dentcode.cl` | `demo123` |
| Clínica Admin | `admin@clinicademo.cl` | `demo123` |
| Clínica Staff | `staff@clinicademo.cl` | `demo123` |
| Laboratorio | `lab@radiologicadental.cl` | `lab123` |

## Módulos incluidos (MVP)

- **Dashboard** `/dashboard`: KPIs y citas de hoy.
- **Agenda** `/agenda`: vista semanal, crear cita, cambiar estado, reenviar WhatsApp.
- **Pacientes** `/pacientes`: listado, búsqueda, nueva ficha, detalle con historial.
- **Odontograma** por paciente (FDI, 32 dientes adultos).
- **Mensajes** `/mensajes`: log de WhatsApp (entrantes/salientes).
- **Configuración** `/configuracion`: perfil y estado de WhatsApp.

## WhatsApp

- Sin credenciales: los mensajes se registran como `simulated` (funciona en dev sin Meta).
- Con credenciales: define en `.env`:
  - `WHATSAPP_TOKEN`
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_VERIFY_TOKEN`
- Webhook: `POST /api/whatsapp/webhook` (GET para verificación Meta).
- Reglas de confirmación: responder **SI** confirma, **NO** cancela la próxima cita.

## Roadmap (próximos pasos)

- Autenticación real (Auth.js o Clerk) y multi-tenant.
- Reserva online pública por slug (`/r/dra-rojas`).
- Planes de tratamiento y cobros (Mercado Pago Chile).
- Facturación electrónica SII.
- Recordatorios programados (cron 24h / 2h antes) con BullMQ o cron de Vercel.
- Adjuntos (radiografías) en S3/R2.
- Facturación SaaS con Stripe.
- PWA instalable.

## Despliegue en Render (Producción)

### 1. Preparar PostgreSQL local (desarrollo)

Instala PostgreSQL localmente o usa Docker:

```bash
# Docker
docker run -d --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15

# Crear base de datos
createdb dentcode
```

Actualiza tu `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dentcode"
```

### 2. Configurar en Render

#### Crear Blueprint (render.yaml ya incluido)

1. En Render Dashboard, clic **"New +"** → **"Blueprint"**
2. Conecta tu repo de GitHub
3. Render creará automáticamente:
   - **Web Service** (Next.js)
   - **PostgreSQL Database**

#### Variables de entorno necesarias en Render:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | Auto-generado por Render | Conexión a PostgreSQL |
| `JWT_SECRET` | Generar valor seguro | Clave para tokens de auth |
| `NODE_ENV` | `production` | Modo producción |

### 3. Comandos de build/start

Render usará automáticamente:
- **Build**: `npm install && npm run build`
- **Start**: `npm start`
- **Migrations**: Automáticas vía `postinstall` script

### 4. Post-despliegue

1. Accede a la shell de tu servicio en Render Dashboard
2. Ejecuta seed (solo primera vez):
   ```bash
   npm run db:seed
   ```

### Health Check

Verifica el estado en: `https://tu-app.onrender.com/api/health`

---

## Cambiar a Postgres (Legacy)

El proyecto ahora usa PostgreSQL por defecto. La configuración SQLite ya no es soportada.
