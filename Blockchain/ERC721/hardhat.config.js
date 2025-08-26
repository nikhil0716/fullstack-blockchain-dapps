require("solidity-coverage");
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    // Example testnet config (paste your RPC key + private key if you want to demo on-chain):
    // sepolia: {
    //   url: process.env.SEPOLIA_RPC_URL,
    //   accounts: [process.env.PRIVATE_KEY] // DO NOT commit secrets
    // }
  }
};
