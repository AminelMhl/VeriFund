import donationArtifact from "../../blockchain/artifacts/contracts/DonationRegistry.sol/DonationRegistry.json";
import { Address } from "viem";

export const CONTRACT_ADDRESS: Address = "0x..."; // replace after deployment

export const CONTRACT_ABI = donationArtifact.abi;
