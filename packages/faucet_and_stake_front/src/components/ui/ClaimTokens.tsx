"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // Asegúrate de importar tu componente de botón correctamente
import { useWriteContract } from "wagmi";
// import { FAUCET_ADDRESS } from "@/config";
import faucetAbi from "../../../../abis/Faucet.json";
// const contractAddress: `0x${string}` = FAUCET_ADDRESS as `0x${string}`;

const ClaimTokens = ({
  contractAddress,
}: {
  contractAddress: `0x${string}`;
}) => {
  const [loading, setLoading] = useState(false);
  const { data: hash, writeContract } = useWriteContract();

  const handleClaimTokens = async () => {
    setLoading(true);
    try {
      writeContract({
        address: contractAddress,
        abi: faucetAbi.abi,
        functionName: "claimTokens",
        // args: [BigInt(tokenId)],
      });
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
