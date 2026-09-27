import { NextResponse } from "next/server";
import { getBalance } from "@/lib/banking/tools";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "Falta identificar la sesión del usuario." },
        { status: 400 }
      );
    }

    const data = await getBalance(userId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("ERROR /api/balance:", error);
    return NextResponse.json(
      { error: "No se pudo consultar el saldo." },
      { status: 500 }
    );
  }
}