"use client";

import { WagmiConfig } from "wagmi";
import { polygonMumbai, sepolia } from "wagmi/chains";
import { RainbowKitProvider, getDefaultConfig } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

const config = getDefaultConfig({
  appName: "VeriFund",
  projectId: "d4a2c043797e05c65fda94db2414160d",
  chains: [sepolia, polygonMumbai],
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <WagmiConfig config={config}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </body>
    </html>
  );
}
