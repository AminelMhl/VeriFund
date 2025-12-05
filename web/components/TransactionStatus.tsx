"use client";

interface TransactionStatusProps {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  hash?: `0x${string}`;
  error?: string | null;
  onReset?: () => void;
}

export default function TransactionStatus({
  isPending,
  isConfirming,
  isSuccess,
  hash,
  error,
  onReset,
}: TransactionStatusProps) {
  // Don't render anything if no transaction state
  if (!isPending && !isConfirming && !isSuccess && !error) {
    return null;
  }

  return (
    <div className="transaction-status-container">
      {/* Pending State - Waiting for user to confirm in wallet */}
      {isPending && !isConfirming && (
        <div className="status-card pending" role="status" aria-live="polite">
          <div className="spinner"></div>
          <div className="status-content">
            <h4>Confirm in Wallet</h4>
            <p>Please confirm the transaction in your wallet...</p>
          </div>
        </div>
      )}

      {/* Confirming State - Transaction submitted, waiting for confirmation */}
      {isConfirming && (
        <div className="status-card confirming" role="status" aria-live="polite">
          <div className="spinner"></div>
          <div className="status-content">
            <h4>Transaction Pending</h4>
            <p>Your donation is being processed on the blockchain...</p>
            {hash && (
              <a
                href={`https://etherscan.io/tx/${hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on Etherscan →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Success State */}
      {isSuccess && hash && (
        <div className="status-card success" role="status" aria-live="polite">
          <div className="success-icon">✓</div>
          <div className="status-content">
            <h4>Donation Successful!</h4>
            <p>Thank you for your contribution. Your donation has been confirmed.</p>
            <a
              href={`https://etherscan.io/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-link"
            >
              View Transaction on Etherscan →
            </a>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="status-card error" role="alert" aria-live="assertive">
          <div className="error-icon">⚠</div>
          <div className="status-content">
            <h4>Transaction Failed</h4>
            <p>{error || "An error occurred while processing your donation."}</p>
            {onReset && (
              <button onClick={onReset} className="retry-button">
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .transaction-status-container {
          margin-top: 16px;
        }

        .status-card {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px;
          border-radius: 12px;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .status-card.pending {
          background-color: #f9f9f8;
          border: 1px solid #a3b18a;
        }

        .status-card.confirming {
          background-color: #fef3c7;
          border: 1px solid #a3b18a;
        }

        .status-card.success {
          background-color: #e8f5e9;
          border: 1px solid #a3b18a;
        }

        .status-error {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
        }

        .spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(88, 129, 87, 0.3);
          border-top-color: #588157;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .success-icon {
          width: 24px;
          height: 24px;
          background-color: #3a5a40;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }

        .error-icon {
          width: 24px;
          height: 24px;
          background-color: #ef4444;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          flex-shrink: 0;
        }

        .status-content {
          flex: 1;
        }

        .status-content h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .pending h4, .confirming h4 {
          color: #344e41;
        }

        .success h4 {
          color: #3a5a40;
        }

        .error h4 {
          color: #dc2626;
        }

        .status-content p {
          font-size: 0.875rem;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .pending p, .confirming p {
          color: #3a5a40;
        }

        .success p {
          color: #344e41;
        }

        .error p {
          color: #dc2626;
        }

        .tx-link {
          display: inline-block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #588157;
          text-decoration: none;
          transition: color 0.2s;
        }

        .tx-link:hover {
          color: #3a5a40;
          text-decoration: underline;
        }

        .retry-button {
          margin-top: 8px;
          padding: 8px 16px;
          background: linear-gradient(135deg, #588157 0%, #3a5a40 100%);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .retry-button:hover {
          background: linear-gradient(135deg, #3a5a40 0%, #344e41 100%);
        }

        /* Responsive Design - Mobile First */
        @media (max-width: 640px) {
          .status-card {
            flex-direction: column;
            gap: 12px;
            padding: 14px;
          }

          .spinner,
          .checkmark-icon,
          .warning-icon,
          .error-icon {
            align-self: center;
          }

          .status-content {
            text-align: center;
          }

          .status-content h4 {
            font-size: 1rem;
          }

          .status-content p {
            font-size: 0.8125rem;
          }

          .tx-link {
            font-size: 0.8125rem;
            word-break: break-all;
          }

          .retry-button {
            width: 100%;
            padding: 12px;
            min-height: 44px;
            touch-action: manipulation;
          }
        }

        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          .status-card {
            padding: 16px 20px;
          }

          .retry-button {
            min-height: 44px;
          }
        }

        /* Hover-capable devices only */
        @media (hover: hover) and (pointer: fine) {
          .tx-link:hover {
            color: #3a5a40;
            text-decoration: underline;
          }

          .retry-button:hover {
            background: linear-gradient(135deg, #3a5a40 0%, #344e41 100%);
          }
        }
      `}</style>
    </div>
  );
}
