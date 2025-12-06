"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        background: "radial-gradient(circle at top, #020617 0, #020617 55%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 28,
          alignItems: "center",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 32,
              marginBottom: 10,
              fontWeight: 700,
              letterSpacing: 0.6,
              color: "#f9fafb",
            }}
          >
            Welcome to VeriFund
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
              maxWidth: 440,
            }}
          >
            A transparent on-chain donation platform. Connect your wallet and
            choose whether you want to support campaigns as a donor or create
            your own verified fundraising campaign.
          </p>

          <div
            style={{
              marginTop: 18,
            }}
          >
            <ConnectButton />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.45)",
              backgroundColor: "rgba(15,23,42,0.96)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              I&apos;m a donor
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Explore campaigns and track how funds are used. You&apos;ll be
              able to see which campaigns have been verified before donating.
            </p>
            <button
              type="button"
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                padding: "7px 12px",
                borderRadius: 999,
                border: "none",
                fontSize: 13,
                fontWeight: 500,
                color: "#0f172a",
                background:
                  "linear-gradient(135deg, #22c55e 0%, #a3e635 45%, #22c55e 100%)",
                cursor: "pointer",
              }}
            >
              Continue as donor
            </button>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 16,
              border: "1px solid rgba(129,140,248,0.6)",
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,64,175,0.6))",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#e5e7eb",
              }}
            >
              I&apos;m a campaign creator
            </h2>
            <p
              style={{
                fontSize: 13,
                color: "#c7d2fe",
              }}
            >
              Create transparent campaigns for your cause and withdraw funds
              securely after donations come in.
            </p>
            <button
              type="button"
              onClick={() => router.push("/create")}
              style={{
                marginTop: 4,
                alignSelf: "flex-start",
                padding: "7px 12px",
                borderRadius: 999,
                border: "1px solid rgba(191,219,254,0.6)",
                fontSize: 13,
                fontWeight: 500,
                color: "#e0f2fe",
                backgroundColor: "rgba(15,23,42,0.6)",
                cursor: "pointer",
              }}
            >
              Continue as campaign creator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
