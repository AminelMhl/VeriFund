interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        padding: "3rem 1.5rem",
      }}
    >
      {/* Spinning Circle */}
      <div
        style={{
          width: "2.5rem",
          height: "2.5rem",
          border: "3px solid #dad7cd",
          borderTopColor: "#588157",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />

      {/* Loading Message */}
      <p
        style={{
          fontSize: "0.9375rem",
          color: "#3a5a40",
          fontWeight: 500,
        }}
      >
        {message}
      </p>

      {/* Keyframes for spin animation */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
