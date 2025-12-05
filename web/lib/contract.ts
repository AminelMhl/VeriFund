import donationAbi from "../abi/DonationRegistry.json";

// Hardhat local deployment address (update after deployment)
export const CONTRACT_ADDRESS_LOCAL = "0x5FbDB2315678afecb367f032d93F642f64180aa3" as const;

// Sepolia testnet address (update when Teammate 1 deploys)
export const CONTRACT_ADDRESS_SEPOLIA = "0x0000000000000000000000000000000000000000" as const;

// Default to local for development
export const CONTRACT_ADDRESS = CONTRACT_ADDRESS_LOCAL;

export const CONTRACT_ABI = donationAbi.abi;
