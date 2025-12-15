"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import CampaignCard from "./CampaignCard";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import EmptyState from "./EmptyState";

export default function CampaignGrid() {
  const { campaigns, isLoading, error, refetch } = useCampaigns();

  // Loading State
  if (isLoading) {
    return <LoadingSpinner message="Loading campaigns..." />;
  }

  // Error State
  if (error) {
    return (
      <ErrorMessage
        message={error.message || "Failed to load campaigns. Please try again."}
        onRetry={refetch}
      />
    );
  }

  // Empty State
  if (!campaigns || campaigns.length === 0) {
    return (
      <EmptyState
        title="No Campaigns Yet"
        description="There are currently no campaigns available. Check back soon or be the first to create one!"
      />
    );
  }

  // Success State - Display Grid
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))",
        gap: "1.5rem",
        width: "100%",
      }}
    >
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
}
