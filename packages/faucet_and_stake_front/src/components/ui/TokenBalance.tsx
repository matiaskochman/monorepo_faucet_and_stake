/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { ethers } from "ethers";
import tokenAbi from "../../../../abis/MyToken.json";
import { ERC20_ADDRESS } from "@/config";

const TokenBalance = ({ address }: { address: string }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const contractAddress: `0x${string}` = ERC20_ADDRESS as `0x${string}`;

  // Validación previa de la dirección
  useEffect(() => {
    if (!ethers.isAddress(address)) {
      setError(
        "Dirección inválida. Asegúrate de ingresar una dirección válida."
      );
    } else if (!ethers.isAddress(contractAddress)) {
      setError(
        "La dirección del contrato es inválida. Asegúrate de configurarla correctamente."
      );
    } else {
      setError(null); // Reinicia el error si ambas direcciones son válidas
    }
  }, [address, contractAddress]);

  const { data, error: contractError } = useReadContract({
    abi: tokenAbi.abi,
    address: contractAddress,
    // functionName: "totalSupply",
    functionName: "balanceOf",
    args: [address],
  });
  let formattedBalance = 0;
  if (data) {
    formattedBalance = parseFloat(ethers.formatUnits(data, 6)) | 0;
  }

  if (error) {
    return <div style={{ color: "red" }}>Error: {error}</div>;
  }

  return (
    <div>
      {formattedBalance !== null
        ? `Balance: ${formattedBalance?.toLocaleString()} tokens`
        : "Cargando balance..."}
    </div>
  );
};

export { TokenBalance };
