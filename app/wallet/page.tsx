"use client";
import { useEffect, useState } from "react";

export default function WalletPage() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [balances, setBalances] = useState<any[]>([]);
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  async function crearWallet() {
    const res = await fetch("/api/wallet/create", { method: "POST" });
    const data = await res.json();
    if (res.ok) setPublicKey(data.publicKey);
    else setStatus(data.error);
  }

  async function cargarSaldo() {
    const res = await fetch("/api/wallet/balance");
    const data = await res.json();
    if (res.ok) {
      setPublicKey(data.publicKey);
      setBalances(data.balances);
    }
  }

  async function enviar() {
    setStatus("Enviando...");
    const res = await fetch("/api/wallet/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destination, amount }),
    });
    const data = await res.json();
    setStatus(res.ok ? `✓ Enviado: ${data.hash}` : `Error: ${data.error}`);
  }

  useEffect(() => { cargarSaldo(); }, []);

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Wallet Stellar (custodial)</h1>
      {!publicKey ? (
        <button onClick={crearWallet} className="bg-blue-600 px-4 py-2 rounded-xl">Crear wallet</button>
      ) : (
        <p className="mb-4 break-all">Dirección: {publicKey}</p>
      )}
      <ul className="mb-6">
        {balances.map((b: any, i: number) => (
          <li key={i}>{b.balance} {b.asset_type === "native" ? "XLM" : b.asset_code}</li>
        ))}
      </ul>
      <div className="flex flex-col gap-2 max-w-sm">
        <input placeholder="Destino (G...)" value={destination} onChange={(e) => setDestination(e.target.value)} className="bg-gray-800 p-2 rounded" />
        <input placeholder="Monto" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-gray-800 p-2 rounded" />
        <button onClick={enviar} className="bg-blue-600 px-4 py-2 rounded-xl">Enviar</button>
      </div>
      {status && <p className="mt-4">{status}</p>}
    </main>
  );
}