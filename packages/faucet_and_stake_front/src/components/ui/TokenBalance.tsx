"use client";

import React, { useState, useEffect } from "react";
import { CircularProgress, Typography } from "@mui/material";
import { useReadContract, useAccount } from "wagmi";
import { ethers } from "ethers";
import tokenAbi from "../../../../abis/MyToken.json";
// import { ERC20_ADDRESS } from "@/config";

interface TokenBalanceProps {
  address?: `0x${string}`;
  contractAddress: `0x${string}`;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({
  address,
  contractAddress,
}) => {
  const { status } = useAccount(); // Obtiene el estado de la cuenta
  // const contractAddress: `0x${string}` = ERC20_ADDRESS as `0x${string}`;
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const account = useAccount();
  // Declarar el hook `useReadContract` fuera del condicional
  const {
    data,
    error: contractError,
    isLoading,
    refetch,
  } = useReadContract({
    abi: tokenAbi.abi,
    address: contractAddress,
    functionName: "balanceOf",
    args: [address],
    enabled: status === "connected", // Solo habilitar la consulta si está conectado
    // watch: true, // Habilita la actualización en tiempo real
  });
  // const chainId = useChainId();
  useEffect(() => {
    if (contractError) {
      // setBalance(0);
      setError("Error al obtener el balance del contrato");
    } else if (data) {
      const formattedBalance = parseFloat(ethers.formatUnits(data, 6));
      setBalance(formattedBalance);
      setError(null);
    }
  }, [data, contractError]);

  useEffect(() => {
    refetch();
  }, [account.address, account.chainId, refetch]);
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
        : "Balance: 0"}
    </Typography>
  );
};

export default TokenBalance;
