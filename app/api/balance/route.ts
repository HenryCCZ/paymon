import { NextResponse } from "next/server";
import { getBalance } from "@/lib/banking/tools";

export async function GET() {
  const data = await getBalance();
  return NextResponse.json(data);
}