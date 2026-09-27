import { NextResponse } from "next/server";
import { getOrCreateUserByWallet } from "@/lib/auth/session";

export async function POST(request: Request) {
  const { walletAddress } = await request.json();

  if (typeof walletAddress !== "string" || !walletAddress) {
    return NextResponse.json({ error: "Dirección de wallet inválida." }, { status: 400 });
  }

  const user = await getOrCreateUserByWallet(walletAddress);
  return NextResponse.json({ userId: user.id });
}
