import { NextResponse } from "next/server";
import { getBalance } from "@/lib/banking/tools";

export async function GET() {
  try {
    const data = await getBalance();
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERROR /api/balance:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el saldo." },
      { status: 500 }
    );
  }
}