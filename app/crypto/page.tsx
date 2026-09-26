"use client";

import { usePollar } from "@pollar/react";

function WalletDemo() {
  const { isAuthenticated, wallet, login, logout } = usePollar();

  if (!isAuthenticated) {
    return (
      <button
        type="button"
        onClick={() => login({ provider: "google" })}
        className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-blue-500"
      >
        Conectar wallet con Google
      </button>
    );
  }

  return (
    <div className="w-full">
      <p className="mb-2 text-sm text-gray-400">Wallet conectada:</p>
      <p className="mb-6 break-all rounded-2xl border border-white/10 bg-gray-900/70 p-4 font-mono text-sm text-white">
        {wallet?.address}
      </p>
      <button
        type="button"
        onClick={logout}
        className="rounded-xl border border-gray-600 bg-gray-900/60 px-5 py-3 font-semibold text-gray-200 transition-colors hover:bg-gray-700"
      >
        Cerrar sesión
      </button>
    </div>
  );
}

export default function CryptoPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-950 p-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-xl">
        <h1 className="mb-2 text-2xl font-bold">Wallet Stellar</h1>
        <p className="mb-6 text-gray-400">Prueba de conexión con Pollar.</p>
        <WalletDemo />
      </section>
    </main>
  );
}