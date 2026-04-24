/** Utilidades para RUT chileno: limpieza, formato y validación de dígito verificador. */

export function cleanRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, "").toUpperCase();
}

/** Formatea a 12.345.678-9 */
export function formatRut(rut: string): string {
  const clean = cleanRut(rut);
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const withDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots}-${dv}`;
}

/** Calcula dígito verificador */
function computeDv(body: string): string {
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  if (res === 11) return "0";
  if (res === 10) return "K";
  return String(res);
}

/** Valida RUT chileno (7-8 dígitos + DV). */
export function isValidRut(rut: string): boolean {
  const clean = cleanRut(rut);
  if (clean.length < 8 || clean.length > 9) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return computeDv(body) === dv;
}

/** Formatea teléfono chileno: +56 9 XXXX XXXX */
export function formatPhone(value: string): string {
  let v = value.replace(/\D/g, "");
  if (v.startsWith("56")) v = v.slice(2);
  if (v.startsWith("9") && v.length <= 9) {
    const rest = v.slice(1);
    const p1 = rest.slice(0, 4);
    const p2 = rest.slice(4, 8);
    return `+56 9${p1 ? " " + p1 : ""}${p2 ? " " + p2 : ""}`;
  }
  return value;
}
