interface StatusBadgeProps {
  verified: boolean;
  active: boolean;
}

export default function StatusBadge({ verified, active }: StatusBadgeProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      {/* Verification Badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.025em",
          backgroundColor: verified ? "#588157" : "#fef3c7",
          color: verified ? "#ffffff" : "#3a5a40",
        }}
      >
        <span style={{ fontSize: "0.875rem" }}>{verified ? "✓" : "⏳"}</span>
        {verified ? "VERIFIED" : "PENDING"}
      </span>

      {/* Active Status Badge */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "0.25rem 0.625rem",
          borderRadius: "9999px",
          fontSize: "0.75rem",
          fontWeight: 600,
          letterSpacing: "0.025em",
          backgroundColor: active ? "#a3b18a" : "#dad7cd",
          color: active ? "#ffffff" : "#344e41",
        }}
      >
        {active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
