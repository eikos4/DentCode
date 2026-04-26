import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// PATCH: Marcar un mensaje como leído o no leído
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { status } = await req.json();

    const updatedMessage = await prisma.contactMessage.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json({ error: "Error al actualizar mensaje" }, { status: 500 });
  }
}

// DELETE: Eliminar un mensaje
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    await prisma.contactMessage.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json({ error: "Error al eliminar mensaje" }, { status: 500 });
  }
}
