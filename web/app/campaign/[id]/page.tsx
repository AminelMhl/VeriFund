"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import Header from "@/components/Header";
import CampaignDetails from "@/components/CampaignDetails";
import DonationForm from "@/components/DonationForm";
import WalletPrompt from "@/components/WalletPrompt";
import { useCampaign } from "@/hooks/useCampaigns";

export default function CampaignDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { isConnected } = useAccount();
  const campaignId = BigInt(params.id);
  const { campaign, refetch } = useCampaign(campaignId);

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
            color: "#588157",
            textDecoration: "none",
            fontSize: "0.9375rem",
            fontWeight: 500,
            marginBottom: "2rem",
            transition: "gap 0.2s ease, color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.gap = "0.75rem";
            e.currentTarget.style.color = "#3a5a40";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.gap = "0.5rem";
            e.currentTarget.style.color = "#588157";
          }}
        >
          <span>←</span> Back to Campaigns
        </Link>

        {/* Campaign Details */}
        <CampaignDetails campaignId={params.id} />

        {/* Donation Section */}
        {campaign && (
          <>
            {isConnected ? (
              <DonationForm
                campaignId={campaignId}
                isVerified={campaign.verified}
                isActive={campaign.active}
                onSuccess={refetch}
              />
            ) : (
              <WalletPrompt />
            )}
          </>
        )}
      </main>
    </>
  );
}
