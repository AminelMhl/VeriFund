"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function WalletPrompt() {
  return (
    <div className="wallet-prompt-container">
      <div 
        className="wallet-prompt-card" 
        role="region" 
        aria-labelledby="wallet-prompt-title"
        aria-describedby="wallet-prompt-description"
      >
        <div className="wallet-icon" aria-hidden="true">👛</div>
        <h3 id="wallet-prompt-title">Connect Your Wallet</h3>
        <p id="wallet-prompt-description" className="description">
          To make a donation, you need to connect your wallet first. This allows you to securely send ETH to support this campaign.
        </p>
        <div className="connect-button-wrapper">
          <ConnectButton />
        </div>
      </div>

      <style jsx>{`
        .wallet-prompt-container {
          margin-top: 24px;
        }

        .wallet-prompt-card {
          background: linear-gradient(135deg, #fafaf9 0%, #ffffff 100%);
          border: 2px dashed #a3b18a;
          border-radius: 12px;
          padding: 32px 24px;
          text-align: center;
        }

        .wallet-icon {
          font-size: 3rem;
          margin-bottom: 16px;
        }

        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #344e41;
          margin: 0 0 12px 0;
        }

        .description {
          font-size: 0.9375rem;
          color: #3a5a40;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto 24px auto;
        }

        .connect-button-wrapper {
          display: flex;
          justify-content: center;
        }

        /* Responsive Design - Mobile First */
        @media (max-width: 640px) {
          .wallet-prompt-container {
            margin-top: 16px;
          }

          .wallet-prompt-card {
            padding: 24px 16px;
          }

          .wallet-icon {
            font-size: 2.5rem;
            margin-bottom: 12px;
          }

          h3 {
            font-size: 1.25rem;
            margin-bottom: 10px;
          }

          .description {
            font-size: 0.875rem;
            margin-bottom: 20px;
            padding: 0 8px;
          }

          .connect-button-wrapper {
            /* Ensure button is touch-friendly */
            min-height: 44px;
          }
        }

        /* Tablet */
        @media (min-width: 641px) and (max-width: 1024px) {
          .wallet-prompt-card {
            padding: 28px 20px;
          }

          .connect-button-wrapper {
            min-height: 44px;
          }
        }
      `}</style>
    </div>
  );
}
