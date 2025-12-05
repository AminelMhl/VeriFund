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
          backgroundColor: verified ? "#dcfce7" : "#fed7aa",
          color: verified ? "#15803d" : "#c2410c",
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
          backgroundColor: active ? "#dbeafe" : "#f3f4f6",
          color: active ? "#1e40af" : "#6b7280",
        }}
      >
        {active ? "Active" : "Inactive"}
      </span>
    </div>
  );
}
