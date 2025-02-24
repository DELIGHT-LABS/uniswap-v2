require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("dotenv").config();

const XPLA_PRIVATE_KEY = process.env.PK;
const url = process.env.url;
const chainId = parseInt(process.env.chainId, 10);

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 10,
      },
    },
  },
  networks: {
    xpla: {
      url,
      accounts: [
        XPLA_PRIVATE_KEY,
      ],
      chainId,
    },
  },
};
