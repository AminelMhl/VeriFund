"use client";

import { useReadContract } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../lib/contract";

function stringifyBigInt(value: unknown) {
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
}

export default function Test() {
  const { data: campaign, error, isLoading } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "getCampaign",
    args: [1],
    // Avoid infinite retries when the campaign doesn't exist and reverts.
    query: {
      retry: 0,
    },
  });

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Contract</h1>

      {isLoading && <p>Loading campaign 1...</p>}

      {error && (
        <p style={{ color: "red" }}>
          No campaign found for ID 1 (or contract reverted).
        </p>
      )}

      {campaign && <pre>{stringifyBigInt(campaign)}</pre>}
    </div>
  );
}
