import donationAbi from "../abi/DonationRegistry.json";

// Hardhat localhost deployment (chainId 31337)
export const CONTRACT_ADDRESS_LOCAL =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// Sepolia testnet deployment (chainId 11155111)
// Source: blockchain/deployments.json
export const CONTRACT_ADDRESS_SEPOLIA =
  "0x8674906700964F1C5c357F41603f4da32B9E0eeb" as const;

// Address map keyed by EVM chain ID
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  31337: CONTRACT_ADDRESS_LOCAL,
  11155111: CONTRACT_ADDRESS_SEPOLIA,
};

// Default to local for development; kept for backward compatibility.
export const CONTRACT_ADDRESS = CONTRACT_ADDRESS_LOCAL;

// Helper to pick the right address for the connected chain.
export function getContractAddress(chainId?: number): `0x${string}` {
  if (!chainId) return CONTRACT_ADDRESS_LOCAL;
  return CONTRACT_ADDRESSES[chainId] ?? CONTRACT_ADDRESS_LOCAL;
}

export const CONTRACT_ABI = donationAbi.abi;
