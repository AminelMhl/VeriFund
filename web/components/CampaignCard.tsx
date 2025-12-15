import Link from "next/link";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { FormattedCampaign } from "@/types/campaign";

interface CampaignCardProps {
  campaign: FormattedCampaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #dad7cd",
        borderRadius: "1rem",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 20px 40px rgba(163, 177, 138, 0.2)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Status Badges */}
      <StatusBadge verified={campaign.verified} active={campaign.active} />

      {/* Campaign Title */}
      <h3
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          color: "#344e41",
          lineHeight: 1.3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          minHeight: "2.6em",
        }}
      >
        {campaign.title}
      </h3>

      {/* Campaign Description Preview */}
      <p
        style={{
          fontSize: "0.875rem",
          color: "#3a5a40",
          lineHeight: 1.6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          minHeight: "4.2em",
        }}
      >
        {campaign.description}
      </p>

      {/* Fundraising Info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.875rem",
          marginTop: "0.5rem",
        }}
      >
        <div>
          <div style={{ color: "#a3b18a", marginBottom: "0.25rem" }}>Raised</div>
          <div style={{ fontWeight: 600, color: "#344e41" }}>
            {campaign.raisedETH} ETH
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#a3b18a", marginBottom: "0.25rem" }}>Goal</div>
          <div style={{ fontWeight: 600, color: "#344e41" }}>
            {campaign.goalETH} ETH
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={campaign.progress} showPercentage={true} />

      {/* View Details Link */}
      <Link
        href={`/campaign/${campaign.id}`}
        style={{
          marginTop: "0.5rem",
          padding: "0.75rem",
          textAlign: "center",
          background: "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
          color: "#ffffff",
          fontSize: "0.9375rem",
          fontWeight: 600,
          borderRadius: "0.5rem",
          textDecoration: "none",
          transition: "opacity 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
      >
        View Details
      </Link>
    </div>
  );
}
