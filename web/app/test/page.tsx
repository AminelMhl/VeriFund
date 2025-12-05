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
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>🧪 Contract Integration Test Page</h1>
      
      <section style={{ marginTop: "2rem" }}>
        <h2>Wallet Status</h2>
        <p>Connected: {isConnected ? "✅ Yes" : "❌ No"}</p>
        <p>Address: {address || "Not connected"}</p>
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>All Campaigns (useCampaigns)</h2>
        {loadingAll && <p>Loading campaigns...</p>}
        {errorAll && <p style={{ color: "red" }}>Error: {errorAll.message}</p>}
        {campaigns && (
          <>
            <p>Total campaigns: {campaigns.length}</p>
            <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
              {campaigns.map((c) => (
                <div key={c.id} style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
                  <h3>{c.title}</h3>
                  <p>{c.description}</p>
                  <p>Goal: {c.goalETH} ETH | Raised: {c.raisedETH} ETH | Progress: {c.progress}%</p>
                  <p>Verified: {c.verified ? "✅" : "⏳"} | Active: {c.active ? "✅" : "❌"}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Single Campaign (useCampaign)</h2>
        <input
          type="text"
          value={testId}
          onChange={(e) => setTestId(e.target.value)}
          placeholder="Campaign ID"
          style={{ padding: "0.5rem", marginRight: "1rem" }}
        />
        {loadingOne && <p>Loading campaign...</p>}
        {errorOne && <p style={{ color: "red" }}>Error: {errorOne.message}</p>}
        {campaign && (
          <div style={{ border: "1px solid #ccc", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
            <h3>{campaign.title}</h3>
            <p>{campaign.description}</p>
            <p>ID: {campaign.id}</p>
            <p>Owner: {campaign.owner}</p>
            <p>Goal: {campaign.goalETH} ETH</p>
            <p>Raised: {campaign.raisedETH} ETH</p>
            <p>Progress: {campaign.progress}%</p>
            <p>Verified: {campaign.verified ? "✅" : "⏳"}</p>
            <p>Active: {campaign.active ? "✅" : "❌"}</p>
          </div>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Make Donation (useDonate)</h2>
        {!isConnected && <p style={{ color: "orange" }}>⚠️ Connect wallet first</p>}
        <div>
          <input
            type="text"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="Amount in ETH"
            style={{ padding: "0.5rem", marginRight: "1rem" }}
            disabled={!isConnected}
          />
          <button
            onClick={handleDonate}
            disabled={!isConnected || isPending || !testId || !donationAmount}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: isConnected ? "#0070f3" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isConnected ? "pointer" : "not-allowed",
            }}
          >
            {isPending ? "Processing..." : `Donate to Campaign ${testId}`}
          </button>
        </div>
        {hash && (
          <p style={{ marginTop: "1rem" }}>
            Transaction: <code>{hash}</code>
          </p>
        )}
        {isSuccess && (
          <p style={{ color: "green", marginTop: "1rem" }}>
            ✅ Donation successful!
          </p>
        )}
      </section>
    </div>
  );
}
