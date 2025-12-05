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
          width: "3rem",
          height: "3rem",
          borderRadius: "50%",
          backgroundColor: "#fee2e2",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.5rem",
          color: "#dc2626",
          fontWeight: 700,
        }}
      >
        !
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
            background: "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
            color: "#ffffff",
            fontSize: "0.875rem",
            fontWeight: 600,
            borderRadius: "0.5rem",
            border: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #3a5a40 0%, #344e41 100%)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, #588157 0%, #3a5a40 100%)";
          }}
        >
          Try Again
        </button>
      )}
    </div>
  );
}
