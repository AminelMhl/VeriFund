interface ProgressBarProps {
  progress: number;
  showPercentage?: boolean;
}

export default function ProgressBar({
  progress,
  showPercentage = true,
}: ProgressBarProps) {
  // Cap progress at 100% for display
  const displayProgress = Math.min(progress, 100);

  // Dynamic color based on progress (using earth-tone palette)
  const getColor = (prog: number): string => {
    if (prog >= 75) return "#588157"; // Fern (green)
    if (prog >= 50) return "#3a5a40"; // Hunter green
    if (prog >= 25) return "#a3b18a"; // Dry sage
    return "#dad7cd"; // Dust grey
  };

  const color = getColor(displayProgress);

  return (
    <div style={{ width: "100%" }}>
      {/* Progress Bar Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "0.5rem",
          backgroundColor: "#dad7cd",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        {/* Filled Progress */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${displayProgress}%`,
            backgroundColor: color,
            borderRadius: "9999px",
            transition: "width 0.5s ease, background-color 0.3s ease",
          }}
        />
      </div>

      {/* Percentage Text */}
      {showPercentage && (
        <div
          style={{
            marginTop: "0.375rem",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#3a5a40",
            textAlign: "right",
          }}
        >
          {displayProgress.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
