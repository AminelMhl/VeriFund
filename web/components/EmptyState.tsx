interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.5rem",
        padding: "4rem 1.5rem",
        textAlign: "center",
      }}
    >
      {/* Empty State Icon */}
      <div
        style={{
          fontSize: "4rem",
          lineHeight: 1,
          opacity: 0.3,
          color: "#a3b18a",
        }}
      >
        ○
      </div>

      {/* Title */}
      <div>
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 600,
            color: "#344e41",
            marginBottom: "0.5rem",
          }}
        >
          {title}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: "0.9375rem",
            color: "#3a5a40",
            lineHeight: 1.6,
            maxWidth: "28rem",
          }}
        >
          {description}
        </p>
      </div>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
            color: "#ffffff",
            fontSize: "0.9375rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 10px 20px rgba(88, 129, 87, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
