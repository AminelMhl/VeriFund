// Raw campaign data from contract (all values as returned by blockchain)
export interface RawCampaign {
  id: bigint;
  owner: `0x${string}`;
  metadataURI: string;
  goal: bigint;
  raised: bigint;
  verified: boolean;
  active: boolean;
  createdAt: bigint;
}

// Parsed metadata from metadataURI
export interface CampaignMetadata {
  title: string;
  description: string;
  createdAt?: number;
}

// Formatted campaign for UI consumption
export interface FormattedCampaign {
  id: string;
  owner: string;
  title: string;
  description: string;
  goalETH: string;
  raisedETH: string;
  goalWei: bigint;
  raisedWei: bigint;
  progress: number;
  verified: boolean;
  active: boolean;
  createdAt: Date;
}

// Hook return types
export interface UseCampaignsReturn {
  campaigns: FormattedCampaign[] | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseCampaignReturn {
  campaign: FormattedCampaign | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export interface UseDonateReturn {
  donate: (campaignId: bigint, amountETH: string) => void;
  isPending: boolean;
  isSuccess: boolean;
  error: Error | null;
  hash: `0x${string}` | undefined;
}
