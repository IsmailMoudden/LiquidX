"use client";

import dynamic from "next/dynamic";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

const MANIFEST_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/tonconnect-manifest.json`
    : "http://localhost:3000/tonconnect-manifest.json";

function TonProviderInner({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
      {children}
    </TonConnectUIProvider>
  );
}

export const TonProvider = dynamic(() => Promise.resolve(TonProviderInner), {
  ssr: false,
});
