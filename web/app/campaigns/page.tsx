import type { Metadata } from "next";
import Header from "@/components/Header";
import CampaignGrid from "@/components/CampaignGrid";

export const metadata: Metadata = {
  title: "All Campaigns | VeriFund",
  description: "Browse all verified blockchain charity campaigns and make a difference.",
};

export default function CampaignsPage() {
  return (
    <>
      <Header />
      <main
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
        }}
      >
        {/* Page Header */}
        <div
          style={{
            marginBottom: "3rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
              letterSpacing: "-0.02em",
            }}
          >
            All Campaigns
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "#6b7280",
              maxWidth: "42rem",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Explore verified charity campaigns and support causes you care about.
            Every donation is transparent and tracked on the blockchain.
          </p>
        </div>

        {/* Campaign Grid */}
        <CampaignGrid />
      </main>
    </>
  );
}
