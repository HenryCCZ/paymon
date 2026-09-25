import { NextResponse } from "next/server";
import { askPaymon } from "@/lib/ai/agent";

export async function POST(request: Request) {
  try {
    const { mensaje } = await request.json();

    if (!mensaje) {
      return NextResponse.json(
        { error: "No se recibió ningún mensaje." },
        { status: 400 }
      );
    }

    const respuesta = await askPaymon(mensaje);

    return NextResponse.json({
      respuesta,
    });

  } catch (error) {
  console.error("ERROR DE PAYMON:", error);

  return NextResponse.json(
    {
      error: "Ocurrió un error al comunicarse con Paymon.",
    },
    { status: 500 }
  );

  }
}