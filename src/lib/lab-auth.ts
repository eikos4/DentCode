import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

interface LabTokenPayload {
  labId: string;
  labName: string;
  role: "LABORATORY";
}

export function verifyLabToken(req: NextRequest): LabTokenPayload | null {
  try {
    const token = req.cookies.get("lab_token")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as LabTokenPayload;
    
    if (decoded.role !== "LABORATORY") {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}

export function requireLabAuth(req: NextRequest): LabTokenPayload {
  const lab = verifyLabToken(req);
  if (!lab) {
    throw new Error("No autorizado");
  }
  return lab;
}
