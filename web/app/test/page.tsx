"use client";

import { useCampaigns, useCampaign } from "@/hooks/useCampaigns";
import { useDonate } from "@/hooks/useDonate";
import { useAccount } from "wagmi";
import { useState } from "react";

export default function TestPage() {
  const [testId, setTestId] = useState<string>("1");
  const [donationAmount, setDonationAmount] = useState<string>("0.01");
  
  const { address, isConnected } = useAccount();
  const { campaigns, isLoading: loadingAll, error: errorAll } = useCampaigns();
  const { campaign, isLoading: loadingOne, error: errorOne } = useCampaign(
    testId ? BigInt(testId) : undefined
  );
  const { donate, isPending, isSuccess, hash } = useDonate();

  const handleDonate = () => {
    if (testId && donationAmount) {
      donate(BigInt(testId), donationAmount);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto", backgroundColor: "#ffffff", minHeight: "100vh" }}>
      <h1 style={{ color: "#344e41", fontSize: "2rem", fontWeight: 700, marginBottom: "1rem" }}>Contract Integration Test Page</h1>
      
      <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#fafaf9", border: "1px solid #dad7cd", borderRadius: "0.75rem" }}>
        <h2 style={{ color: "#344e41", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Wallet Status</h2>
        <p style={{ color: "#3a5a40", marginBottom: "0.5rem" }}>Connected: {isConnected ? "✓ Yes" : "✗ No"}</p>
        <p style={{ color: "#3a5a40", fontSize: "0.875rem", wordBreak: "break-all" }}>Address: {address || "Not connected"}</p>
      </section>

      <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#fafaf9", border: "1px solid #dad7cd", borderRadius: "0.75rem" }}>
        <h2 style={{ color: "#344e41", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>All Campaigns (useCampaigns)</h2>
        {loadingAll && <p style={{ color: "#3a5a40" }}>Loading campaigns...</p>}
        {errorAll && <p style={{ color: "#b91c1c" }}>Error: {errorAll.message}</p>}
        {campaigns && (
          <>
            <p style={{ color: "#3a5a40", marginBottom: "1rem" }}>Total campaigns: {campaigns.length}</p>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ border: "1px solid #dad7cd", padding: "1rem", borderRadius: "8px", backgroundColor: "#ffffff" }}>
                  <h3 style={{ color: "#344e41", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>{c.title}</h3>
                  <p style={{ color: "#3a5a40", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{c.description}</p>
                  <p style={{ color: "#588157", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Goal: {c.goalETH} ETH | Raised: {c.raisedETH} ETH | Progress: {c.progress}%</p>
                  <p style={{ color: "#a3b18a", fontSize: "0.875rem" }}>Verified: {c.verified ? "✓" : "○"} | Active: {c.active ? "✓" : "✗"}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#fafaf9", border: "1px solid #dad7cd", borderRadius: "0.75rem" }}>
        <h2 style={{ color: "#344e41", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Single Campaign (useCampaign)</h2>
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="Campaign ID"
          style={{ padding: "0.5rem", marginRight: "1rem", border: "1px solid #dad7cd", borderRadius: "0.5rem", fontSize: "0.875rem" }}
        />
        {loadingOne && <p style={{ color: "#3a5a40", marginTop: "1rem" }}>Loading campaign...</p>}
        {errorOne && <p style={{ color: "#b91c1c", marginTop: "1rem" }}>Error: {errorOne.message}</p>}
        {campaign && (
          <div style={{ border: "1px solid #dad7cd", padding: "1rem", borderRadius: "8px", marginTop: "1rem", backgroundColor: "#ffffff" }}>
            <h3 style={{ color: "#344e41", fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.5rem" }}>{campaign.title}</h3>
            <p style={{ color: "#3a5a40", fontSize: "0.875rem", marginBottom: "0.5rem" }}>{campaign.description}</p>
            <p style={{ color: "#a3b18a", fontSize: "0.875rem", marginBottom: "0.25rem" }}>ID: {campaign.id}</p>
            <p style={{ color: "#a3b18a", fontSize: "0.875rem", marginBottom: "0.25rem", wordBreak: "break-all" }}>Owner: {campaign.owner}</p>
            <p style={{ color: "#588157", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Goal: {campaign.goalETH} ETH</p>
            <p style={{ color: "#588157", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Raised: {campaign.raisedETH} ETH</p>
            <p style={{ color: "#588157", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Progress: {campaign.progress}%</p>
            <p style={{ color: "#a3b18a", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Verified: {campaign.verified ? "✓" : "○"}</p>
            <p style={{ color: "#a3b18a", fontSize: "0.875rem" }}>Active: {campaign.active ? "✓" : "✗"}</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: "2rem", padding: "1.5rem", backgroundColor: "#fafaf9", border: "1px solid #dad7cd", borderRadius: "0.75rem" }}>
        <h2 style={{ color: "#344e41", fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>Make Donation (useDonate)</h2>
        {!isConnected && <p style={{ color: "#d97706", marginBottom: "1rem" }}>⚠ Connect wallet first</p>}
        <div>
          <input
            type="text"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Amount in ETH"
            style={{ padding: "0.5rem", marginRight: "1rem", border: "1px solid #dad7cd", borderRadius: "0.5rem", fontSize: "0.875rem" }}
            disabled={!isConnected}
          />
          <button
            onClick={handleDonate}
            disabled={!isConnected || isPending || !testId || !donationAmount}
            style={{
              padding: "0.5rem 1rem",
              background: isConnected ? "linear-gradient(135deg, #588157 0%, #3a5a40 100%)" : "#dad7cd",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isConnected ? "pointer" : "not-allowed",
              fontWeight: 600,
            }}
          >
            {isPending ? "Processing..." : `Donate to Campaign ${testId}`}
          </button>
        </div>
        {hash && (
          <p style={{ marginTop: "1rem", color: "#3a5a40", fontSize: "0.875rem" }}>
            Transaction: <code style={{ backgroundColor: "#fafaf9", padding: "0.25rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", wordBreak: "break-all" }}>{hash}</code>
          </p>
        )}
        {isSuccess && (
          <p style={{ color: "#588157", marginTop: "1rem", fontWeight: 600 }}>
            ✓ Donation successful!
          </p>
        )}
      </section>
    </div>
  );
}
