import { formatEther, parseEther } from "viem";
import type { RawCampaign, CampaignMetadata, FormattedCampaign } from "@/types/campaign";

/**
 * Convert wei (bigint) to ETH (string)
 * @param wei Amount in wei
 * @param decimals Number of decimal places (default 4)
 * @returns Formatted ETH string
 */
export function weiToETH(wei: bigint, decimals: number = 4): string {
  const eth = formatEther(wei);
  return parseFloat(eth).toFixed(decimals);
}

/**
 * Convert ETH (string) to wei (bigint)
 * @param eth Amount in ETH
 * @returns Amount in wei as bigint
 */
export function ethToWei(eth: string): bigint {
  return parseEther(eth);
}

/**
 * Calculate progress percentage
 * @param raised Amount raised in wei
 * @param goal Goal amount in wei
 * @returns Percentage (0-100)
 */
export function calculateProgress(raised: bigint, goal: bigint): number {
  if (goal === 0n) return 0;
  const progress = (Number(raised) / Number(goal)) * 100;
  return Math.min(Math.round(progress), 100);
}

/**
 * Parse metadataURI to extract campaign metadata
 * @param metadataURI URI string (e.g., "data:application/json,{...}")
 * @returns Parsed metadata object
 */
export function parseMetadata(metadataURI: string): CampaignMetadata {
  try {
    // Handle data URI format: "data:application/json,{...}"
    if (metadataURI.startsWith("data:application/json,")) {
      const jsonString = metadataURI.replace("data:application/json,", "");
      const parsed = JSON.parse(jsonString);
      return {
        title: parsed.title || "Untitled Campaign",
        description: parsed.description || "No description available",
        createdAt: parsed.createdAt,
      };
    }
    
    // Handle plain JSON string
    const parsed = JSON.parse(metadataURI);
    return {
      title: parsed.title || "Untitled Campaign",
      description: parsed.description || "No description available",
      createdAt: parsed.createdAt,
    };
  } catch (error) {
    console.error("Failed to parse metadata:", error);
    return {
      title: "Untitled Campaign",
      description: "No description available",
    };
  }
}

/**
 * Format a raw campaign from contract into UI-friendly format
 * @param raw Raw campaign data from contract
 * @returns Formatted campaign object
 */
export function formatCampaign(raw: RawCampaign): FormattedCampaign {
  const metadata = parseMetadata(raw.metadataURI);
  
  return {
    id: raw.id.toString(),
    owner: raw.owner,
    title: metadata.title,
    description: metadata.description,
    goalETH: weiToETH(raw.goal),
    raisedETH: weiToETH(raw.raised),
    goalWei: raw.goal,
    raisedWei: raw.raised,
    progress: calculateProgress(raw.raised, raw.goal),
    verified: raw.verified,
    active: raw.active,
    createdAt: new Date(Number(raw.createdAt) * 1000),
  };
}

/**
 * Truncate Ethereum address for display
 * @param address Full address
 * @param chars Number of chars to show on each side (default 4)
 * @returns Truncated address (e.g., "0x1234...5678")
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (address.length < chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format date for display
 * @param date Date object
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
