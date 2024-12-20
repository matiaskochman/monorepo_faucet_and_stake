"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  useAccount,
  useConnect,
  useDisconnect,
  // useReadContract,
  useWriteContract,
} from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERC20_ADDRESS, STAKING_ADDRESS, FAUCET_ADDRESS } from "../config";
import { TokenBalance } from "../components/ui/TokenBalance";
import ClaimTokens from "@/components/ui/ClaimTokens";
function App() {
  const [erc20TokenBalance, setErc20TokenBalance] = useState<number>(0);
  const [stakedAmount, setStakedAmount] = useState<number>(0);
  const [stakingStart, setStakingStart] = useState<Date | null>(null);
  const [stakingRewards, setStakingRewards] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showError, setShowError] = useState<string | null>(null);

  // const TokenBalance = dynamic(
  //   () =>
  //     import("../components/ui/TokenBalance").then((mod) => mod.TokenBalance),
  //   {
  //     ssr: false,
  //     loading: () => <div>Cargando balance...</div>, // Asegúrate de usar un fallback consistente
  //   }
  // );

  const account = useAccount();

  const { connectors, connect, status, error } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: hash, writeContract } = useWriteContract();

  // useEffect(() => {
  //   const init = async () => {
  //     await FetchTokenBalance(account, setErc20TokenBalance, setShowError);
  //   };

  //   init();
  // }, []);

  // await fetchTokenBalance(signer, account, setBalance, setError);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="max-w-[39rem]">
        <CardHeader>
          <CardTitle>Web3 Token Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div>
            <h2>Account</h2>
            <br />
            <div className="flex justify-between py-2">
              <span>status:</span>
              <span className="font-mono">{account.status}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>addresses:</span>
              <span className="font-mono">
                {JSON.stringify(account.addresses)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span>chainId:</span>
              <span className="font-mono">{account.chainId}</span>
            </div>

            <div className="flex justify-between py-2">
              {account.status === "connected" && (
                <Button type="button" onClick={() => disconnect()}>
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          <div>
            <h2>Connect</h2>
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                onClick={() => connect({ connector })}
                type="button"
              >
                {connector.name}
              </Button>
            ))}
            <div>{status}</div>
            <div>{error?.message}</div>
          </div>
          <div className="flex justify-between py-2">
            {account?.status === "connected" && (
              <div>
                <TokenBalance address={account?.addresses[0]} />
              </div>
            )}
          </div>
          <div className="flex justify-between py-2">
            {account?.status === "connected" && (
              <div>
                <ClaimTokens />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
