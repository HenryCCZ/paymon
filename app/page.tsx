"use client";

import { useState } from "react";

export default function Home() {
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState("");

  async function enviarMensaje() {
  if (!mensaje.trim()) return;

  const mensajeUsuario = mensaje;

  setMensaje("");
  setRespuesta("Pensando...");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mensaje: mensajeUsuario,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setRespuesta("Ocurrió un error.");
      return;
    }

    setRespuesta(data.respuesta);

  } catch (error) {
    setRespuesta("No pude comunicarme con Paymon.");
  }
}

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado */}
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Paymon</h1>
            <p className="text-gray-400">
              Tu agente financiero inteligente
            </p>
          </div>

          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
            EC
          </div>
        </header>

        {/* Saldo */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <p className="text-gray-400 mb-2">
            Saldo disponible
          </p>

          <h2 className="text-4xl font-bold mb-4">
            $12,450.00 MXN
          </h2>

          <p className="text-green-400">
            ↑ 8.4% respecto al mes pasado
          </p>
        </section>

        {/* Chat */}
        <section className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

          <h2 className="text-xl font-semibold mb-2">
            Pregúntale a Paymon
          </h2>

          <p className="text-gray-400 mb-6">
            Puedo consultar tus movimientos, analizar tus gastos
            y ayudarte con tus finanzas.
          </p>

          {/* Mensaje del usuario */}
          {mensaje && (
            <div className="bg-blue-600 rounded-xl p-4 mb-3 ml-10">
              {mensaje}
            </div>
          )}

          {/* Respuesta */}
          {respuesta && (
            <div className="bg-gray-800 rounded-xl p-4 mb-4 mr-10">
              <p className="text-gray-300">
                {respuesta}
              </p>
            </div>
          )}

          {/* Entrada */}
          <div className="flex gap-3">

            <input
              type="text"
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  enviarMensaje();
                }
              }}
              placeholder="Escribe algo para Paymon..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={enviarMensaje}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold"
            >
              Enviar
            </button>

          </div>

        </section>

      </div>
    </main>
  );
}