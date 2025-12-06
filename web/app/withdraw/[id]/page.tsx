"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useParams } from "next/navigation";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../../lib/contract";

export default function WithdrawPage() {
  const params = useParams<{ id: string }>();
  const campaignIdParam = params?.id;
  const campaignId = campaignIdParam ? Number(campaignIdParam) : NaN;

  const { address } = useAccount();
  const [amountEth, setAmountEth] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    data: campaign,
    error: campaignError,
    isLoading: isLoadingCampaign,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getCampaign",
    args: [campaignId],
    query: {
      enabled: !Number.isNaN(campaignId),
      retry: 0,
    },
  });

  const {
    writeContract,
    data: txHash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const handleWithdraw = (e: any) => {
    e.preventDefault();
    setErrorMessage("");

    if (Number.isNaN(campaignId)) {
      setErrorMessage("Invalid campaign ID.");
      return;
    }

    if (!address) {
      setErrorMessage("Connect your wallet first.");
      return;
    }

    if (!amountEth) {
      setErrorMessage("Enter an amount to withdraw.");
      return;
    }

    const amountWei = (Number(amountEth) * 1e18).toString();

    try {
      writeContract({
        abi: CONTRACT_ABI,
        address: CONTRACT_ADDRESS,
        functionName: "withdraw",
        args: [BigInt(campaignId), amountWei],
      });
    } catch {
      setErrorMessage("Failed to send withdraw transaction.");
    }
  };

  const isOwner =
    campaign &&
    Array.isArray(campaign) &&
    typeof campaign[1] === "string" &&
    address &&
    (campaign[1] as string).toLowerCase() === address.toLowerCase();

  let raisedEth = 0;
  if (campaign && Array.isArray(campaign)) {
    const raised = campaign[4] as bigint | number;
    raisedEth =
      typeof raised === "bigint"
        ? Number(raised) / 1e18
        : Number(raised || 0) / 1e18;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
        background: "radial-gradient(circle at top, #020617 0, #020617 55%)",
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
          border: "1px solid rgba(148, 163, 184, 0.3)",
          backgroundColor: "rgba(15, 23, 42, 0.98)",
          boxShadow:
            "0 18px 45px rgba(15, 23, 42, 0.9), 0 0 0 1px rgba(148, 163, 184, 0.25)",
        }}
      >
        <div style={{ marginBottom: 16 }}>
          <h1
            style={{
              fontSize: 24,
              marginBottom: 6,
              fontWeight: 600,
              color: "#f9fafb",
            }}
          >
            Withdraw Funds
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            Transfer collected donations from the campaign safely to your
            wallet.
          </p>
        </div>

        <p
          style={{
            fontSize: 12,
            color: "#64748b",
            marginBottom: 8,
          }}
        >
          Campaign ID:{" "}
          <strong style={{ color: "#e5e7eb" }}>{campaignIdParam}</strong>
        </p>

        {isLoadingCampaign && (
          <p
            style={{
              fontSize: 13,
              color: "#e5e7eb",
              marginBottom: 8,
            }}
          >
            Loading campaign...
          </p>
        )}

        {campaignError && (
          <p
            style={{
              color: "#f97373",
              marginBottom: 10,
              fontSize: 13,
            }}
          >
            Failed to load campaign: {(campaignError as Error).message}
          </p>
        )}

        {campaign && (
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(148, 163, 184, 0.35)",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                marginBottom: 4,
              }}
            >
              Campaign Owner
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#e5e7eb",
                wordBreak: "break-all",
              }}
            >
              <code>{(campaign as any)[1] as string}</code>
            </p>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                marginTop: 8,
              }}
            >
              Total Raised:{" "}
              <span
                style={{
                  color: "#22c55e",
                  fontWeight: 500,
                }}
              >
                {raisedEth} ETH
              </span>
            </p>
          </div>
        )}

        {campaign && !isOwner && (
          <p
            style={{
              color: "#f97373",
              fontSize: 13,
              marginTop: 8,
            }}
          >
            You are not the owner of this campaign and cannot withdraw funds.
          </p>
        )}

        {campaign && isOwner && (
          <form
            onSubmit={handleWithdraw}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginTop: 12,
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
                Amount to withdraw (ETH)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 1.25"
                value={amountEth}
                onChange={(e) => setAmountEth(e.target.value)}
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
                Must be less than or equal to the total raised amount.
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              style={{
                marginTop: 4,
                padding: "9px 12px",
                borderRadius: 999,
                border: "1px solid rgba(239,68,68,0.85)",
                fontSize: 14,
                fontWeight: 500,
                color: "#fecaca",
                background:
                  "linear-gradient(135deg, rgba(248,113,113,0.18), rgba(248,113,113,0.28))",
                cursor: isPending ? "default" : "pointer",
                opacity: isPending ? 0.85 : 1,
              }}
            >
              {isPending ? "Withdrawing..." : "Withdraw"}
            </button>
          </form>
        )}

        {errorMessage && (
          <p
            style={{
              color: "#f97373",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            {errorMessage}
          </p>
        )}

        {writeError && (
          <p
            style={{
              color: "#f97373",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            {(writeError as Error).message || "Transaction failed."}
          </p>
        )}

        {txHash && !isPending && (
          <p
            style={{
              color: "#4ade80",
              marginTop: 12,
              fontSize: 13,
            }}
          >
            Withdraw transaction sent. Tx hash:{" "}
            <code style={{ color: "#a5b4fc" }}>{txHash as string}</code>
          </p>
        )}
      </div>
    </div>
  );
}
