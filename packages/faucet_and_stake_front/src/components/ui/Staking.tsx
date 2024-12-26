/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Typography,
  // CircularProgress,
} from "@mui/material";
import { ethers } from "ethers";
// import { useStaking } from "../../hooks/useStake";
import { useContractAddresses } from "@/hooks/useContractAddresses";
import { useWriteContract } from "wagmi";
import tokenAbi from "../../../../abis/MyToken.json";
import stakingAbi from "../../../../abis/Staking.json";

interface StakingComponentProps {
  stakedAmount: bigint;
  tokenBalance: bigint;
  refetchTokenBalance: () => void;
  refetchStakedBalance: () => void;
}

export const StakingComponent: React.FC<StakingComponentProps> = ({
  stakedAmount,
  tokenBalance,
  refetchTokenBalance,
  refetchStakedBalance,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const contractAddresses = useContractAddresses();

  const {
    writeContractAsync: writeAllowance,
    // data: approvalHash,
    // isPending: isAllowancePending,
  } = useWriteContract();
  const {
    writeContractAsync: writeStaking,
    // data: stakeHash,
    // isPending: isStakingPending,
    isSuccess: isStakedSuccess,
  } = useWriteContract();
  // const account = useAccount();

  const stakingAddress = contractAddresses?.STAKING_ADDRESS;
  const tokenAddress = contractAddresses?.ERC20_ADDRESS;

  let displayStakedBalance = "0"; // Default display value

  if (stakedAmount != null) {
    // Check for both null and undefined
    try {
      displayStakedBalance = ethers.formatUnits(stakedAmount, 6);
    } catch (error) {
      console.error("Error formatting balance:", error);
      displayStakedBalance = "Error"; // Display an error message
    }
  }

  const handleStake = async () => {
    if (!stakeAmount) return;

    // Compara allowance con parsedAmount como bigints
    const amountInTokens = ethers.parseUnits(stakeAmount.toString(), 6);
    if (tokenBalance > Number(amountInTokens)) {
      await writeAllowance({
        address: tokenAddress,
        abi: tokenAbi.abi,
        functionName: "approve",
        args: [stakingAddress, amountInTokens],
      });

      await writeStaking({
        address: stakingAddress,
        abi: stakingAbi.abi,
        functionName: "stake",
        args: [amountInTokens],
      });
      refetchStakedBalance();
      refetchTokenBalance();
      setError(null);
    } else {
      setError("not enogh token balance");
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount) return;
    const amountInTokens = ethers.parseUnits(unstakeAmount.toString(), 6);

    if (stakedAmount > Number(amountInTokens)) {
      await writeStaking({
        address: stakingAddress,
        abi: stakingAbi.abi,
        functionName: "unstake",
        args: [amountInTokens],
      });
      setError(null);
    } else {
      setError("staked balance not enogh");
    }
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "auto", mt: 4 }}>
      <CardContent>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mt: 2 }}>
            Staked Amount:{" "}
            {displayStakedBalance ? displayStakedBalance.toString() : "0"}
          </Typography>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Stake
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            placeholder="Amount to stake"
            InputProps={{
              inputProps: { min: 0, step: "0.000000000000000001" },
            }}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleStake}
            disabled={!stakeAmount}
          >
            Stake
          </Button>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Unstake
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={unstakeAmount}
            onChange={(e) => setUnstakeAmount(Number(e.target.value))}
            placeholder="Amount to unstake"
            InputProps={{
              inputProps: { min: 0, step: "0.000000000000000001" },
            }}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleUnstake}
            disabled={!unstakeAmount}
            color="secondary"
          >
            Unstake
          </Button>
        </Box>
      </CardContent>
      {error && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {error}
          </Typography>
        </Box>
      )}
    </Card>
  );
};
