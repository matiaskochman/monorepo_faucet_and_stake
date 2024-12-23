require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const {
  ETH_SEPOLIA_URL,
  FANTOM_TESTNET_URL,
  PRIVATE_KEY,
  ACC6_PRIVATE_KEY,
  ETHERSCAN_TEST_API_KEY,
  POLYGON_AMOY_URL,
} = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      // viaIR: true, // Comentado o eliminado
    },
  },
  networks: {
    hardhat: {
      accounts: { count: 50, accountsBalance: "10000000000000000000000" },
      chainId: 41337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 41337,
    },
    sepolia: {
      url: ETH_SEPOLIA_URL,
      accounts: [ACC6_PRIVATE_KEY],
      chainId: 11155111,
    },
    fantomTestnet: {
      url: FANTOM_TESTNET_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4002,
    },
    amoy: {
      url: POLYGON_AMOY_URL,
      accounts: [ACC6_PRIVATE_KEY],
      chainId: 80002,
    },
  },
  // paths: {
  //   sources: "./contracts",
  //   tests: "./test",
  //   cache: "./cache",
  //   artifacts: "./artifacts",
  //   deploy: "./deploy",
  // },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: "USD",
  //   outputFile: "gas-report.txt",
  //   noColors: true,
  //   coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  //   token: "ETH",
  // },
  // contractSizer: {
  //   alphaSort: true,
  //   runOnCompile: true,
  //   disambiguatePaths: false,
  //   strict: true,
  //   only: [],
  //   except: [],
  // },
  // mocha: {
  //   timeout: 200000, // 200 segundos
  // },
  etherscan: {
    apiKey: {
      opera: process.env.FTM_TEST_API_KEY, // Mainnet
      ftmTestnet: "testnet_dummy_api_key", // Testnet placeholder
      sepolia: ETHERSCAN_TEST_API_KEY,
      amoy: ETHERSCAN_TEST_API_KEY,
    },
  },
  verify: {
    etherscan: {
      apiKey: {
        opera: process.env.FTM_TEST_API_KEY, // Mainnet
        ftmTestnet: "testnet_dummy_api_key", // Testnet placeholder
        sepolia: ETHERSCAN_TEST_API_KEY,
        amoy: ETHERSCAN_TEST_API_KEY,
      },
      ftmTestnet: "testnet_dummy_api_key", // Testnet placeholder
    },
  },
};

// // Manejo de tareas condicionales
// if (process.env.REPORT_GAS) {
//   require("hardhat-gas-reporter");
// }

// if (process.env.ENABLE_COVERAGE) {
//   require("solidity-coverage");
// }
