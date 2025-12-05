"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { ethToWei } from "@/lib/utils";
import type { UseDonateReturn } from "@/types/campaign";

/**
 * Hook to handle campaign donations
 * Manages transaction state and confirmation
 */
export function useDonate(): UseDonateReturn {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Make a donation to a campaign
   * @param campaignId Campaign ID
   * @param amountETH Amount in ETH (as string)
   */
  const donate = (campaignId: bigint, amountETH: string) => {
    const amountWei = ethToWei(amountETH);
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI as any,
      functionName: "donateToCampaign",
      args: [campaignId],
      value: amountWei,
    });
  };

  return {
    donate,
    isPending: isWritePending || isConfirming,
    isSuccess,
    error: writeError as Error | null,
    hash,
  };
}
