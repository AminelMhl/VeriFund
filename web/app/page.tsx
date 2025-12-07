"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [createButtonHovered, setCreateButtonHovered] = useState(false);

  const features = [
    {
      icon: "/secure.png",
      title: "Blockchain Security",
      description:
        "Every donation is recorded on the blockchain, ensuring complete transparency and immutability.",
    },
    {
      icon: "/verified.png",
      title: "Verified Campaigns",
      description:
        "All campaigns are verified to ensure legitimacy and protect donors from fraud.",
    },
    {
      icon: "/tracking.png",
      title: "Real-time Tracking",
      description:
        "Track your donations in real-time and see exactly how funds are being utilized.",
    },
  ];

  return (
    <>
      <Header />
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "4rem 1.5rem",
          backgroundColor: "#ffffff",
          minHeight: "calc(100vh - 73px)",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "5rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              color: "#344e41",
              marginBottom: "1.5rem",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
            }}
          >
            Transparent Charity
            <br />
            Powered by Blockchain
          </h1>

          <p
            style={{
              fontSize: "1.25rem",
              color: "#3a5a40",
              maxWidth: "42rem",
              margin: "0 auto 3rem",
              lineHeight: 1.7,
            }}
          >
            Make a difference with confidence. Every donation is verified,
            tracked, and transparent on the blockchain.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              alignItems: "center",
            }}
          >
            <Link
              href="/campaigns"
              style={{
                display: "inline-block",
                padding: "1rem 2.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#ffffff",
                background: buttonHovered
                  ? "linear-gradient(135deg, #3a5a40 0%, #344e41 100%)"
                  : "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
                borderRadius: "0.75rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
                transform: buttonHovered ? "translateY(-2px)" : "translateY(0)",
                boxShadow: buttonHovered
                  ? "0 20px 40px rgba(88, 129, 87, 0.4)"
                  : "0 10px 25px rgba(88, 129, 87, 0.2)",
              }}
              onMouseEnter={() => setButtonHovered(true)}
              onMouseLeave={() => setButtonHovered(false)}
            >
              Browse Campaigns
            </Link>
            <Link
              href="/create"
              style={{
                display: "inline-block",
                padding: "1rem 2.5rem",
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#ffffff",
                background: createButtonHovered
                  ? "linear-gradient(135deg, #f97316 0%, #c2410c 100%)"
                  : "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                borderRadius: "0.75rem",
                textDecoration: "none",
                transition: "all 0.3s ease",
                transform: createButtonHovered
                  ? "translateY(-2px)"
                  : "translateY(0)",
                boxShadow: createButtonHovered
                  ? "0 20px 40px rgba(234, 179, 8, 0.4)"
                  : "0 10px 25px rgba(234, 179, 8, 0.2)",
              }}
              onMouseEnter={() => setCreateButtonHovered(true)}
              onMouseLeave={() => setCreateButtonHovered(false)}
            >
              Create Campaign
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "2rem",
          }}
        >
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #dad7cd",
                borderRadius: "1rem",
                padding: "2rem",
                textAlign: "center",
                transition: "all 0.3s ease",
                transform:
                  hoveredFeature === index
                    ? "translateY(-8px)"
                    : "translateY(0)",
                boxShadow:
                  hoveredFeature === index
                    ? "0 20px 40px rgba(88, 129, 87, 0.15)"
                    : "0 4px 6px rgba(0, 0, 0, 0.05)",
              }}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={80}
                  height={80}
                  style={{
                    objectFit: "contain",
                  }}
                />
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  color: "#344e41",
                  marginBottom: "0.75rem",
                }}
              >
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: "0.9375rem",
                  color: "#3a5a40",
                  lineHeight: 1.6,
                }}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
