"use client";

import { useState, FormEvent } from "react";
import { useDonate } from "@/hooks/useDonate";
import { useCampaign } from "@/hooks/useCampaigns";
import { USE_MOCK_BLOCKCHAIN } from "@/lib/contract";
import TransactionStatus from "@/components/TransactionStatus";

interface DonationFormProps {
  campaignId: bigint;
  isVerified: boolean;
  isActive: boolean;
  onSuccess?: () => void;
}

export default function DonationForm({
  campaignId,
  isVerified,
  isActive,
  onSuccess,
}: DonationFormProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const { donate, isPending, isConfirming, isSuccess, hash, error: txError, reset } = useDonate();
  const { refetch } = useCampaign(campaignId);

  // Enhanced validation function
  const validateAmount = (value: string): { valid: boolean; error: string } => {
    // Check if empty
    if (!value || value.trim() === "") {
      return { valid: false, error: "Please enter an amount" };
    }

    const numValue = parseFloat(value);

    // Check if valid number
    if (isNaN(numValue)) {
      return { valid: false, error: "Please enter a valid number" };
    }

    // Check if positive
    if (numValue <= 0) {
      return { valid: false, error: "Amount must be greater than 0" };
    }

    // Check decimal places (max 18 for ETH)
    const decimalParts = value.split('.');
    if (decimalParts.length > 1 && decimalParts[1].length > 18) {
      return { valid: false, error: "Maximum 18 decimal places allowed" };
    }

    // Warning for unusually high amounts
    if (numValue > 1000) {
      return { valid: true, error: "⚠️ Warning: This is a very large amount. Please verify." };
    }

    return { valid: true, error: "" };
  };

  // Handle input change with real-time validation
  const handleAmountChange = (value: string) => {
    setAmount(value);

    // For the mock prototype, keep this forgiving so typing always works
    if (USE_MOCK_BLOCKCHAIN) {
      setError("");
      return;
    }

    if (value.trim() !== "") {
      const validation = validateAmount(value);
      setError(validation.error);
    } else {
      setError("");
    }
  };

  // Handle input blur
  const handleBlur = () => {
    if (USE_MOCK_BLOCKCHAIN) return;

    if (amount.trim() !== "") {
      const validation = validateAmount(amount);
      setError(validation.error);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Basic amount check first
    if (!amount.trim()) {
      setError("Please enter an amount");
      return;
    }

    // Block donations for unverified or closed campaigns (both mock and real)
    if (!isVerified) {
      setError("This campaign is not verified");
      return;
    }

    if (!isActive) {
      setError("This campaign is not active");
      return;
    }

    if (!USE_MOCK_BLOCKCHAIN) {
      // Full validation in real blockchain mode
      const validation = validateAmount(amount);
      if (!validation.valid) {
        setError(validation.error);
        return;
      }
    }

    // Clear any previous errors
    setError("");

    // Execute donation
    donate(campaignId, amount);

    if (USE_MOCK_BLOCKCHAIN) {
      setSuccessMessage("Donation successful! Thank you for your support.");
      setAmount("");
      refetch();
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  // Handle success (only auto-clear for real blockchain mode)
  if (!USE_MOCK_BLOCKCHAIN && isSuccess && hash) {
    setTimeout(() => {
      setAmount("");
      setError("");
      refetch();
      if (onSuccess) {
        onSuccess();
      }
    }, 3000);
  }

  // Calculate if form should be disabled
  const isDisabled = !isVerified || !isActive || isPending || isConfirming;

  return (
    <div className="donation-form-container">
      <h3>Make a Donation</h3>

      <form onSubmit={handleSubmit} className="donation-form">
        <div className="input-group">
          <label htmlFor="amount">
            Donation Amount (ETH)
          </label>
          <input
            id="amount"
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            onBlur={handleBlur}
            placeholder="0.1"
            disabled={isDisabled}
            aria-invalid={!!error}
            aria-describedby={error ? "amount-error" : undefined}
          />
        </div>

        {error && (
          <p id="amount-error" className="error-message" role="alert">
            {error}
          </p>
        )}

        {/* Quick Amount Buttons */}
        <div className="quick-amounts">
          <p className="quick-amounts-label">Quick amounts:</p>
          <div className="quick-amounts-grid">
            {[0.01, 0.05, 0.1, 0.5, 1.0].map((value) => (
              <button
                key={value}
                type="button"
                className="quick-amount-button"
                onClick={() => {
                  const valueStr = value.toString();
                  setAmount(valueStr);
                  const validation = validateAmount(valueStr);
                  setError(validation.error);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const valueStr = value.toString();
                    setAmount(valueStr);
                    const validation = validateAmount(valueStr);
                    setError(validation.error);
                  }
                }}
                disabled={isDisabled}
                aria-label={`Set donation amount to ${value} ETH`}
              >
                {value} ETH
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="donate-button"
          disabled={isDisabled}
          aria-busy={isPending || isConfirming}
        >
          {(isPending || isConfirming) && (
            <span className="button-spinner" aria-hidden="true"></span>
          )}
          <span className="button-text">
            {isPending ? "Processing..." : isConfirming ? "Confirming..." : "Donate Now"}
          </span>
        </button>
      </form>

      {successMessage && (
        <p
          className="success-banner"
          role="status"
          aria-live="polite"
        >
          {successMessage}
        </p>
      )}

      <TransactionStatus
        isPending={isPending}
        isConfirming={isConfirming}
        isSuccess={isSuccess}
        hash={hash}
        error={txError}
        onReset={reset}
      />

      <style jsx>{`
        .donation-form-container {
          background: white;
          border: 1px solid #dad7cd;
          border-radius: 12px;
          padding: 24px;
          margin-top: 24px;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #344e41;
          margin: 0 0 20px 0;
        }

        .donation-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #3a5a40;
        }

        input {
          padding: 12px 16px;
          border: 2px solid #dad7cd;
          border-radius: 8px;
          font-size: 1rem;
          transition: all 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #588157;
          box-shadow: 0 0 0 3px rgba(88, 129, 87, 0.1);
        }

        input:disabled {
          background-color: rgba(218, 215, 205, 0.5);
          cursor: not-allowed;
          opacity: 0.6;
        }

        input[aria-invalid="true"] {
          border-color: #ef4444;
        }

        .quick-amounts {
          margin: 8px 0;
        }

        .quick-amounts-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #3a5a40;
          margin: 0 0 8px 0;
        }

        .quick-amounts-grid {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-amount-button {
          padding: 10px 16px;
          background-color: #dad7cd;
          color: #344e41;
          border: 2px solid #dad7cd;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-amount-button:hover:not(:disabled) {
          background-color: #a3b18a;
          border-color: #a3b18a;
          color: white;
        }

        .quick-amount-button:focus {
          outline: none;
          border-color: #588157;
          box-shadow: 0 0 0 3px rgba(88, 129, 87, 0.1);
        }

        .quick-amount-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .donate-button {
          padding: 14px 24px;
          background: linear-gradient(135deg, #588157 0%, #3a5a40 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .donate-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(88, 129, 87, 0.4);
        }

        .donate-button:disabled {
          background: #a3b18a;
          cursor: not-allowed;
          transform: none;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .button-text {
          transition: opacity 0.2s;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          background-color: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px;
          color: #dc2626;
          font-size: 0.875rem;
          margin: 0;
        }

        .success-banner {
          margin-top: 12px;
          padding: 12px;
          border-radius: 8px;
          background-color: #e8f5e9;
          border: 1px solid #a3b18a;
          color: #166534;
          font-size: 0.875rem;
        }

        /* Responsive Design - Mobile First */
        @media (max-width: 640px) {
          .donation-form-container {
            padding: 16px;
            margin-top: 16px;
          }

          h3 {
            font-size: 1.25rem;
            margin-bottom: 16px;
          }

          input {
            padding: 14px;
            font-size: 1rem;
            /* Larger touch target */
            min-height: 44px;
          }

          .quick-amounts-grid {
            gap: 6px;
          }

          .quick-amount-button {
            padding: 12px 14px;
            font-size: 0.8125rem;
            /* Minimum touch target */
            min-height: 44px;
            flex: 1 0 calc(33.333% - 4px);
          }

          .donate-button {
            padding: 16px 24px;
            font-size: 1rem;
            /* Minimum touch target */
            min-height: 44px;
          }

          /* Remove hover effects on touch devices */
          .quick-amount-button:hover:not(:disabled),
          .donate-button:hover:not(:disabled) {
            transform: none;
            box-shadow: none;
          }

          /* Touch action optimization */
          .quick-amount-button,
          .donate-button,
          input {
            touch-action: manipulation;
          }
        }

        /* Tablet adjustments */
        @media (min-width: 641px) and (max-width: 1024px) {
          .donation-form-container {
            padding: 20px;
          }

          .quick-amounts-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
          }

          .quick-amount-button {
            min-height: 44px;
          }
        }

        /* Hover-capable devices only */
        @media (hover: hover) and (pointer: fine) {
          .quick-amount-button:hover:not(:disabled) {
            background-color: #a3b18a;
            border-color: #a3b18a;
            color: white;
          }

          .donate-button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(88, 129, 87, 0.4);
          }
        }
      `}</style>
    </div>
  );
}
