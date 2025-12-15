"use client";

import { useState } from "react";
import { useAccount, useChainId, useWriteContract } from "wagmi";
import { CONTRACT_ABI, getContractAddress } from "../../lib/contract";
import { ethToWei } from "@/lib/utils";
import Header from "@/components/Header";

export default function CreateCampaign() {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);
  const { address } = useAccount();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { writeContract, data, error, isPending } = useWriteContract();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setErrorMessage("");

    if (!title || !description || !goal) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!address) {
      setErrorMessage("Connect your wallet first.");
      return;
    }

    // temporary metadata (later we can put on IPFS)
    const metadata = {
      title,
      description,
      goalEth: goal,
      createdAt: Date.now(),
    };

    const metadataURI = "data:application/json," + JSON.stringify(metadata);

    // goal in wei (as bigint)
    const targetAmount = ethToWei(goal);

    // For now, use the connected wallet as the beneficiary and
    // create a single milestone that represents the full goal.
    const beneficiary = address as `0x${string}`;
    const milestoneAmounts = [targetAmount];
    const milestoneDescriptions = ["Full campaign"];

    writeContract({
      address: contractAddress,
      abi: CONTRACT_ABI as any,
      functionName: "createCampaign",
      args: [beneficiary, metadataURI, targetAmount, milestoneAmounts, milestoneDescriptions],
    });

    setTitle("");
    setDescription("");
    setGoal("");
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
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#344e41",
                marginBottom: "0.5rem",
              }}
            >
              Campaign Description
            </label>
            <textarea
              placeholder="Describe the purpose of this campaign, who it helps, and how the funds will be used."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "1px solid #dad7cd",
                borderRadius: "0.5rem",
                outline: "none",
                resize: "vertical",
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
            disabled={isPending || !title || !description || !goal}
            style={{
              padding: "1rem 2rem",
              fontSize: "1rem",
              fontWeight: 600,
              color: "#ffffff",
              background: isPending || !title || !description || !goal ? "#dad7cd" : "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isPending || !title || !description || !goal ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
          >
            {isPending ? "Creating..." : "Create Campaign"}
          </button>

          {(errorMessage || error) && (
            <p
              style={{
                marginTop: "1rem",
                fontSize: "0.875rem",
                color: "#b91c1c",
              }}
            >
              {errorMessage || (error as Error).message}
            </p>
          )}
        </form>
      </main>
    </>
  );
}
