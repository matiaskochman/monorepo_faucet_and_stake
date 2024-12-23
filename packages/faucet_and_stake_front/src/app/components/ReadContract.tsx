"use client";
import { useReadContract } from "wagmi";
import { config } from "../../config";
export const ReadContract = ({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) => {
  const { data: balance } = useReadContract({
    ...config,
    functionName: "balanceOf",
    args: [contractAddress],
  });

  return <div>Balance: {balance?.toString()}</div>;
};
