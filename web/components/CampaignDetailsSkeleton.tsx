"use client";

/**
 * Skeleton loader for campaign details page
 * Provides visual placeholder while campaign data loads
 */
export default function CampaignDetailsSkeleton() {
  return (
    <div className="skeleton-container" role="status" aria-live="polite" aria-label="Loading campaign details">
      {/* Title Skeleton */}
      <div className="skeleton skeleton-title"></div>
      
      {/* Metadata Row Skeleton */}
      <div className="skeleton-metadata">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-text-small"></div>
      </div>

      {/* Description Skeleton */}
      <div className="skeleton-description">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
      </div>

      {/* Progress Section Skeleton */}
      <div className="skeleton-progress-card">
        <div className="skeleton skeleton-progress-bar"></div>
        <div className="skeleton-stats">
          <div className="skeleton skeleton-stat"></div>
          <div className="skeleton skeleton-stat"></div>
        </div>
      </div>

      {/* Campaign Info Skeleton */}
      <div className="skeleton-info-card">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
      </div>

      <style jsx>{`
        .skeleton-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
          padding: 24px;
          background: white;
          border: 1px solid #dad7cd;
          border-radius: 12px;
        }

        .skeleton {
          background: linear-gradient(
            90deg,
            #dad7cd 0%,
            #a3b18a 50%,
            #dad7cd 100%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 8px;
        }

        .skeleton-title {
          height: 32px;
          width: 60%;
          max-width: 400px;
        }

        .skeleton-metadata {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .skeleton-badge {
          height: 24px;
          width: 80px;
        }

        .skeleton-text-small {
          height: 16px;
          width: 120px;
        }

        .skeleton-description {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .skeleton-text {
          height: 16px;
          width: 100%;
        }

        .skeleton-progress-card {
          background: #fafaf9;
          border: 1px solid #dad7cd;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .skeleton-progress-bar {
          height: 12px;
          width: 100%;
        }

        .skeleton-stats {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .skeleton-stat {
          height: 48px;
          flex: 1;
        }

        .skeleton-info-card {
          background: #fafaf9;
          border: 1px solid #dad7cd;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Smooth transition when skeleton is replaced */
        .skeleton-container {
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive Design - Mobile First */
        @media (max-width: 640px) {
          .skeleton-container {
            padding: 16px;
            gap: 16px;
          }

          .skeleton-title {
            height: 28px;
            width: 80%;
          }

          .skeleton-metadata {
            flex-wrap: wrap;
            gap: 8px;
          }

          .skeleton-badge {
            height: 22px;
            width: 70px;
          }

          .skeleton-text-small {
            width: 100px;
          }

          .skeleton-progress-card,
          .skeleton-info-card {
            padding: 16px;
          }

          .skeleton-stats {
            flex-direction: column;
            gap: 12px;
          }

          .skeleton-stat {
            height: 40px;
          }
        }

        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          .skeleton-container {
            padding: 20px;
          }

          .skeleton-progress-card,
          .skeleton-info-card {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
