// Path: src/hooks/useContractAddresses.ts

import { useChainId } from "wagmi";
import { useAccount } from "wagmi";
import { getContractAddresses } from "@/config";

export interface IContractAddresses {
  ERC20_ADDRESS: `0x${string}`;
  STAKING_ADDRESS: `0x${string}`;
  FAUCET_ADDRESS: `0x${string}`;
}

export function useContractAddresses(): IContractAddresses {
  const chainId = useChainId();
  const account = useAccount();

  console.log("usechainId: ", chainId);
  console.log("account.chainId: ", account?.chainId);
  const addresses = getContractAddresses(account?.chainId);

  return addresses;
}
