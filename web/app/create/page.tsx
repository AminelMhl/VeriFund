"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../lib/contract";
import Header from "@/components/Header";

export default function CreateCampaign() {
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");

  const { writeContract, isPending } = useWriteContract();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // temporary metadata (later we put on IPFS)
    const metadata = {
      title,
      description: "Temporary description",
      createdAt: Date.now()
    };

    const metadataURI = "data:application/json," + JSON.stringify(metadata);

    // goal in wei
    const goalWei = (Number(goal) * 1e18).toString();

    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "createCampaign",
      args: [metadataURI, goalWei]
    });
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "3rem 1.5rem", backgroundColor: "#ffffff", minHeight: "calc(100vh - 73px)" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#344e41", marginBottom: "0.5rem" }}>Create New Campaign</h1>
        <p style={{ fontSize: "1rem", color: "#3a5a40", marginBottom: "2rem", lineHeight: 1.6 }}>Start a verified charity campaign on the blockchain.</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#344e41", marginBottom: "0.5rem" }}>Campaign Title</label>
            <input
              placeholder="Enter campaign title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "1px solid #dad7cd",
                borderRadius: "0.5rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "#344e41", marginBottom: "0.5rem" }}>Goal Amount (ETH)</label>
            <input
              placeholder="0.00"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              type="number"
              step="0.01"
              min="0.01"
              required
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "1px solid #dad7cd",
                borderRadius: "0.5rem",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          <button 
            type="submit" 
            disabled={isPending || !title || !goal}
            style={{
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              background: isPending || !title || !goal ? "#dad7cd" : "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isPending || !title || !goal ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {isPending ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </main>
    </>
  );
}
