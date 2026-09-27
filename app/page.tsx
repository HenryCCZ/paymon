"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { usePollar } from "@pollar/react";

interface Mensaje {
  id: number;
  rol: "usuario" | "paymon";
  texto: string;
  url?: string;
}

export default function Home() {
  const { sendPayment, isAuthenticated, wallet, login, logout } = usePollar();
  const [userId, setUserId] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, rol: "paymon", texto: "¡Hola! Soy Paymon, tu agente financiero. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [pendingAction, setPendingAction] = useState<any>(null);
  const [saldo, setSaldo] = useState<{ balance: string; currency: string } | null>(null);
  const finDelChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const walletAddress = wallet?.address;

    if (!isAuthenticated || !walletAddress) {
      setUserId(null);
      return;
    }

    let active = true;

    async function prepararSesion() {
      try {
        const response = await fetch("/api/session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ walletAddress }),
        });

        if (!response.ok) {
          throw new Error("No se pudo preparar la sesión del usuario.");
        }

        const data = await response.json();
        if (active) {
          setUserId(data.userId ?? null);
        }
      } catch (error) {
        console.error("Error al preparar la sesión:", error);
        if (active) {
          setUserId(null);
        }
      }
    }

    void prepararSesion();

    return () => {
      active = false;
    };
  }, [isAuthenticated, wallet?.address]);
  const [vozPaymon, setVozPaymon] = useState(true);

function hablarPaymon(texto: string) {
  if (!vozPaymon) return;
  if (!("speechSynthesis" in window)) return;

  window.speechSynthesis.cancel();

  const voz = new SpeechSynthesisUtterance(texto);
  const voces = window.speechSynthesis.getVoices();

  const vozDalia = voces.find(
    (v) => v.name === "Microsoft Dalia Online (Natural) - Spanish (Mexico)"
  );

  // 2. Si no existe Dalia
  const vozFemeninaMexico = voces.find(
    (v) =>
      v.lang.startsWith("es-MX") &&
      /dalia|libia|female|femenina|maria|maría/i.test(v.name)
  );

  // 3. Cualquier otra voz mexicana
  const vozMexico = voces.find(
    (v) => v.lang.startsWith("es-MX")
  );

  // 4. Cualquier voz en español como último recurso
  const vozEspanol = voces.find(
    (v) => v.lang.startsWith("es")
  );

  voz.voice =
    vozDalia ||
    vozFemeninaMexico ||
    vozMexico ||
    vozEspanol ||
    null;

  voz.lang = "es-MX";

  if (vozDalia || vozFemeninaMexico) {
    //Personalidad de paymon
    voz.rate = 0.88;
    voz.pitch = 1.05;
  } else {
    voz.rate = 0.88;
    voz.pitch = 1.05;
  }

  voz.volume = 1;

  window.speechSynthesis.speak(voz);
}

