"use client";

import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { CONTRACT_ABI, getContractAddress } from "../../lib/contract";
import Header from "@/components/Header";

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
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const {
    data: ownerAddress,
    isLoading: isLoadingOwner,
    error: ownerError,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: contractAddress,
    functionName: "owner",
  });

  const {
    data: nextCampaignId,
    isLoading: isLoadingCount,
    error: countError,
  } = useReadContract({
    abi: CONTRACT_ABI,
    address: contractAddress,
    functionName: "nextCampaignId",
  });

  const totalCampaigns =
    typeof nextCampaignId === "bigint" ? Number(nextCampaignId) - 1 : 0;

  const campaignContracts = useMemo(() => {
    if (!nextCampaignId || totalCampaigns <= 0) return [];

    return Array.from({ length: totalCampaigns }, (_v, i) => ({
      abi: CONTRACT_ABI,
      address: contractAddress,
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

  const [isClient, setIsClient] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAdmin =
    address &&
    typeof ownerAddress === "string" &&
    address.toLowerCase() === ownerAddress.toLowerCase();

  const handleApprove = (id: bigint) => {
    setLastAction(`approve-${id.toString()}`);
    writeContract({
      abi: CONTRACT_ABI,
      address: contractAddress,
      functionName: "approveCampaign",
      args: [id],
    });
  };

  const handleClose = (id: bigint) => {
    setLastAction(`close-${id.toString()}`);
    writeContract({
      abi: CONTRACT_ABI,
      address: contractAddress,
      functionName: "closeCampaign",
      args: [id],
    });
  };

  const loading =
    isLoadingOwner || isLoadingCount || isLoadingCampaigns || isWriting;

  if (!isClient) {
    return (
      <>
        <Header />
        <main
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            padding: "3rem 1.5rem",
            backgroundColor: "#ffffff",
            minHeight: "calc(100vh - 73px)",
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
            color: "#1f2933",
          }}
        >
          <h1
            style={{
              fontSize: 26,
              marginBottom: 8,
              fontWeight: 600,
              letterSpacing: 0.5,
              color: "#344e41",
            }}
          >
            Admin Dashboard
          </h1>
          <p
            style={{
              fontSize: 14,
              color: "#6c757d",
            }}
          >
            Loading admin dashboard...
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: "3rem 1.5rem",
          backgroundColor: "#ffffff",
          minHeight: "calc(100vh - 73px)",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          color: "#1f2933",
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
              border: "1px solid #dad7cd",
              backgroundColor: "#f6f7f2",
              minWidth: 260,
            }}
          >
            {address && (
              <>
                <div
                  style={{
                    fontSize: 12,
                    color: "#6c757d",
                    marginBottom: 4,
                  }}
                >
                  Connected as
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#1f2933",
                    wordBreak: "break-all",
                  }}
                >
                  <code>{address}</code>
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#6c757d",
                    marginTop: 8,
                  }}
                >
                  Contract owner
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#1f2933",
                    wordBreak: "break-all",
                  }}
                >
                  {typeof ownerAddress === "string" ? (
                    <code>{ownerAddress}</code>
                  ) : isLoadingOwner ? (
                    "Loading owner from contract..."
                  ) : ownerError ? (
                    "Failed to load owner (is node running?)."
                  ) : (
                    "Owner not available."
                  )}
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
                      backgroundColor: isAdmin ? "#2e7d32" : "#f97373",
                    }}
                  />
                  <span
                    style={{
                      color: isAdmin ? "#2e7d32" : "#b91c1c",
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
                  color: "#6c757d",
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
              fontSize: 14,
              color: "#3a5a40",
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
              color: "#15803d",
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
            color: "#344e41",
          }}
        >
          Campaigns
        </h2>

        {totalCampaigns === 0 && (
          <p
            style={{
              fontSize: 13,
              color: "#6c757d",
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
          {(campaignsData as RawCampaign[] | undefined)?.map(
            (campaign, index) => {
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
                    border: "1px solid #dad7cd",
                    backgroundColor: "#ffffff",
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
                        color: "#344e41",
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
                            ? "rgba(22,163,74,0.08)"
                            : "rgba(252,211,77,0.12)",
                          color: verified ? "#166534" : "#b45309",
                          border: verified
                            ? "1px solid rgba(22,163,74,0.35)"
                            : "1px solid rgba(252,211,77,0.35)",
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
                            ? "rgba(59,130,246,0.08)"
                            : "rgba(148,163,184,0.12)",
                          color: active ? "#1d4ed8" : "#4b5563",
                          border: active
                            ? "1px solid rgba(59,130,246,0.3)"
                            : "1px solid rgba(148,163,184,0.4)",
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
                            color: "#111827",
                          }}
                        >
                          {metadata.title}
                        </p>
                      )}
                      {metadata.description && (
                        <p
                          style={{
                            fontSize: 12,
                            color: "#6c757d",
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
                        color: "#6c757d",
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
                          color: "#6c757d",
                        }}
                      >
                        Goal
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#111827",
                        }}
                      >
                        {goalEth} ETH
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          color: "#6c757d",
                        }}
                      >
                        Raised
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#15803d",
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
                      color: "#6c757d",
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
                            color: "#ffffff",
                            background:
                              "linear-gradient(135deg, #588157 0%, #3a5a40 100%)",
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
                            color: "#b91c1c",
                            backgroundColor: "#fef2f2",
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
            }
          )}
        </div>
      </main>
    </>
  );
}
