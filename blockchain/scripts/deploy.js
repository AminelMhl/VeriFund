const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Check deployer balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const nativeCurrency = hre.network.name.includes("polygon") ? "MATIC" : "ETH";
  console.log("Account balance:", hre.ethers.formatEther(balance), nativeCurrency);

  if (balance === 0n) {
    throw new Error(`Deployer has no ${nativeCurrency} for gas fees!`);
  }

  // Deploy DonationRegistry
  console.log("\nDeploying DonationRegistry...");
  const DonationRegistry = await hre.ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await DonationRegistry.deploy();

  await donationRegistry.waitForDeployment();

  const contractAddress = await donationRegistry.getAddress();
  console.log("DonationRegistry deployed to:", contractAddress);

  // Verify admin role is set correctly (using AccessControl)
  const DEFAULT_ADMIN_ROLE = await donationRegistry.DEFAULT_ADMIN_ROLE();
  const isAdmin = await donationRegistry.hasRole(DEFAULT_ADMIN_ROLE, deployer.address);
  console.log("Deployer has admin role:", isAdmin);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    contract: "DonationRegistry",
    address: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber(),
  };

  // Load existing deployments or create new
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  let deployments = {};
  if (fs.existsSync(deploymentsPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  }

  // Save by network name
  deployments[hre.network.name] = deploymentInfo;
  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log("\nDeployment saved to deployments.json");

  // Log deployment summary
  console.log("\n--- Deployment Summary ---");
  console.log("Network:", hre.network.name);
  console.log("Chain ID:", hre.network.config.chainId);
  console.log("Contract:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("--------------------------\n");

  // For non-local networks, remind to verify on explorer
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    const explorerName = hre.network.name.includes("polygon") ? "Polygonscan" : "Etherscan";
    console.log(`To verify on ${explorerName}:`);
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
    console.log("\nOr run: npm run verify");
  }
}

// Hardhat always expects this pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
