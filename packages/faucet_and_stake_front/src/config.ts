import { http, createConfig, createStorage } from "wagmi";
import {
  fantomSonicTestnet,
  mainnet,
  polygonAmoy,
  sepolia,
} from "wagmi/chains";
import { injected, metaMask, safe } from "wagmi/connectors";
import { defineChain } from "viem";

import { config as dotenvConfig } from "dotenv";
dotenvConfig();

// Definir la red personalizada localhost con chainId 41337
const localhost = defineChain({
  id: 41337,
  name: "Localhost 41337",
  network: "localhost",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["http://127.0.0.1:8545"], // URL de tu nodo local (Hardhat, Ganache, etc.)
    },
    public: {
      http: ["http://127.0.0.1:8545"],
    },
  },
  blockExplorers: {
    default: { name: "Localhost Explorer", url: "http://127.0.0.1:8545" },
  },
  testnet: true, // Marcar como testnet
});

// Configurar wagmi con las cadenas
export const config = createConfig({
  chains: [mainnet, sepolia, fantomSonicTestnet, polygonAmoy], //localhost], // Agregar la red localhost

  multiInjectedProviderDiscovery: true,
  // multiInjectedProviderDiscovery: false,
  ssr: true, // is in server side rendering?
  // storage: createStorage({ storage: window.localStorage }),
  connectors: [injected(), metaMask(), safe()],
  // connectors: [metaMask(), safe()],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [fantomSonicTestnet.id]: http(), // Agregar transport para Fantom testnet
    [polygonAmoy.id]: http(),
    // Si quieres volver a incluir localhost:
    [localhost.id]: http(),
  },
});

const targetNetwork = process.env.NEXT_PUBLIC_TARGET_NETWORK || "localhost";

let ERC20_ADDRESS = "";
let STAKING_ADDRESS = "";
let FAUCET_ADDRESS = "";
let targetChainId: bigint;

switch (targetNetwork) {
  case "fantomTestnet":
    ERC20_ADDRESS = process.env.NEXT_PUBLIC_FANTOM_TESTNET_ERC20_ADDRESS || "";
    STAKING_ADDRESS =
      process.env.NEXT_PUBLIC_FANTOM_TESTNET_STAKING_ADDRESS || "";
    FAUCET_ADDRESS =
      process.env.NEXT_PUBLIC_FANTOM_TESTNET_FAUCET_ADDRESS || "";
    targetChainId = 4002n;
    break;
  case "sepolia":
    ERC20_ADDRESS = process.env.NEXT_PUBLIC_SEPOLIA_TESTNET_ERC20_ADDRESS || "";
    STAKING_ADDRESS =
      process.env.NEXT_PUBLIC_SEPOLIA_TESTNET_STAKING_ADDRESS || "";
    FAUCET_ADDRESS =
      process.env.NEXT_PUBLIC_SEPOLIA_TESTNET_FAUCET_ADDRESS || "";
    targetChainId = 11155111n;
    break;
  case "polygonTestnet":
    ERC20_ADDRESS = process.env.NEXT_PUBLIC_POLYGON_TESTNET_ERC20_ADDRESS || "";
    STAKING_ADDRESS =
      process.env.NEXT_PUBLIC_POLYGON_TESTNET_STAKING_ADDRESS || "";
    FAUCET_ADDRESS =
      process.env.NEXT_PUBLIC_POLYGON_TESTNET_FAUCET_ADDRESS || "";
    targetChainId = 80002n;
    break;
  case "localhost":
  default:
    ERC20_ADDRESS = process.env.NEXT_PUBLIC_LOCAL_ERC20_ADDRESS || "";
    STAKING_ADDRESS = process.env.NEXT_PUBLIC_LOCAL_STAKING_ADDRESS || "";
    FAUCET_ADDRESS = process.env.NEXT_PUBLIC_LOCAL_FAUCET_ADDRESS || "";
    targetChainId = 41337n;
    break;
}

export { ERC20_ADDRESS, STAKING_ADDRESS, FAUCET_ADDRESS, targetChainId };

export function getConfig() {
  return config;
}
