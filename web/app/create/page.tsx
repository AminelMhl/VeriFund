"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../lib/contract";

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
    <div style={{ padding: 20 }}>
      <h1>Create New Campaign</h1>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Campaign Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Goal (ETH)"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          type="number"
          step="0.01"
        />

        <button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Campaign"}
        </button>
      </form>
    </div>
  );
}
