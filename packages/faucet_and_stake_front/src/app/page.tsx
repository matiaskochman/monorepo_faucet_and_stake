"use client";
import { useState, useEffect } from "react";
import {
  connectWallet,
  fetchTokenBalance,
  claimTokens,
  stakeTokens,
  unstakeTokens,
  logout,
} from "@/utils/web3Utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import {
  ERC20_ADDRESS,
  STAKING_ADDRESS,
  FAUCET_ADDRESS,
  targetChainId,
} from "../config";

console.log("ERC20_ADDRESS:", ERC20_ADDRESS);
console.log("STAKING_ADDRESS:", STAKING_ADDRESS);
console.log("FAUCET_ADDRESS:", FAUCET_ADDRESS);

export default function Web3TokenDashboard() {
  const [balance, setBalance] = useState<number>(0);
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [stakingStart, setStakingStart] = useState<Date | null>(null);
  const [stakingRewards, setStakingRewards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [currentChainId, setCurrentChainId] = useState<bigint | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);

  useEffect(() => {
    const init = async () => {
      const web3Modal = new Web3Modal({ cacheProvider: true });
      if (web3Modal.cachedProvider) {
        await connectWallet(
          setProvider,
          setSigner,
          setAccount,
          setIsConnected,
          setError,
          setCurrentChainId,
          setStakedAmount,
          setBalance,
          BigInt(targetChainId)
        );
      } else {
        setIsConnected(false);
        setAccount(null);
      }
    };

    init();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          console.log("Dirección del usuario:", accounts[0]);

          if (signer && provider) {
            await fetchTokenBalance(signer, accounts[0], setBalance, setError);
            const staked = await fetchStakedAmount(
              accounts[0],
              signer,
              setError
            );
            setStakedAmount(staked);
          } else {
            await connectWallet(
              setProvider,
              setSigner,
              setAccount,
              setIsConnected,
              setError,
              setCurrentChainId,
              setStakedAmount,
              setBalance,
              BigInt(targetChainId)
            );
          }
        } else {
          handleLogout();
        }
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      };
    }
  }, [signer, provider]);

  const handleClaimtokens = async () => {
    setLoading(true);
    await claimTokens(signer, provider, setLoading, setError, setTxHash);
    if (provider && signer && account) {
      await fetchTokenBalance(signer, account, setBalance, setError);
    }
    setLoading(false);
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    await connectWallet(
      setProvider,
      setSigner,
      setAccount,
      setIsConnected,
      setError,
      setCurrentChainId,
      setStakedAmount,
      setBalance,
      BigInt(targetChainId)
    );
    setLoading(false);

    if (provider && signer && account) {
      await fetchTokenBalance(signer, account, setBalance, setError);
    }
  };

  const handleUnstake = async () => {
    await unstakeTokens(
      signer,
      provider,
      unstakeAmount,
      setLoading,
      setError,
      setTxHash,
      setStakedAmount,
      setStakingStart,
      setStakingRewards
    );
    if (provider && signer && account) {
      await fetchTokenBalance(signer, account, setBalance, setError);
    }
  };

  const handleStake = async () => {
    await stakeTokens(
      signer,
      provider,
      stakeAmount,
      setLoading,
      setError,
      setTxHash,
      setStakedAmount,
      setStakingStart
    );
    if (provider && signer && account) {
      await fetchTokenBalance(signer, account, setBalance, setError);
    }
  };

  const handleLogout = async () => {
    logout(
      setAccount,
      setProvider,
      setSigner,
      setIsConnected,
      setBalance,
      setStakedAmount,
      setStakingStart,
      setStakingRewards,
      setCurrentChainId,
      setError,
      setTxHash
    );
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="max-w-[39rem]">
        <CardHeader>
          <CardTitle>Web3 Token Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <Button
              onClick={handleConnectWallet}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Conectando..." : "Conectar Wallet"}
            </Button>
          ) : (
            <>
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Contrato ERC20:</span>
                  <span className="font-mono">{ERC20_ADDRESS}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contrato Staking:</span>
                  <span className="font-mono">{STAKING_ADDRESS}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contrato Faucet:</span>
                  <span className="font-mono">{FAUCET_ADDRESS}</span>
                </div>
              </div>
              <br></br>
              <br></br>

              <div className="flex justify-between">
                <span>Cuenta:</span>
                <span className="font-bold">{account}</span>
              </div>
              <div className="flex justify-between">
                <span>Balance:</span>
                <span className="font-bold">{balance.toFixed(2)} tokens</span>
              </div>
              <div className="flex justify-between">
                <span>Staked Amount:</span>
                <span className="font-bold">
                  {stakedAmount !== undefined && !isNaN(stakedAmount)
                    ? stakedAmount.toFixed(2)
                    : "0.00"}{" "}
                  tokens
                </span>
              </div>
              {stakingStart && (
                <div className="flex justify-between">
                  <span>Staking Time:</span>
                  <span className="font-bold">
                    {formatDistanceToNow(stakingStart)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Staking Rewards:</span>
                <span className="font-bold">
                  {stakingRewards.toFixed(2)} tokens
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={handleClaimtokens}
                  disabled={loading || currentChainId !== BigInt(targetChainId)}
                >
                  {loading ? "Reclamando..." : "Claim Tokens"}
                </Button>
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(Number(e.target.value))}
                  placeholder="Cantidad de tokens para stake"
                  className="w-full p-2 border rounded"
                />
                <Button
                  onClick={handleStake}
                  disabled={loading || currentChainId !== BigInt(targetChainId)}
                >
                  {loading
                    ? "Haciendo Stake..."
                    : `Stake ${stakeAmount} Tokens`}
                </Button>
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(Number(e.target.value))}
                  placeholder="Cantidad de tokens para unstake"
                  className="w-full p-2 border rounded"
                />
                <Button
                  onClick={handleUnstake}
                  disabled={loading || currentChainId !== BigInt(targetChainId)}
                >
                  {loading
                    ? "Haciendo Unstake..."
                    : `Unstake ${unstakeAmount} Tokens`}
                </Button>
                <Button
                  onClick={handleLogout}
                  disabled={loading}
                  className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white"
                >
                  {loading ? "Desconectando..." : "Logout"}
                </Button>
              </div>
            </>
          )}
          {/* {txHash && (
            <div className="p-3 bg-green-100 rounded">
              <p className="text-green-800">
                Transacción enviada:{" "}
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline break-all"
                >
                  {txHash}
                </a>
              </p>
            </div>
          )} */}
          {error && (
            <p className="text-red-500" role="alert">
              {error}
            </p>
          )}
          {currentChainId !== BigInt(targetChainId) && (
            <p className="text-orange-500" role="alert">
              Cambia a la red de Hardhat para reclamar los tokens.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function fetchStakedAmount(
  address: string,
  signer: ethers.JsonRpcSigner,
  setError: (msg: string) => void
): Promise<number> {
  try {
    const { fetchStakedAmount: originalFetch } = await import(
      "@/utils/web3Utils"
    );
    return await originalFetch(address, signer, setError);
  } catch (err) {
    console.error("Error al obtener el monto staked:", err);
    setError("No se pudo obtener el monto staked.");
    return 0;
  }
}
