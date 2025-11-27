const hre = require("hardhat");

async function main() {
  // Compile if needed
  await hre.run("compile");

  const DonationRegistry = await hre.ethers.getContractFactory("DonationRegistry");
  const donationRegistry = await DonationRegistry.deploy();

  await donationRegistry.waitForDeployment();

  console.log("DonationRegistry deployed to:", donationRegistry.target);
}

// Hardhat always expects this pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
