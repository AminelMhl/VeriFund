require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  // Use a Solidity version compatible with:
  // - OpenZeppelin ^0.8.20
  // - Lock.sol ^0.8.28
  // - DonationRegistry.sol ^0.8.19
  solidity: "0.8.28",
  networks: {
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC,
    //   accounts: [process.env.PRIVATE_KEY]
    // },
    // mumbai: {
    //   url: process.env.MUMBAI_RPC,
    //   accounts: [process.env.PRIVATE_KEY]
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
