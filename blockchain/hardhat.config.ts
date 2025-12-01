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
      viaIR: true,
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
    sepolia: {
      url: process.env.SEPOLIA_RPC || "",
      accounts: getAccounts(),
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC || "",
      accounts: getAccounts(),
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
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
