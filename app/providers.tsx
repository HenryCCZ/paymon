"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";

const PollarProvider = dynamic(
  () => import("@pollar/react").then((module) => module.PollarProvider),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <PollarProvider
      client={{
        apiKey: process.env.NEXT_PUBLIC_POLLAR_API_KEY!,
        stellarNetwork: "testnet",
      }}
    >
      {children}
    </PollarProvider>
  );
}