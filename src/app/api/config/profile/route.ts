import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

const schema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  specialty: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  slug: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  
  // Public Profile fields
  bioPublic: z.string().optional().nullable(),
  experience: z.string().optional().nullable(),
  languages: z.array(z.string()).optional(),
  paymentMethods: z.array(z.string()).optional(),
  insuranceProviders: z.array(z.string()).optional(),
  education: z.array(z.string()).optional(),
  acceptsInsurance: z.boolean().optional(),
  emergencyCare: z.boolean().optional(),
  facebookUrl: z.string().optional().nullable(),
  instagramUrl: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const dentist = await prisma.dentist.findUnique({
      where: { id: user.dentistId },
      include: { publicProfile: true },
    });
    return NextResponse.json(dentist);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.dentistId) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    
    const json = await req.json();
    const data = schema.parse(json);

    // Actualizar dentista y perfil público en una sola transacción
    const dentist = await prisma.dentist.update({
      where: { id: user.dentistId },
      data: {
        ...(data.fullName ? { fullName: data.fullName } : {}),
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
        ...(data.specialty !== undefined ? { specialty: data.specialty } : {}),
        ...(data.photoUrl !== undefined ? { photoUrl: data.photoUrl } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.isPublished !== undefined ? { isPublished: data.isPublished } : {}),
        
        publicProfile: {
          upsert: {
            create: {
              bioPublic: data.bioPublic,
              experience: data.experience,
              languages: data.languages ? JSON.stringify(data.languages) : JSON.stringify(["Español"]),
              paymentMethods: data.paymentMethods ? JSON.stringify(data.paymentMethods) : JSON.stringify([]),
              insuranceProviders: data.insuranceProviders ? JSON.stringify(data.insuranceProviders) : JSON.stringify([]),
              education: data.education ? JSON.stringify(data.education) : JSON.stringify([]),
              acceptsInsurance: data.acceptsInsurance ?? false,
              emergencyCare: data.emergencyCare ?? false,
              facebookUrl: data.facebookUrl,
              instagramUrl: data.instagramUrl,
            },
            update: {
              ...(data.bioPublic !== undefined ? { bioPublic: data.bioPublic } : {}),
              ...(data.experience !== undefined ? { experience: data.experience } : {}),
              ...(data.languages !== undefined ? { languages: JSON.stringify(data.languages) } : {}),
              ...(data.paymentMethods !== undefined ? { paymentMethods: JSON.stringify(data.paymentMethods) } : {}),
              ...(data.insuranceProviders !== undefined ? { insuranceProviders: JSON.stringify(data.insuranceProviders) } : {}),
              ...(data.education !== undefined ? { education: JSON.stringify(data.education) } : {}),
              ...(data.acceptsInsurance !== undefined ? { acceptsInsurance: data.acceptsInsurance } : {}),
              ...(data.emergencyCare !== undefined ? { emergencyCare: data.emergencyCare } : {}),
              ...(data.facebookUrl !== undefined ? { facebookUrl: data.facebookUrl } : {}),
              ...(data.instagramUrl !== undefined ? { instagramUrl: data.instagramUrl } : {}),
            }
          }
        }
      },
      include: { publicProfile: true }
    });
    
    return NextResponse.json(dentist);
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}


