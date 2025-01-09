import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
  useAccount,
} from "wagmi";
import { parseEther } from "viem";
import tokenAbi from "../../../abis/PesosArgToken.json";
import stakingAbi from "../../../abis/Staking.json";

export const useStaking = (
  stakingAddress: `0x${string}` | undefined,
  tokenAddress: `0x${string}` | undefined
) => {
  const { writeContract: writeToken, data: approvalHash } = useWriteContract();
  const { writeContract: writeStaking, data: stakeHash } = useWriteContract();
  const { isLoading: isWaitingForApproval } = useWaitForTransactionReceipt({
    hash: approvalHash,
  });
  const account = useAccount();
  const { data: stakedAmount, refetch } = useReadContract({
    address: stakingAddress,
    abi: stakingAbi.abi, // ¡IMPORTANTE!
    functionName: "getStakedAmount",
    args: [account.address], // Manejo de undefined para el argumento
    // enabled: !!stakingAddress,
    // watch: true,
  });
  const { data: allowanceData } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi.abi,
    functionName: "allowance",
    args: [stakingAddress],
  });

  // Asegúrate de que allowance sea un bigint
  const allowance: bigint = allowanceData
    ? BigInt(allowanceData.toString())
    : 0n;

  const stake = async (amount: string) => {
    const parsedAmount = parseEther(amount);

    // Compara allowance con parsedAmount como bigints
    if (allowance < parsedAmount) {
      await writeToken({
        address: tokenAddress,
        abi: tokenAbi.abi,
        functionName: "approve",
        args: [stakingAddress, parsedAmount],
      });
    }

    await writeStaking({
      address: stakingAddress,
      abi: stakingAbi.abi,
      functionName: "stake",
      args: [parsedAmount],
    });
  };

  const unstake = async (amount: string) => {
    await writeStaking({
      address: stakingAddress,
      abi: stakingAbi.abi,
      functionName: "unstake",
      args: [parseEther(amount)],
    });
  };

  return {
    stake,
    unstake,
    isWaitingForApproval,
    approvalHash,
    stakeHash,
  };
};
