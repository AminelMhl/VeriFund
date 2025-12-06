"use client";

import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../lib/contract";

export default function CreateCampaign() {
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

    // temporary metadata (later we can put on IPFS)
    const metadata = {
      title,
      description,
      goalEth: goal,
      createdAt: Date.now(),
    };

    const metadataURI = "data:application/json," + JSON.stringify(metadata);

    // goal in wei (simple conversion from ETH)
    const goalWei = (Number(goal) * 1e18).toString();

    try {
      writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "createCampaign",
        args: [metadataURI, goalWei],
      });
      setTitle("");
      setDescription("");
      setGoal("");
    } catch (_err) {
      setErrorMessage("Failed to send transaction.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        background: "radial-gradient(circle at top, #0f172a 0, #020617 55%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          padding: 24,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.98), rgba(15,23,42,0.92))",
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.9), 0 0 0 1px rgba(148, 163, 184, 0.25)",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <h1
            style={{
              fontSize: 28,
              marginBottom: 6,
              fontWeight: 600,
              letterSpacing: 0.4,
              color: "#f9fafb",
            }}
          >
            Create New Campaign
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#94a3b8",
            }}
          >
            Define your fundraising goal and tell donors what your campaign is
            about.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#cbd5f5",
              }}
            >
              Title
            </label>
            <input
              placeholder="Education fund, disaster relief..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                padding: "9px 11px",
                borderRadius: 10,
                border: "1px solid rgba(148, 163, 184, 0.4)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#cbd5f5",
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe how the funds will be used and who they help."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                padding: "9px 11px",
                borderRadius: 10,
                border: "1px solid rgba(148, 163, 184, 0.4)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                resize: "vertical",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#cbd5f5",
              }}
            >
              Goal (ETH)
            </label>
            <input
              placeholder="e.g. 5"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              type="number"
              step="0.01"
              style={{
                padding: "9px 11px",
                borderRadius: 10,
                border: "1px solid rgba(148, 163, 184, 0.4)",
                backgroundColor: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#64748b",
              }}
            >
              This will be converted to wei on-chain.
            </span>
          </div>

          <button
            type="submit"
            disabled={isPending}
            style={{
              marginTop: 8,
              padding: "9px 12px",
              borderRadius: 999,
              border: "none",
              fontSize: 14,
              fontWeight: 500,
              color: "#0f172a",
              background:
                "linear-gradient(135deg, #22c55e 0%, #a3e635 45%, #22c55e 100%)",
              cursor: isPending ? "default" : "pointer",
              opacity: isPending ? 0.8 : 1,
              boxShadow: "0 10px 25px rgba(34, 197, 94, 0.35)",
            }}
          >
            {isPending ? "Creating campaign..." : "Create campaign"}
          </button>
        </form>

        {errorMessage && (
          <p
            style={{
              color: "#f97373",
              marginTop: 14,
              fontSize: 13,
            }}
          >
            {errorMessage}
          </p>
        )}

        {error && (
          <p
            style={{
              color: "#f97373",
              marginTop: 14,
              fontSize: 13,
            }}
          >
            {(error as Error).message || "Transaction failed."}
          </p>
        )}

        {data && !isPending && (
          <p
            style={{
              color: "#4ade80",
              marginTop: 14,
              fontSize: 13,
            }}
          >
            Campaign creation transaction sent. Tx hash:{" "}
            <code style={{ color: "#a5b4fc" }}>{data as string}</code>
          </p>
        )}
      </div>
    </div>
  );
}
