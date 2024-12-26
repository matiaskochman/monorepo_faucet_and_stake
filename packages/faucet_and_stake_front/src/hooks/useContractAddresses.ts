// Path: src/hooks/useContractAddresses.ts

import { useChainId } from "wagmi";
import { getContractAddresses } from "@/config";

export interface IContractAddresses {
  ERC20_ADDRESS: `0x${string}`;
  STAKING_ADDRESS: `0x${string}`;
  FAUCET_ADDRESS: `0x${string}`;
}

export function useContractAddresses(): IContractAddresses {
  const chainId = useChainId();
  console.log(chainId);
  const addresses = getContractAddresses(chainId);

  return addresses;
}
