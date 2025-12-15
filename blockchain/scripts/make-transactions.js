const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Making 3 small transactions on Polygon Amoy...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Your address:", signer.address);

  const balance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Current balance:", hre.ethers.formatEther(balance), "MATIC\n");

  // Recipient addresses (random addresses for demonstration)
  const recipients = [
    "0x0000000000000000000000000000000000000001",
    "0x0000000000000000000000000000000000000002", 
    "0x0000000000000000000000000000000000000003"
  ];

  // Small amount to send (0.0001 MATIC each)
  const amount = hre.ethers.parseEther("0.0001");

  for (let i = 0; i < recipients.length; i++) {
    console.log(`📤 Transaction ${i + 1}/3`);
    console.log(`   To: ${recipients[i]}`);
    console.log(`   Amount: ${hre.ethers.formatEther(amount)} MATIC`);

    try {
      const tx = await signer.sendTransaction({
        to: recipients[i],
        value: amount,
      });

      console.log(`   Tx Hash: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);

      const receipt = await tx.wait();
      console.log(`   ✅ Confirmed in block ${receipt.blockNumber}`);
      console.log(`   Gas used: ${receipt.gasUsed.toString()}`);
      console.log();
    } catch (error) {
      console.error(`   ❌ Failed: ${error.message}\n`);
      throw error;
    }
  }

  const finalBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log("Final balance:", hre.ethers.formatEther(finalBalance), "MATIC");
  console.log("\n✨ All 3 transactions completed!");
  console.log("\n🪙 Now you can request more MATIC from the faucet:");
  console.log("   https://faucet.polygon.technology/");
  console.log("   https://www.alchemy.com/faucets/polygon-amoy\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
