"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Asegúrate de importar tu componente de botón correctamente
import { useWriteContract } from "wagmi";
import faucetAbi from "../../../../abis/Faucet.json";
// import { FAUCET_ADDRESS } from "@/config";
// const contractAddress: `0x${string}` = FAUCET_ADDRESS as `0x${string}`;

interface ClaimTokensProps {
  contractAddress: `0x${string}`;
  refetchTokenBalance: () => void;
  refetchStakedBalance: () => void;
}

const ClaimTokens: React.FC<ClaimTokensProps> = ({
  contractAddress,
  refetchTokenBalance,
  refetchStakedBalance,
}: {
  contractAddress: `0x${string}`;
}) => {
  const [loading, setLoading] = useState(false);
  const { data: hash, writeContractAsync, writeContract } = useWriteContract();

  const handleClaimTokens = async () => {
    setLoading(true);
    try {
      // writeContract({
      //   address: contractAddress,
      //   abi: faucetAbi.abi,
      //   functionName: "claimTokens",
      //   args: [],
      //   type: "eip1559",
      // });

      const tx = await writeContractAsync({
        address: contractAddress,
        abi: faucetAbi.abi,
        functionName: "claimTokens",
        args: [],
        type: "eip1559",
      });
      console.log(tx);
      refetchTokenBalance();
      refetchStakedBalance();
    } catch (error) {
      console.error("Error al reclamar tokens", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClaimTokens} disabled={loading}>
      {loading ? "Reclamando..." : "Claim Tokens"}
    </Button>
  );
};

export default ClaimTokens;
