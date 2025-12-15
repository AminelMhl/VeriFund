"use client";

import { useChainId, useReadContracts } from "wagmi";
import { CONTRACT_ABI, getContractAddress } from "@/lib/contract";
import { formatCampaign } from "@/lib/utils";
import type { RawCampaign, UseCampaignsReturn, UseCampaignReturn } from "@/types/campaign";

/**
 * Hook to fetch all campaigns from the contract
 * Uses batch reading for efficiency
 */
export function useCampaigns(): UseCampaignsReturn {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  // First, get the next campaign ID to know how many campaigns exist
  const { data: nextIdData } = useReadContracts({
    contracts: [
      {
        address: contractAddress,
        abi: CONTRACT_ABI as any,
        functionName: "nextCampaignId",
      },
    ],
  });

  const nextId = nextIdData?.[0]?.result as bigint | undefined;
  const totalCampaigns = nextId ? Number(nextId) - 1 : 0;

  // Build array of contract calls for all campaigns
  const campaignCalls = Array.from({ length: totalCampaigns }, (_, i) => ({
    address: contractAddress,
    abi: CONTRACT_ABI as any,
    functionName: "getCampaign",
    args: [BigInt(i + 1)],
  }));

  // Batch fetch all campaigns
  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: campaignCalls as any,
  });

  // Format campaigns
  const campaigns = campaignsData
    ?.map((result: any) => {
      if (result.status === "success" && result.result) {
        const raw = result.result as unknown as RawCampaign;
        return formatCampaign(raw);
      }
      return null;
    })
    .filter((c: any): c is NonNullable<typeof c> => c !== null);

  return {
    campaigns,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to fetch a single campaign by ID
 * @param campaignId Campaign ID to fetch
 */
export function useCampaign(campaignId: bigint | undefined): UseCampaignReturn {
  const chainId = useChainId();
  const contractAddress = getContractAddress(chainId);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useReadContracts({
    contracts: campaignId
      ? [
          {
            address: contractAddress,
            abi: CONTRACT_ABI as any,
            functionName: "getCampaign",
            args: [campaignId],
          },
        ]
      : [],
  });

  const campaign = data?.[0]?.status === "success" && data[0].result
    ? formatCampaign(data[0].result as unknown as RawCampaign)
    : undefined;

  return {
    campaign,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
