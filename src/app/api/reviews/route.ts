import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dentistId = searchParams.get("dentistId");
    const reviews = await prisma.review.findMany({
      where: {
        published: true,
        ...(dentistId ? { dentistId } : {}),
      },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
