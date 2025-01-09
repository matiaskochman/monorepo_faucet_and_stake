// Path: src/config.ts

import { http, createConfig } from "wagmi";
import {
  arbitrumSepolia,
  fantomSonicTestnet,
  fantomTestnet,
  mainnet,
  optimismSepolia,
  polygonAmoy,
  polygonZkEvmCardona,
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
  chains: [sepolia, polygonAmoy, localhost, arbitrumSepolia], // Agregar la red localhost
  multiInjectedProviderDiscovery: true,
  ssr: true, // Desactivar SSR para evitar problemas con hooks de cliente
  connectors: [injected(), metaMask(), safe()],
  transports: {
    [localhost.id]: http(),
    [sepolia.id]: http(),
    [polygonAmoy.id]: http(),
    // [mainnet.id]: http(),
    [arbitrumSepolia.id]: http(),
    // [fantomSonicTestnet.id]: http(), // Agregar transport para Fantom testnet
    // [polygonZkEvmCardona.id]: http(),
  },
});

// Mapa de chainId a direcciones de contrato
interface ContractAddresses {
  ERC20_ADDRESS: `0x${string}`;
  STAKING_ADDRESS: `0x${string}`;
  FAUCET_ADDRESS: `0x${string}`;
}

export const contractAddressesMap: Record<number, ContractAddresses> = {
  // Ejemplo para localhost (chainId: 41337)
  41337: {
    ERC20_ADDRESS: process.env.NEXT_PUBLIC_LOCAL_ERC20_ADDRESS as `0x${string}`,
    STAKING_ADDRESS: process.env
      .NEXT_PUBLIC_LOCAL_STAKING_ADDRESS as `0x${string}`,
    FAUCET_ADDRESS: process.env
      .NEXT_PUBLIC_LOCAL_FAUCET_ADDRESS as `0x${string}`,
  },
  // Ejemplo para Sepolia (chainId: 11155111)
  11155111: {
    ERC20_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_ERC20_ADDRESS as `0x${string}`,
    STAKING_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_STAKING_ADDRESS as `0x${string}`,
    FAUCET_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_FAUCET_ADDRESS as `0x${string}`,
  }, // Ethereum Sepolia
  // Añade más configuraciones para otras redes según sea necesario
  // 4002: {
  //   ERC20_ADDRESS:
  //     (process.env.NEXT_PUBLIC_FANTOM_TESTNET_ERC20_ADDRESS as `0x${string}`) ||
  //     "",
  //   STAKING_ADDRESS: process.env
  //     .NEXT_PUBLIC_FANTOM_TESTNET_STAKING_ADDRESS as `0x${string}`,
  //   FAUCET_ADDRESS: process.env
  //     .NEXT_PUBLIC_FANTOM_TESTNET_FAUCET_ADDRESS as `0x${string}`,
  // }, // Fantom Testnet
  80002: {
    ERC20_ADDRESS: process.env
      .NEXT_PUBLIC_POLYGON_TESTNET_ERC20_ADDRESS as `0x${string}`,
    STAKING_ADDRESS: process.env
      .NEXT_PUBLIC_POLYGON_TESTNET_STAKING_ADDRESS as `0x${string}`,
    FAUCET_ADDRESS: process.env
      .NEXT_PUBLIC_POLYGON_TESTNET_FAUCET_ADDRESS as `0x${string}`,
  }, // Polygon Amoy
  421614: {
    ERC20_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_ERC20_ADDRESS as `0x${string}`,
    STAKING_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_STAKING_ADDRESS as `0x${string}`,
    FAUCET_ADDRESS: process.env
      .NEXT_PUBLIC_SEPOLIA_TESTNET_FAUCET_ADDRESS as `0x${string}`,
  }, // Arbitrum Sepolia
};

export function getContractAddresses(
  chainId: number | undefined
): ContractAddresses {
  if (!!chainId) {
    return contractAddressesMap[chainId];
  }
  return contractAddressesMap[11155111];
}

export function getConfig() {
  return config;
}
