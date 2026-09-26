import { ActionStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CryptoTransactionArguments = {
  toAddress: string;
  amount: number;
  token: string;
  network: string;
};

export async function POST(request: Request) {
  const { actionId, txHash } = await request.json();
  if (typeof actionId !== "string" || typeof txHash !== "string") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const action = await prisma.aiAction.findUnique({ where: { id: actionId } });
  if (
    !action ||
    action.action !== "create_crypto_transaction" ||
    action.status !== ActionStatus.PENDING_CONFIRMATION
  ) {
    return NextResponse.json({ error: "Acción no válida o ya procesada." }, { status: 400 });
  }

  const args = action.arguments as unknown as CryptoTransactionArguments;

  const cryptoTx = await prisma.cryptoTransaction.create({
    data: {
      userId: action.userId,
      actionId: action.id,
      toAddress: args.toAddress,
      amount: args.amount,
      token: args.token,
      network: args.network,
      txHash,
      status: ActionStatus.COMPLETED,
    },
  });

  await prisma.aiAction.update({
    where: { id: action.id },
    data: {
      status: ActionStatus.COMPLETED,
      confirmedAt: new Date(),
      result: { txHash, cryptoTxId: cryptoTx.id },
    },
  });

  return NextResponse.json({ success: true, txHash });
}