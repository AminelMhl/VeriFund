"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #dad7cd",
      }}
    >
      <nav
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "1rem 1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "2rem",
        }}
      >
        {/* Logo / Brand */}
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "#344e41",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          VeriFund
        </Link>

        {/* Navigation Links */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2.5rem",
            flex: 1,
          }}
        >
          <Link
            href="/"
            style={{
              color: "#3a5a40",
              textDecoration: "none",
              fontSize: "0.9375rem",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#588157";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#3a5a40";
            }}
          >
            Home
          </Link>
          <Link
            href="/campaigns"
            style={{
              color: "#3a5a40",
              textDecoration: "none",
              fontSize: "0.9375rem",
              fontWeight: 500,
              transition: "color 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#588157";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#3a5a40";
            }}
          >
            Campaigns
          </Link>
        </div>

        {/* Wallet Connect Button */}
        <div style={{ flexShrink: 0 }}>
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
          />
        </div>
      </nav>
    </header>
  );
}
