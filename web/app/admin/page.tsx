"use client";

import { useMemo, useState } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../../lib/contract";

const METADATA_PREFIX = "data:application/json,";

function decodeMetadata(metadataURI: string) {
  if (!metadataURI || !metadataURI.startsWith(METADATA_PREFIX)) {
    return null;
  }

  try {
    const json = metadataURI.slice(METADATA_PREFIX.length);
    return JSON.parse(json) as { title?: string; description?: string };
  } catch {
    return null;
  }
}

type RawCampaign = readonly [
  bigint,
  `0x${string}`,
  string,
  bigint,
  bigint,
  boolean,
  boolean,
  bigint
];

export default function AdminDashboard() {
  const { address } = useAccount();

  const {
    data: ownerAddress,
    isLoading: isLoadingOwner,
    error: ownerError,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "owner",
  });

  const {
    data: nextCampaignId,
    isLoading: isLoadingCount,
    error: countError,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: CONTRACT_ADDRESS,
    functionName: "nextCampaignId",
  });

  const totalCampaigns =
    typeof nextCampaignId === "bigint" ? Number(nextCampaignId) - 1 : 0;

  const campaignContracts = useMemo(() => {
    if (!nextCampaignId || totalCampaigns <= 0) return [];

    return Array.from({ length: totalCampaigns }, (_v, i) => ({
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "getCampaign" as const,
      args: [BigInt(i + 1)],
    }));
  }, [nextCampaignId, totalCampaigns]);

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    error: campaignsError,
  } = useReadContracts({
    contracts: campaignContracts,
    query: {
      enabled: campaignContracts.length > 0,
    },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const [lastAction, setLastAction] = useState<string | null>(null);

  const isAdmin =
    address &&
    typeof ownerAddress === "string" &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  const handleApprove = (id: bigint) => {
    setLastAction(`approve-${id.toString()}`);
    writeContract({
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "approveCampaign",
      args: [id],
    });
  };

  const handleClose = (id: bigint) => {
    setLastAction(`close-${id.toString()}`);
    writeContract({
      abi: CONTRACT_ABI,
      address: CONTRACT_ADDRESS,
      functionName: "closeCampaign",
      args: [id],
    });
  };

  const loading =
    isLoadingOwner || isLoadingCount || isLoadingCampaigns || isWriting;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "radial-gradient(circle at top, #020617 0, #020617 55%)",
        color: "#e5e7eb",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 26,
                marginBottom: 6,
                fontWeight: 600,
                letterSpacing: 0.5,
                color: "#f9fafb",
              }}
            >
              Admin Dashboard
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "#94a3b8",
              }}
            >
              Review campaigns, verify trusted organizations and close campaigns
              when needed.
            </p>
          </div>

          <div
            style={{
              padding: 10,
              borderRadius: 12,
              border: "1px solid rgba(148, 163, 184, 0.4)",
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              minWidth: 220,
            }}
          >
            {address && ownerAddress && (
              <>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginBottom: 4,
                  }}
                >
                  Connected as
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#e5e7eb",
                    wordBreak: "break-all",
                  }}
                >
                  <code>{address}</code>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#64748b",
                    marginTop: 8,
                  }}
                >
                  Contract owner
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#e5e7eb",
                    wordBreak: "break-all",
                  }}
                >
                  <code>{ownerAddress as string}</code>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: isAdmin ? "#22c55e" : "#f97373",
                    }}
                  />
                  <span
                    style={{
                      color: isAdmin ? "#bbf7d0" : "#fecaca",
                      fontWeight: 500,
                    }}
                  >
                    {isAdmin ? "Admin (owner)" : "Not admin"}
                  </span>
                </div>
              </>
            )}
            {!address && (
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                You can browse all campaigns without connecting. Connect a
                wallet only if you need to verify or close campaigns.
              </p>
            )}
          </div>
        </header>

        {loading && (
          <p
            style={{
              fontSize: 13,
              color: "#e5e7eb",
              marginBottom: 12,
            }}
          >
            Loading data or sending transaction...
          </p>
        )}

        {ownerError && (
          <p
            style={{
              color: "#f97373",
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            Failed to load contract owner: {(ownerError as Error).message}
          </p>
        )}

        {countError && (
          <p
            style={{
              color: "#f97373",
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            Failed to load campaigns count: {(countError as Error).message}
          </p>
        )}

        {campaignsError && (
          <p
            style={{
              color: "#f97373",
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            Failed to load campaigns: {(campaignsError as Error).message}
          </p>
        )}

        {writeError && (
          <p
            style={{
              color: "#f97373",
              marginBottom: 8,
              fontSize: 13,
            }}
          >
            Transaction error: {(writeError as Error).message}
          </p>
        )}

        {txHash && !isWriting && (
          <p
            style={{
              color: "#4ade80",
              marginBottom: 16,
              fontSize: 13,
            }}
          >
            {lastAction
              ? `Action "${lastAction}" transaction sent.`
              : "Transaction sent."}{" "}
            Tx hash:{" "}
            <code style={{ color: "#a5b4fc" }}>{txHash as string}</code>
          </p>
        )}

        <h2
          style={{
            marginTop: 12,
            marginBottom: 10,
            fontSize: 16,
            fontWeight: 600,
            color: "#e5e7eb",
          }}
        >
          Campaigns
        </h2>

        {totalCampaigns === 0 && (
          <p
            style={{
              fontSize: 13,
              color: "#94a3b8",
            }}
          >
            No campaigns created yet.
          </p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 14,
            marginTop: 4,
          }}
        >
          {campaignsData &&
            campaignsData.map((item, index) => {
              const campaign = item as RawCampaign;
              const [id, owner, metadataURI, goal, raised, verified, active] =
                campaign;

              const metadata = decodeMetadata(metadataURI);

              const goalEth =
                typeof goal === "bigint"
                  ? Number(goal) / 1e18
                  : Number(goal || 0) / 1e18;
              const raisedEth =
                typeof raised === "bigint"
                  ? Number(raised) / 1e18
                  : Number(raised || 0) / 1e18;

              return (
                <div
                  key={id.toString() + "-" + index}
                  style={{
                    borderRadius: 14,
                    border: "1px solid rgba(148, 163, 184, 0.35)",
                    backgroundColor: "rgba(15, 23, 42, 0.98)",
                    padding: 14,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <h3
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#e5e7eb",
                      }}
                    >
                      Campaign #{id.toString()}
                    </h3>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          backgroundColor: verified
                            ? "rgba(34,197,94,0.16)"
                            : "rgba(251,191,36,0.12)",
                          color: verified ? "#4ade80" : "#facc15",
                          border: verified
                            ? "1px solid rgba(34,197,94,0.35)"
                            : "1px solid rgba(250,204,21,0.35)",
                        }}
                      >
                        {verified ? "Verified" : "Unverified"}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 999,
                          backgroundColor: active
                            ? "rgba(59,130,246,0.15)"
                            : "rgba(148,163,184,0.16)",
                          color: active ? "#60a5fa" : "#cbd5f5",
                          border: active
                            ? "1px solid rgba(59,130,246,0.4)"
                            : "1px solid rgba(148,163,184,0.5)",
                        }}
                      >
                        {active ? "Active" : "Closed"}
                      </span>
                    </div>
                  </div>

                  {metadata && (
                    <div style={{ marginTop: 2 }}>
                      {metadata.title && (
                        <p
                          style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: "#f9fafb",
                          }}
                        >
                          {metadata.title}
                        </p>
                      )}
                      {metadata.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#94a3b8",
                            marginTop: 2,
                          }}
                        >
                          {metadata.description}
                        </p>
                      )}
                    </div>
                  )}

                  {!metadata && (
                    <p
                      style={{
                        fontSize: 11,
                        color: "#94a3b8",
                      }}
                    >
                      <strong>Metadata URI:</strong> {metadataURI}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        Goal
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#e5e7eb",
                        }}
                      >
                        {goalEth} ETH
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#64748b",
                        }}
                      >
                        Raised
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#22c55e",
                        }}
                      >
                        {raisedEth} ETH
                      </div>
                    </div>
                  </div>

                  <p
                    style={{
                      marginTop: 4,
                      fontSize: 11,
                      color: "#64748b",
                      wordBreak: "break-all",
                    }}
                  >
                    <strong style={{ color: "#94a3b8" }}>Owner:</strong>{" "}
                    <code>{owner}</code>
                  </p>

                  {isAdmin && (
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        marginTop: 8,
                      }}
                    >
                      {!verified && (
                        <button
                          onClick={() => handleApprove(id)}
                          disabled={isWriting}
                          style={{
                            flex: 1,
                            padding: "7px 10px",
                            borderRadius: 999,
                            border: "none",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#0f172a",
                            background:
                              "linear-gradient(135deg, #22c55e, #a3e635)",
                            cursor: isWriting ? "default" : "pointer",
                            opacity:
                              isWriting && lastAction?.startsWith("approve-")
                                ? 0.85
                                : 1,
                          }}
                        >
                          {isWriting && lastAction?.startsWith("approve-")
                            ? "Approving..."
                            : "Approve"}
                        </button>
                      )}
                      {active && (
                        <button
                          onClick={() => handleClose(id)}
                          disabled={isWriting}
                          style={{
                            flex: 1,
                            padding: "7px 10px",
                            borderRadius: 999,
                            border: "1px solid rgba(239,68,68,0.75)",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#fecaca",
                            backgroundColor: "rgba(30,64,175,0.15)",
                            cursor: isWriting ? "default" : "pointer",
                            opacity:
                              isWriting && lastAction?.startsWith("close-")
                                ? 0.85
                                : 1,
                          }}
                        >
                          {isWriting && lastAction?.startsWith("close-")
                            ? "Closing..."
                            : "Close"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
