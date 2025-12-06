"use client";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, createConfig, http } from "wagmi";
import { hardhat } from "wagmi/chains";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const config = createConfig({
  chains: [hardhat],
  transports: {
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
