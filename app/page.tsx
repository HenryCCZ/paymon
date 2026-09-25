"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";

// Definimos la estructura de un mensaje para Typescript/Javascript
interface Mensaje {
  id: number;
  rol: "usuario" | "paymon";
  texto: string;
}

export default function Home() {
  // Inicializamos el estado con un mensaje de bienvenida de Paymon
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { id: 1, rol: "paymon", texto: "¡Hola! Soy Paymon, tu agente financiero. ¿En qué te puedo ayudar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Referencia para hacer auto-scroll al final del chat
  const finDelChatRef = useRef<HTMLDivElement>(null);
  // Estado para controlar la pantalla de carga (inicia en true para que sea lo primero que se vea)
  const [mostrarSplash, setMostrarSplash] = useState(true);

  async function enviarMensaje() {
    if (!input.trim()) return;

    // 1. Guardamos el mensaje del usuario en el historial
    const nuevoMensaje: Mensaje = { id: Date.now(), rol: "usuario", texto: input };
    setMensajes((prev) => [...prev, nuevoMensaje]);
    setInput("");
    setCargando(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mensaje: nuevoMensaje.texto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Fallo en la respuesta");
      }

      // 2. Agregamos la respuesta de Paymon al historial
      setMensajes((prev) => [...prev, { id: Date.now(), rol: "paymon", texto: data.respuesta }]);

    } catch (error) {
      setMensajes((prev) => [...prev, { 
        id: Date.now(), 
        rol: "paymon", 
        texto: "Mis circuitos fallaron. No pude conectarme con los servidores." 
      }]);
    } finally {
      setCargando(false);
    }
  }
  
  // Efecto para quitar el splash screen después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMostrarSplash(false);
    }, 3000); // 3000 milisegundos = 3 segundos
    
    // Es una buena práctica limpiar los timers al desmontar el componente
    return () => clearTimeout(timer); 
  }, []);
  useEffect(() => {
    // Cada vez que la lista de mensajes cambie, bajamos el scroll automáticamente
    finDelChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  if (mostrarSplash) {
    return (
      <main className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        
        {/* Contenedor del Logo con una sutil animación */}
        <div className="relative w-40 h-40 mb-8 animate-pulse">
          <Image 
            src="/logo.jpeg" 
            alt="Logo de Payvat" 
            fill 
            className="object-contain rounded-3xl shadow-2xl shadow-blue-500/20"
          />
        </div>
        
        {/* Título Principal */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          Bienvenido a Payvat tu app bancaria
        </h1>
        
        {/* Subtítulo */}
        <p className="text-gray-400 text-lg md:text-xl font-medium animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          Integrado con Paymon un agente financiero de IA
        </p>

      </main>
    );
  }
  return (
    // Fondo con gradiente moderno
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-900 text-white p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Encabezado */}
        <header className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg ring-2 ring-blue-400/30 relative flex-shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Mi Avatar"
                fill
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
          {/* Menú de Usuario (SC) */}
<div className="relative hidden sm:block">
  
  {/* El botón del avatar */}
  <button 
    onClick={() => setMenuAbierto(!menuAbierto)}
    className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center font-bold text-gray-300 hover:bg-gray-700 hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none"
  >
    SC
  </button>

  {/* El menú desplegable */}
  {menuAbierto && (
    <>
      {/* Overlay invisible para cerrar el menú si haces clic afuera */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setMenuAbierto(false)}
      ></div>
{/* Contenedor del menú */}
<div className="absolute left-full top-0 ml-3 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-left-2 duration-200">
        <ul className="flex flex-col text-sm text-gray-300 font-medium">
          <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">
            Cuenta
          </li>
          <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">
            Wallet
          </li>
          <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors border-b border-gray-800 flex items-center gap-2">
            Historial de gastos
          </li>
          <li className="px-5 py-3 hover:bg-gray-800 hover:text-white cursor-pointer transition-colors flex items-center gap-2">
            Ajustes
          </li>
        </ul>
      </div>
    </>
  )}
</div>
        </header>

        {/* Tarjeta de Saldo */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Efecto de luz de fondo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
          
          <p className="text-gray-400 mb-1 font-medium tracking-wide uppercase text-sm">
            Saldo disponible
          </p>
          <h2 className="text-5xl font-black mb-4 tracking-tight">
            $12,450.00  <span className="text-xl text-gray-500 font-semibold">MXN</span>
          </h2>
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            <span>↑ 8.4%</span>
            <span className="text-green-500/70">respecto al mes pasado</span>
          </div>
        </section>

        {/* Interfaz del Chat */}
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col h-[500px]">
          
          <div className="mb-4 pb-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-gray-100">Consultas</h2>
            <p className="text-gray-400 text-sm">Analiza tus gastos y movimientos.</p>
          </div>

          {/* Área de mensajes con scroll */}
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

          {/* Entrada de texto */}
          <div className="flex gap-2 sm:gap-3 bg-gray-900/50 p-2 rounded-2xl border border-gray-700/50 focus-within:border-blue-500/50 transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") enviarMensaje();
              }}
              placeholder="Escribe algo para Paymon..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-100 placeholder-gray-500"
            />
            <button
              onClick={enviarMensaje}
              disabled={cargando || !input.trim()}
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