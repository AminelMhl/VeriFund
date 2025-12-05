interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
        padding: "2rem 1.5rem",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "0.75rem",
        maxWidth: "28rem",
        margin: "0 auto",
      }}
    >
      {/* Warning Icon */}
      <div
        style={{
          fontSize: "2.5rem",
          lineHeight: 1,
        }}
      >
        ⚠️
      </div>

      {/* Error Message */}
      <div style={{ textAlign: "center" }}>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            color: "#991b1b",
            marginBottom: "0.5rem",
          }}
        >
          Something went wrong
        </h3>
        <p
          style={{
            fontSize: "0.875rem",
            color: "#7f1d1d",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "0.625rem 1.25rem",
            backgroundColor: "#dc2626",
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#b91c1c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#dc2626";
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
