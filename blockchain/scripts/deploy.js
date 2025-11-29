const hre = require("hardhat");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Deploy DonationRegistry
  console.log("\nDeploying DonationRegistry...");
  const DonationRegistry = await hre.ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await DonationRegistry.deploy();

  await donationRegistry.waitForDeployment();

  const contractAddress = await donationRegistry.getAddress();
  console.log("DonationRegistry deployed to:", contractAddress);

  // Verify owner is set correctly
  const owner = await donationRegistry.owner();
  console.log("Contract owner:", owner);

  // Log deployment info for verification
  console.log("\n--- Deployment Summary ---");
  console.log("Network:", hre.network.name);
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("--------------------------\n");

  // For non-local networks, remind to verify on explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("To verify on Etherscan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  }
}

// Hardhat always expects this pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
