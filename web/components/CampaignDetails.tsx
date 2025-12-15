"use client";

import { useCampaign } from "@/hooks/useCampaigns";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import CampaignDetailsSkeleton from "./CampaignDetailsSkeleton";
import ErrorMessage from "./ErrorMessage";
import { truncateAddress, formatDate } from "@/lib/utils";

interface CampaignDetailsProps {
  campaignId: string;
}

export default function CampaignDetails({ campaignId }: CampaignDetailsProps) {
  const { campaign, isLoading, error, refetch } = useCampaign(
    BigInt(campaignId)
  );

  // Loading State
  if (isLoading) {
    return <CampaignDetailsSkeleton />;
  }

  // Error State
  if (error) {
    return (
      <ErrorMessage
        message={error.message || "Failed to load campaign details."}
        onRetry={refetch}
      />
    );
  }

  // Not Found State
  if (!campaign) {
    return (
      <ErrorMessage message="Campaign not found. It may have been removed or the ID is incorrect." />
    );
  }

  // Success State - Display Campaign Details
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #dad7cd",
        borderRadius: "1rem",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* Header Section */}
      <div>
        <StatusBadge verified={campaign.verified} active={campaign.active} />
        
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            color: "#344e41",
            marginTop: "1rem",
            marginBottom: "0.75rem",
          lineHeight: 1.2,
        }}
      >
        {campaign.title}
      </h1>        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            fontSize: "0.875rem",
            color: "#3a5a40",
          }}
        >
          <div>
            <span style={{ fontWeight: 600 }}>Owner:</span>{" "}
            {truncateAddress(campaign.owner)}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Created:</span>{" "}
            {formatDate(campaign.createdAt)}
          </div>
          <div>
            <span style={{ fontWeight: 600 }}>Campaign ID:</span> #{campaign.id}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#344e41",
            marginBottom: "0.75rem",
          }}
        >
          About This Campaign
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "#3a5a40",
            lineHeight: 1.7,
            whiteSpace: "pre-wrap",
          }}
        >
          {campaign.description}
        </p>
      </div>

      {/* Fundraising Progress Section */}
      <div
        style={{
          backgroundColor: "#fafaf9",
          border: "1px solid #dad7cd",
          borderRadius: "0.75rem",
          padding: "1.5rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#344e41",
            marginBottom: "1rem",
          }}
        >
          Fundraising Progress
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <div style={{ fontSize: "0.875rem", color: "#a3b18a", marginBottom: "0.25rem" }}>
              Raised
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#588157" }}>
              {campaign.raisedETH} ETH
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.875rem", color: "#a3b18a", marginBottom: "0.25rem" }}>
              Goal
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#344e41" }}>
              {campaign.goalETH} ETH
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.875rem", color: "#a3b18a", marginBottom: "0.25rem" }}>
              Progress
            </div>
            <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "#3a5a40" }}>
              {campaign.progress.toFixed(1)}%
            </div>
          </div>
        </div>

        <ProgressBar progress={campaign.progress} showPercentage={false} />
      </div>
    </div>
  );
}
