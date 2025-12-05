"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "@/lib/contract";
import { ethToWei } from "@/lib/utils";
import type { UseDonateReturn } from "@/types/campaign";

/**
 * Parse contract errors into user-friendly messages
 * @param error The error object from wagmi
 * @returns User-friendly error message
 */
function parseContractError(error: Error | null): string | null {
  if (!error) return null;

  const errorMessage = error.message.toLowerCase();

  // User rejected transaction
  if (
    errorMessage.includes("user rejected") ||
    errorMessage.includes("user denied") ||
    errorMessage.includes("user cancelled")
  ) {
    return "Transaction was cancelled.";
  }

  // Insufficient funds
  if (
    errorMessage.includes("insufficient funds") ||
    errorMessage.includes("insufficient balance")
  ) {
    return "Insufficient funds in your wallet to complete this transaction.";
  }

  // Campaign-specific errors
  if (errorMessage.includes("campaign not found")) {
    return "Campaign not found. It may have been removed.";
  }

  if (
    errorMessage.includes("campaign not verified") ||
    errorMessage.includes("not verified")
  ) {
    return "This campaign has not been verified yet and cannot receive donations.";
  }

  if (
    errorMessage.includes("campaign not active") ||
    errorMessage.includes("not active")
  ) {
    return "This campaign is no longer accepting donations.";
  }

  if (errorMessage.includes("donation amount must be greater than zero")) {
    return "Donation amount must be greater than zero.";
  }

  // Network errors
  if (
    errorMessage.includes("network") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  ) {
    return "Network error. Please check your connection and try again.";
  }

  // Gas estimation failed
  if (errorMessage.includes("gas")) {
    return "Transaction failed during gas estimation. Please check your wallet balance and try again.";
  }

  // Generic fallback
  return "Transaction failed. Please try again.";
}

/**
 * Hook to handle campaign donations
 * Manages transaction state and confirmation with user-friendly error handling
 */
export function useDonate(): UseDonateReturn {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
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

  // Parse the error for user-friendly message
  const parsedError = writeError ? parseContractError(writeError) : null;

  return {
    donate,
    isPending: isWritePending,
    isConfirming,
    isSuccess,
    error: parsedError,
    hash,
    reset: resetWrite,
  };
}
