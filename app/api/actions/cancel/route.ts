import { ActionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const { actionId } = await request.json();

  if (typeof actionId !== "string" || !actionId) {
    return NextResponse.json(
      { error: "Acción no válida o ya procesada." },
      { status: 400 }
    );
  }

  const action = await prisma.aiAction.findUnique({ where: { id: actionId } });

  if (!action || action.status !== ActionStatus.PENDING_CONFIRMATION) {
    return NextResponse.json(
      { error: "Acción no válida o ya procesada." },
      { status: 400 }
    );
  }

  await prisma.aiAction.update({
    where: { id: action.id },
    data: { status: ActionStatus.CANCELLED },
  });

  return NextResponse.json({ success: true });
}