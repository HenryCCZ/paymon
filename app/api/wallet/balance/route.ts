import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getBalance } from "@/lib/stellar/wallet";

const DEMO_USER_ID = "demo-user-001";

export async function GET() {
  try {
    const wallet = await prisma.wallet.findUnique({ where: { userId: DEMO_USER_ID } });
    if (!wallet) {
      return NextResponse.json({ error: "El usuario no tiene wallet todavía." }, { status: 404 });
    }
    const balances = await getBalance(wallet.publicKey);
    return NextResponse.json({ publicKey: wallet.publicKey, balances });
  } catch (error) {
    console.error("ERROR wallet/balance:", error);
    return NextResponse.json({ error: "No se pudo consultar el saldo." }, { status: 500 });
  }
}