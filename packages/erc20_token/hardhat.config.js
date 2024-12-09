require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

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
      accounts: {
        count: 50,
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
      mining: {
        auto: true,
        interval: 5000, // Intervalo de minado en ms
        mempool: {
          order: "fifo", // First in, first out
        },
      },
      // hardfork: "shanghai", // Especifica el hardfork
      chainId: 41337,
      blockGasLimit: 30000000,
      gasPrice: "auto",
      throwOnTransactionFailures: true,
      throwOnCallFailures: true,
      allowUnlimitedContractSize: false, // Mantener en false para simular mainnet
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 41337,
      timeout: 60000,
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
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY,
  // },
  // verify: {
  //   etherscan: {
  //     apiKey: process.env.ETHERSCAN_API_KEY,
  //   },
  // },
};

// // Manejo de tareas condicionales
// if (process.env.REPORT_GAS) {
//   require("hardhat-gas-reporter");
// }

// if (process.env.ENABLE_COVERAGE) {
//   require("solidity-coverage");
// }
