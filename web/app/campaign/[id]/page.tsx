import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import CampaignDetails from "@/components/CampaignDetails";

export const metadata: Metadata = {
  title: "Campaign Details | VeriFund",
  description: "View detailed information about this charity campaign.",
};

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <>
      <Header />
      <main
        style={{
          maxWidth: "1024px",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        {/* Back Navigation */}
        <Link
          href="/campaigns"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#667eea",
            textDecoration: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            marginBottom: "2rem",
            transition: "gap 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.gap = "0.75rem";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.gap = "0.5rem";
          }}
        >
          <span>←</span> Back to Campaigns
        </Link>

        {/* Campaign Details */}
        <CampaignDetails campaignId={params.id} />

        {/* Donation Form Placeholder (Section 3) */}
        <div
          style={{
            marginTop: "2rem",
            padding: "3rem 2rem",
            border: "2px dashed #d1d5db",
            borderRadius: "1rem",
            textAlign: "center",
            backgroundColor: "#f9fafb",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            💝 Donation form will be added in Section 3
          </p>
        </div>
      </main>
    </>
  );
}
