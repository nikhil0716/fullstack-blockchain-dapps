require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.24",
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" }
  }
};
