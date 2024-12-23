"use client";

import React, { useState, useEffect } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { useReadContract, useAccount, useChainId } from "wagmi";
import { ethers } from "ethers";
import tokenAbi from "../../../../abis/MyToken.json";
import { ERC20_ADDRESS } from "@/config";

const TokenBalance = ({ address }: { address: `0x${string}` | undefined }) => {
  const { status } = useAccount(); // Obtiene el estado de la cuenta
  const contractAddress: `0x${string}` = ERC20_ADDRESS as `0x${string}`;
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Declarar el hook `useReadContract` fuera del condicional
  const {
    data,
    error: contractError,
    isLoading,
  } = useReadContract({
    abi: tokenAbi.abi,
    address: contractAddress,
    functionName: "balanceOf",
    args: [address],
    enabled: status === "connected", // Solo habilitar la consulta si está conectado
    watch: true, // Habilita la actualización en tiempo real
  });
  const chainId = useChainId();
  useEffect(() => {
    if (contractError) {
      // setBalance(0);
      setError("Error al obtener el balance del contrato");
    } else if (data) {
      const formattedBalance = parseFloat(ethers.formatUnits(data, 6));
      setBalance(formattedBalance);
    }
  }, [data, contractError]);

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Typography>
      {balance !== null
        ? `Balance: ${balance.toLocaleString()} tokens`
        : "Cargando balance..."}
    </Typography>
  );
};

export default TokenBalance;
