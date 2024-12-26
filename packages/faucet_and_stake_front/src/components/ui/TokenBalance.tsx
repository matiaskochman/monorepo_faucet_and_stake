"use client";

import React from "react";
import { Typography } from "@mui/material";
import { ethers } from "ethers";

interface TokenBalanceProps {
  balance: bigint;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ balance }) => {
  let displayBalance = "0"; // Default display value

  if (balance != null) {
    // Check for both null and undefined
    try {
      displayBalance = ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error("Error formatting balance:", error);
      displayBalance = "Error"; // Display an error message
    }
  }
  return (
    <Typography>
      {balance !== null ? `Balance: ${displayBalance} tokens` : "Balance: 0"}
    </Typography>
  );
};

export default TokenBalance;
