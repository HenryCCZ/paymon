import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { decryptSecret } from "@/lib/stellar/crypto";
import { sendPayment } from "@/lib/stellar/wallet";

const DEMO_USER_ID = "demo-user-001";

export async function POST(request: Request) {
  try {
    const { destination, amount } = await request.json();
    if (typeof destination !== "string" || typeof amount !== "string") {
      return NextResponse.json({ error: "destination y amount son requeridos." }, { status: 400 });
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: DEMO_USER_ID } });
    if (!wallet) {
      return NextResponse.json({ error: "El usuario no tiene wallet todavía." }, { status: 404 });
    }

    const secretKey = decryptSecret(wallet.encryptedSecret);
    const result = await sendPayment(secretKey, destination, amount);

    return NextResponse.json({ success: true, hash: result.hash });
  } catch (error) {
    console.error("ERROR wallet/send:", error);
    return NextResponse.json({ error: "No se pudo enviar el pago." }, { status: 500 });
  }
}