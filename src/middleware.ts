import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/login-clinica",
  "/login-laboratorio",
  "/registro",
  "/registro-clinica",
  "/registro/exito",
  "/buscar",
  "/perfil",
  "/api/auth/login",
  "/api/auth/clinic-login",
  "/api/auth/lab-login",
  "/api/auth/clinic-register",
  "/api/auth/register",
  "/api/dentists/register",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Determine path type and login URL
  const isClinicPath = pathname.startsWith("/clinic");
  const isLabPath = pathname.startsWith("/laboratorio");
  const isApiLabPath = pathname.startsWith("/api/lab");
  const loginPath = isClinicPath ? "/login-clinica" : isLabPath ? "/login-laboratorio" : "/login";

  // Check for auth token
  const token = req.cookies.get("auth-token")?.value;
  const labToken = req.cookies.get("lab_token")?.value;

  // Rutas de laboratorio requieren token específico
  if (isLabPath || isApiLabPath) {
    if (!labToken) {
      const loginUrl = new URL("/login-laboratorio", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = jwt.verify(labToken, JWT_SECRET) as { role?: string };
      if (decoded.role !== "LABORATORY") {
        throw new Error("Rol inválido");
      }
      return NextResponse.next();
    } catch {
      const loginUrl = new URL("/login-laboratorio", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Rutas normales (no lab)
  if (!token) {
    const loginUrl = new URL(loginPath, req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };

    // CLINIC_ADMIN / CLINIC_STAFF solo pueden acceder a rutas /clinic
    if ((decoded.role === "CLINIC_ADMIN" || decoded.role === "CLINIC_STAFF") && !isClinicPath) {
      return NextResponse.redirect(new URL("/clinic", req.url));
    }

    // Dentistas no pueden acceder a rutas /clinic
    if (decoded.role === "DENTIST" && isClinicPath) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Token inválido
    const loginUrl = new URL(loginPath, req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