useEffect(() => {
  if ("speechSynthesis" in window) {
    const mostrarVoces = () => {
      const voces = window.speechSynthesis.getVoices();

      console.log(
        "VOCES DISPONIBLES:",
        voces.map((voz) => ({
          nombre: voz.name,
          idioma: voz.lang
        }))
      );
    };

    mostrarVoces();

    window.speechSynthesis.onvoiceschanged = mostrarVoces;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }
}, []);

  async function cargarSaldo() {
    if (!userId) return;

    try {
      const response = await fetch(`/api/balance?userId=${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error("No se pudo cargar el saldo.");
      }
      setSaldo(await response.json());
    } catch (error) {
      console.error("Error al cargar el saldo:", error);
    }
  }

  async function enviarMensaje() {
    if (!input.trim() || !userId) return;

    const nuevoMensaje: Mensaje = { id: Date.now(), rol: "usuario", texto: input };
    setMensajes((prev) => [...prev, nuevoMensaje]);

    setInput("");
    setCargando(true);

    try {
      const historialActualizado = [...mensajes, nuevoMensaje];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: nuevoMensaje.texto,
          userId,
          historial: historialActualizado,
        }),
      });

      const data = await response.json();
      setPendingAction(data.pendingAction ?? null);

      if (!response.ok) {
        throw new Error("Fallo en la respuesta");
      }

      setMensajes((prev) => [...prev, { id: Date.now(), rol: "paymon", texto: data.respuesta }]);
      hablarPaymon(data.respuesta);
    } catch (error) {
      const mensajeError = "Mis circuitos fallaron. No pude conectarme con los servidores.";

      setMensajes((prev) => [...prev, {
        id: Date.now(),
        rol: "paymon",
        texto: mensajeError,
      }]);
      hablarPaymon(mensajeError);
    } finally {
      setCargando(false);
    }
  }

  async function confirmarPago() {
    if (!pendingAction) return;

    try {
      const response = await fetch("/api/actions/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: pendingAction.actionId }),
      });

      if (!response.ok) {
        throw new Error("No se pudo confirmar el pago.");
      }

      if (userId) {
        await cargarSaldo();
      }
      setMensajes((prev) => [
        ...prev,
        { id: Date.now(), rol: "paymon", texto: "✓ Pago recurrente creado." },
      ]);
      setPendingAction(null);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { id: Date.now(), rol: "paymon", texto: "No pude confirmar el pago recurrente." },
      ]);
    }
  }

  async function confirmarAccion() {
    if (!pendingAction) return;

    if (pendingAction.type === "crypto") {
      if (!isAuthenticated) {
        setMensajes((prev) => [...prev, {
          id: Date.now(),
          rol: "paymon",
          texto: "Primero conecta tu wallet arriba a la derecha para poder firmar esta transacción.",
        }]);
        return;
      }

      try {
        const result = await sendPayment({
          chain: "STELLAR",
          destination: pendingAction.toAddress,
          amount: String(pendingAction.amount),
          asset: { type: "native" },
        });

        if (result.status === "error") {
          setMensajes((prev) => [...prev, { id: Date.now(), rol: "paymon", texto: `No se pudo enviar: ${result.details ?? "error desconocido"}` }]);
          return;
        }

        const response = await fetch("/api/actions/confirm-crypto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ actionId: pendingAction.actionId, txHash: result.hash }),
        });

        if (!response.ok) {
          throw new Error("No se pudo registrar la transacción.");
        }

        setMensajes((prev) => [...prev, {
          id: Date.now(),
          rol: "paymon",
          texto: "✓ Transacción enviada. Ver en Stellar Expert: ",
          url: `https://stellar.expert/explorer/testnet/tx/${result.hash}`,
        }]);
        setPendingAction(null);
      } catch (error) {
        setMensajes((prev) => [...prev, { id: Date.now(), rol: "paymon", texto: "No pude completar la transacción." }]);
      }
      return;
    }

    await confirmarPago();
  }

  async function cancelarPago() {
    if (!pendingAction) return;

    try {
      const response = await fetch("/api/actions/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionId: pendingAction.actionId }),
      });

      if (!response.ok) {
        throw new Error("No se pudo cancelar el pago.");
      }

      setMensajes((prev) => [
        ...prev,
        { id: Date.now(), rol: "paymon", texto: "Pago cancelado." },
      ]);
      setPendingAction(null);
    } catch (error) {
      setMensajes((prev) => [
        ...prev,
        { id: Date.now(), rol: "paymon", texto: "No pude cancelar el pago recurrente." },
      ]);
    }
  }

  useEffect(() => {
    if (userId) {
      void cargarSaldo();
    }
  }, [userId]);

  useEffect(() => {
    finDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const mostrarSplash = !isAuthenticated || (isAuthenticated && userId === null);

  if (mostrarSplash) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="relative w-40 h-40 mb-8 animate-pulse">
          <Image
            src="/logo.jpeg"
            alt="Logo de Payvat"
            fill
            sizes="160px"
            className="object-contain rounded-3xl shadow-2xl shadow-blue-500/20"
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          {isAuthenticated ? "Preparando tu cuenta..." : "Bienvenido a Payvat tu app bancaria"}
        </h1>

        <p className="text-gray-400 text-lg md:text-xl font-medium mb-6">
          {isAuthenticated
            ? "Estamos conectando tu wallet con tu cuenta de Paymon."
            : "Integrado con Paymon un agente financiero de IA"}
        </p>

        {!isAuthenticated && (
          <button
            type="button"
            onClick={() => login({ provider: "google" })}
            className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
          >
            Acceder con Google
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-blue-400/30 relative flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Mi Avatar"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                Paymon
              </h1>
              <p className="text-gray-400 text-sm font-medium">
                Tu agente financiero inteligente
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setVozPaymon((actual) => {
                  const nuevoEstado = !actual;

                  // Si se apaga la voz, detener lo que Paymon esté diciendo
                  if (!nuevoEstado && "speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                  }

                  return nuevoEstado;
                });
              }}
              title={vozPaymon ? "Desactivar voz de Paymon" : "Activar voz de Paymon"}
              className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center text-lg hover:bg-gray-700 transition-colors"
            >
              {vozPaymon ? "🔊" : "🔇"}
            </button>

            {isAuthenticated ? (
              <>
                <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs text-gray-200">
                  {wallet?.address
                    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
                    : "Wallet conectada"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setUserId(null);
                    setMensajes([
                      { id: 1, rol: "paymon", texto: "¡Hola! Soy Paymon, tu agente financiero. ¿En qué te puedo ayudar hoy?" },
                    ]);
                    setSaldo(null);
                    setPendingAction(null);
                  }}
                  className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => login({ provider: "google" })}
                className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-medium text-gray-200 transition-colors hover:bg-gray-700"
              >
                Conectar wallet
              </button>
            )}

            <div className="relative hidden sm:block">
              <button
                onClick={() => setMenuAbierto(!menuAbierto)}
                className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-gray-300 hover:bg-gray-700 hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none"
              >
                SC
              </button>

              {menuAbierto && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuAbierto(false)}
                  ></div>
                  <div className="absolute left-full top-0 ml-3 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-left-2 duration-200">
                    <ul className="flex flex-col text-sm text-gray-300 font-medium">
                      <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">Cuenta</li>
                      <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">Wallet</li>
                      <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">Historial de gastos</li>
                      <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors flex items-center gap-2">Ajustes</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>

          <p className="text-gray-400 mb-1 font-medium tracking-wide uppercase text-sm">
            Saldo disponible
          </p>

          <h2 className="text-4xl font-bold mb-4">
            {saldo
              ? `$${Number(saldo.balance).toLocaleString("es-MX", { minimumFractionDigits: 2 })} ${saldo.currency}`
              : "Cargando..."}
          </h2>
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            <span>↑ 8.4%</span>
            <span className="text-green-500/70">respecto al mes pasado</span>
          </div>
        </section>

        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[500px]">
          <div className="mb-4 pb-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-gray-100">Consultas</h2>
            <p className="text-gray-400 text-sm">Analiza tus gastos y movimientos.</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.rol === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md ${
                    msg.rol === "usuario"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-tr-sm"
                      : "bg-gray-800/80 border border-gray-700 text-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.texto}
                  {msg.url && (
                    <a
                      href={msg.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-blue-300 underline hover:text-blue-200"
                    >
                      {msg.url}
                    </a>
                  )}
                </div>
              </div>
            ))}

            {cargando && (
              <div className="flex justify-start">
                <div className="bg-gray-800/80 border border-gray-700 text-gray-400 rounded-2xl rounded-tl-sm px-5 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={finDelChatRef} />
          </div>

          {pendingAction !== null && (
            <div className="mb-4 rounded-2xl border border-gray-700 bg-gray-800/80 p-4 text-gray-200">
              <h3 className="mb-3 text-lg font-semibold text-white">
                {pendingAction.type === "crypto"
                  ? "Confirmación de transferencia"
                  : "Confirmación de pago"}
              </h3>
              {pendingAction.type === "crypto" ? (
                <>
                  <p>Destino: {pendingAction.toAddress}</p>
                  <p>
                    Cantidad: {pendingAction.amount} {pendingAction.token}
                  </p>
                </>
              ) : (
                <>
                  <p>Destinatario: {pendingAction.recipientName}</p>
                  <p>
                    Cantidad: {pendingAction.amount} {pendingAction.currency}
                  </p>
                  <p>Frecuencia: {pendingAction.frequency}</p>
                </>
              )}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={confirmarAccion}
                  className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-500"
                >
                  Confirmar
                </button>
                <button
                  onClick={cancelarPago}
                  className="rounded-xl border border-gray-600 bg-gray-900/60 px-4 py-2 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 bg-gray-900/50 p-2 rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userId) enviarMensaje();
              }}
              placeholder="Escribe algo para Paymon..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-100 placeholder-gray-500"
            />
            <button
              onClick={enviarMensaje}
              disabled={cargando || !input.trim() || !userId}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-300 px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Enviar
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}