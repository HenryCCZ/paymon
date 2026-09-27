import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateKeypair, fundTestnetAccount } from "@/lib/stellar/wallet";
import { encryptSecret } from "@/lib/stellar/crypto";

const DEMO_USER_ID = "demo-user-001"; 

export async function POST() {
  try {
    const existing = await prisma.wallet.findUnique({ where: { userId: DEMO_USER_ID } });
    if (existing) {
      return NextResponse.json({ publicKey: existing.publicKey });
    }

    const { publicKey, secretKey } = generateKeypair();
    await fundTestnetAccount(publicKey);

    const wallet = await prisma.wallet.create({
      data: { userId: DEMO_USER_ID, publicKey, encryptedSecret: encryptSecret(secretKey) },
    });

    return NextResponse.json({ publicKey: wallet.publicKey });
  } catch (error) {
    console.error("ERROR wallet/create:", error);
    return NextResponse.json({ error: "No se pudo crear la wallet." }, { status: 500 });
  }
}