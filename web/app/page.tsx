"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-6 py-20">
      <h1 className="text-4xl font-bold">VeriFund</h1>
      <ConnectButton />

      <p className="text-gray-400">
        A transparent blockchain-based donation platform.
      </p>
    </div>
  );
}
