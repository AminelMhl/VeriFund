require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Helper function to get valid accounts array
function getAccounts() {
  const privateKey = process.env.PRIVATE_KEY;
  // Check if private key exists and is valid (64 hex chars or 66 with 0x prefix)
  if (privateKey && (privateKey.length === 64 || (privateKey.startsWith("0x") && privateKey.length === 66))) {
    return [privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`];
  }
  return [];
}

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Ethereum Testnet (Backup option - easier faucet access)
    sepolia: {
      url: process.env.SEPOLIA_RPC || "https://rpc.sepolia.org",
      accounts: getAccounts(),
      chainId: 11155111,
    },
    // Polygon Networks
    polygonAmoy: {
      url: process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology",
      accounts: getAccounts(),
      chainId: 80002,
      gasLimit: 3000000,
      gasPrice: 30000000000,
      timeout: 180000,
    },
    polygon: {
      url: process.env.POLYGON_RPC || "https://polygon-rpc.com",
      accounts: getAccounts(),
      chainId: 137,
      gasPrice: 200000000000, // 200 gwei (adjust based on network conditions)
    },
  },
  etherscan: {
    apiKey: {
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
  },
  mocha: {
    timeout: 60000,
  },
};
