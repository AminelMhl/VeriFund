const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;

  // Check if we're on a verifiable network
  if (network === "hardhat" || network === "localhost") {
    console.log("Skipping verification on local network");
    return;
  }

  // Load deployment info
  const deploymentsPath = path.join(__dirname, "..", "deployments.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("deployments.json not found. Run deploy script first.");
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const deployment = deployments[network];

  if (!deployment) {
    throw new Error(`No deployment found for network: ${network}`);
  }

  console.log(`Verifying ${deployment.contract} on ${network}...`);
  console.log("Contract address:", deployment.address);

  try {
    await hre.run("verify:verify", {
      address: deployment.address,
      constructorArguments: [],
    });
    console.log("✅ Contract verified successfully!");
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract is already verified!");
    } else {
      console.error("❌ Verification failed:", error.message);
      throw error;
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
