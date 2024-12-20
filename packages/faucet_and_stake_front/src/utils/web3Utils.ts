/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
//utils/web3Utils.ts
"use client";

import { ethers } from "ethers";
// import { useReadContract } from "wagmi";
// import Web3Modal, { IProviderOptions, IProviderDisplay } from "web3modal";
import tokenAbi from "../../../abis/MyToken.json";
import faucetAbi from "../../../abis/Faucet.json";
import stakingAbi from "../../../abis/Staking.json";

import { ERC20_ADDRESS, STAKING_ADDRESS, FAUCET_ADDRESS } from "../config";
import { Config, UseAccountReturnType, UseReadContractParameters } from "wagmi";
import { WriteContractMutate } from "wagmi/query";
import { useReadContract } from "wagmi";
// function createProviderOptions(): IProviderOptions {
//   return {
//     injected: {
//       package: null,
//       display: {
//         name: "MetaMask",
//         description: "Connect with MetaMask",
//       } as IProviderDisplay,
//       connector: async () => {
//         // Ensure MetaMask is available
//         if (window.ethereum && window.ethereum.isMetaMask) {
//           return window.ethereum;
//         }
//         throw new Error("MetaMask not found");
//       },
//     },
//   };
// }

// export const connectWallet = async (
//   setProvider: (provider: ethers.BrowserProvider | null) => void,
//   setSigner: (signer: ethers.JsonRpcSigner | null) => void,
//   setAccount: (account: string | null) => void,
//   setIsConnected: (isConnected: boolean) => void,
//   setError: (error: string | null) => void,
//   setCurrentChainId: (chain: bigint | null) => void,
//   setStakedAmount: (amount: number) => void,
//   setBalance: (balance: number) => void,
//   desiredChainId: bigint
// ) => {
//   console.log("Iniciando conexión a la wallet...");
//   try {
//     const web3Modal = new Web3Modal({
//       cacheProvider: true,
//       providerOptions: createProviderOptions(),
//       disableInjectedProvider: false,
//     });

//     console.log("Mostrando modal de conexión...");
//     const instance = await web3Modal.connect(); // Aquí podría fallar
//     console.log("Modal cerrado, conexión obtenida.");

//     const provider = new ethers.BrowserProvider(instance);
//     const signer = await provider.getSigner();
//     const address = await signer.getAddress();
//     const network = await provider.getNetwork();

//     console.log("Dirección obtenida:", address);
//     console.log("Red actual:", network);

//     // Cambiar de red si es necesario
//     if (desiredChainId && network.chainId !== desiredChainId) {
//       console.log("Cambiando a la red deseada...");
//       const chainIdHex = `0x${desiredChainId.toString(16)}`;
//       try {
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId: chainIdHex }],
//         });
//       } catch (error: any) {
//         if (error.code === 4902) {
//           console.log("La red no está agregada, intentando agregarla...");
//           await window.ethereum.request({
//             method: "wallet_addEthereumChain",
//             params: [
//               {
//                 chainId: chainIdHex,
//                 chainName: "Fantom Testnet",
//                 nativeCurrency: {
//                   name: "Fantom",
//                   symbol: "FTM",
//                   decimals: 18,
//                 },
//                 rpcUrls: ["https://rpc.testnet.fantom.network"],
//                 blockExplorerUrls: ["https://explorer.testnet.fantom.network/"],
//               },
//             ],
//           });
//         } else {
//           console.error("Error al cambiar de red:", error);
//           setError("No se pudo cambiar a la red deseada.");
//           return;
//         }
//       }
//     }

//     setProvider(provider);
//     setSigner(signer);
//     setAccount(address);
//     setIsConnected(true);
//     setCurrentChainId(BigInt(desiredChainId));
//     setError(null);

//     console.log("Conexión exitosa, obteniendo balance...");
//     await fetchTokenBalance(signer, address, setBalance, setError);

//     console.log("Obteniendo monto staked...");
//     const stakedAmount = await fetchStakedAmount(address, signer, setError);
//     setStakedAmount(stakedAmount);
//   } catch (error: any) {
//     console.error("Error en connectWallet:", error.message);
//     setError("No se pudo conectar a la wallet.");
//   }
// };

// export const FetchTokenBalance = (
//   // useReadContract: UseReadContractParameters,
//   account: UseAccountReturnType<Config>,
//   setBalance: Function,
//   setShowError: Function
// ) => {
//   console.log("fetchTokenBalance");
//   // const tokenContract = new ethers.Contract(
//   //   ERC20_ADDRESS,
//   //   tokenAbi.abi,
//   //   signer
//   // );
//   // const balance = await tokenContract.balanceOf(address);
//   // console.log("balance: ", balance);
//   const { data: balance, error } = useReadContract({
//     ...tokenAbi.abi,
//     functionName: "balanceOf",
//     args: ["0x03A71968491d55603FFe1b11A9e23eF013f75bCF"],
//   });
//   if (error) {
//     setShowError(error);
//   }
//   setBalance(parseFloat(ethers.formatUnits(balance, 6)));
// };

// export const fetchStakedAmount = async (
//   address: string,
//   signer: ethers.JsonRpcSigner,
//   setError: (message: string) => void
// ): Promise<number> => {
//   try {
//     console.log("fetchStakedAmount");
//     if (!ethers.isAddress(address)) {
//       throw new Error("Dirección inválida.");
//     }

//     const stakingContract = new ethers.Contract(
//       STAKING_ADDRESS,
//       stakingAbi.abi,
//       signer
//     );

//     const stakedAmount = await stakingContract.getStakedAmount(address);
//     const staked = parseFloat(ethers.formatUnits(stakedAmount, 6));
//     return staked;
//   } catch (err) {
//     console.error("Error al obtener el monto staked:", err);
//     setError("No se pudo obtener el monto staked.");
//     return 0;
//   }
// };

// export const claimTokens = async (
//   signer: ethers.JsonRpcSigner | null,
//   provider: ethers.BrowserProvider | null,
//   setLoading: Function,
//   setError: Function,
//   setTxHash: Function
// ) => {
//   console.log("Iniciando el proceso de reclamo de tokens...");

//   if (!signer) {
//     console.error("No hay conexión activa con una wallet.");
//     setError("No estás conectado a ninguna wallet.");
//     return;
//   }

//   try {
//     setLoading(true);
//     setError(null);

//     const userAddress = await signer.getAddress();
//     console.log("Dirección del usuario:", userAddress);

//     const faucetContract = new ethers.Contract(
//       FAUCET_ADDRESS,
//       faucetAbi.abi,
//       signer
//     );

//     const balance = await faucetContract.balanceOf(address);

//     console.log("Obteniendo estado inicial del contrato...");
//     const contractBalance = await provider.getBalance(FAUCET_ADDRESS);
//     console.log(
//       "Balance del contrato del faucet (en wei):",
//       contractBalance.toString()
//     );

//     if (contractBalance === 0n) {
//       console.error(
//         "El contrato del faucet no tiene balance suficiente para reclamar tokens."
//       );
//       setError("El contrato del faucet no tiene balance suficiente.");
//       return;
//     }

//     console.log("Preparando para llamar al método claimTokens...");
//     const tx = await faucetContract.claimTokens();
//     console.log("Transacción enviada. Hash:", tx.hash);

//     console.log("Esperando la confirmación de la transacción...");
//     const receipt = await tx.wait();

//     console.log("Transacción confirmada. Receipt:", receipt);
//     console.log(
//       "Tokens reclamados exitosamente. Hash de la transacción:",
//       tx.hash
//     );

//     setTxHash(tx.hash);
//   } catch (err: any) {
//     if (err.code === 4001) {
//       console.error("Transacción rechazada por el usuario.");
//       setError("Transacción rechazada por el usuario.");
//     } else {
//       console.error("Error al intentar reclamar los tokens:", err);
//       setError(err.message || "Ocurrió un error al reclamar los tokens.");
//     }
//   } finally {
//     console.log("Proceso de reclamo de tokens finalizado.");
//     setLoading(false);
//   }
// };

// export const approveTokens = async (
//   amount: number,
//   ERC20_ADDRESS: string,
//   spenderAddress: string,
//   signer: ethers.JsonRpcSigner
// ) => {
//   console.log("Iniciando proceso de aprobación de tokens...");

//   try {
//     console.log(`Cantidad a aprobar: ${amount} tokens.`);
//     console.log(`Dirección del contrato ERC20: ${ERC20_ADDRESS}`);
//     console.log(`Dirección del gastador: ${spenderAddress}`);

//     const tokenContract = new ethers.Contract(
//       ERC20_ADDRESS,
//       tokenAbi.abi,
//       signer
//     );

//     console.log("Llamando a la función approve del contrato ERC20...");
//     const tx = await tokenContract.approve(
//       spenderAddress,
//       ethers.parseUnits(amount.toString(), 6)
//     );
//     console.log("Transacción enviada. Hash:", tx.hash);

//     console.log("Esperando la confirmación de la transacción...");
//     const receipt = await tx.wait();

//     console.log("Transacción confirmada. Receipt:", receipt);
//     console.log("Tokens aprobados exitosamente.");
//   } catch (err: any) {
//     console.error("Error durante el proceso de aprobación de tokens:", err);
//     throw new Error(err.message || "No se pudo aprobar los tokens.");
//   }
// };

// export const stakeTokens = async (
//   signer: ethers.JsonRpcSigner | null,
//   writeContract: WriteContractMutate<Config, unknown>,
//   amount: number,
//   setLoading: Function,
//   setError: Function,
//   setTxHash: Function,
//   setStakedAmount: Function,
//   setStakingStart: Function
// ) => {
//   console.log("stakeTokens");
//   if (!signer) {
//     setError("No estás conectado a ninguna wallet.");
//     return;
//   }

//   const stakingContract = new ethers.Contract(
//     STAKING_ADDRESS,
//     stakingAbi.abi,
//     signer
//   );
//   const amountInTokens = ethers.parseUnits(amount.toString(), 6);

//   try {
//     setLoading(true);
//     setError(null);

//     await approveTokens(amount, ERC20_ADDRESS, STAKING_ADDRESS, signer);
//     const tx = await stakingContract.stake(amountInTokens);
//     const receipt = await tx.wait();

//     console.log("Transacción enviada:", tx);
//     console.log("Receipt:", receipt);

//     setTxHash(tx.hash);
//     setStakedAmount((prev: number) => prev + amount);
//     setStakingStart(new Date());
//   } catch (err: any) {
//     console.error("Error en stakeTokens:", err);
//     setError(err.message || "Ocurrió un error al hacer stake de los tokens.");
//   } finally {
//     setLoading(false);
//   }
// };

// export const unstakeTokens = async (
//   signer: ethers.JsonRpcSigner | null,
//   provider: ethers.BrowserProvider | null,
//   amount: number,
//   setLoading: Function,
//   setError: Function,
//   setTxHash: Function,
//   setStakedAmount: Function,
//   setStakingStart: Function,
//   setStakingRewards: Function
// ) => {
//   console.log("Iniciando proceso de unstakeTokens...");
//   if (!signer) {
//     setError("No estás conectado a ninguna wallet.");
//     return;
//   }

//   const stakingContract = new ethers.Contract(
//     STAKING_ADDRESS,
//     stakingAbi.abi,
//     signer
//   );

//   try {
//     setLoading(true);
//     setError(null);

//     const userAddress = await signer.getAddress();
//     console.log("Dirección del usuario:", userAddress);

//     const stakedAmountBigNumber: bigint = await stakingContract.getStakedAmount(
//       userAddress
//     );
//     console.log(
//       "Monto staked actual (en wei):",
//       stakedAmountBigNumber.toString()
//     );

//     const stakedAmount = parseFloat(
//       ethers.formatUnits(stakedAmountBigNumber, 6)
//     );
//     console.log("Monto staked actual (formateado):", stakedAmount);

//     console.log(`Intentando hacer unstake de ${amount} tokens.`);

//     const stakingContractBalance = await checkStakingContractBalance(
//       signer,
//       setError
//     );
//     console.log(
//       "Balance del contrato de staking disponible:",
//       stakingContractBalance
//     );

//     if (amount > stakedAmount) {
//       setError(
//         "No tienes suficientes tokens apostados para realizar esta operación."
//       );
//       setLoading(false);
//       return;
//     }

//     const valueToUnstake = ethers.parseUnits(amount.toString(), 6);
//     console.log("Cantidad a desapostar (en wei):", valueToUnstake.toString());

//     const tx = await stakingContract.unstake(valueToUnstake);
//     const receipt = await tx.wait();

//     console.log("Transacción enviada:", tx);
//     console.log("Receipt:", receipt);

//     setTxHash(tx.hash);
//     setStakedAmount((prev: number) => prev - amount);

//     if (amount >= stakedAmount) {
//       setStakingStart(null);
//       setStakingRewards(0);
//     }
//   } catch (err: any) {
//     console.error("Error en unstakeTokens:", err);
//     setError(err.message || "Ocurrió un error al hacer unstake de los tokens.");
//   } finally {
//     setLoading(false);
//   }
// };

// export const checkStakingContractBalance = async (
//   signer: ethers.JsonRpcSigner,
//   setError: Function
// ) => {
//   try {
//     const tokenContract = new ethers.Contract(
//       ERC20_ADDRESS,
//       tokenAbi.abi,
//       signer
//     );
//     const stakingBalance = await tokenContract.balanceOf(STAKING_ADDRESS);
//     console.log(
//       "Balance del contrato de staking (en wei):",
//       stakingBalance.toString()
//     );

//     const stakingBalanceFormatted = parseFloat(
//       ethers.formatUnits(stakingBalance, 6)
//     );
//     console.log(
//       "Balance del contrato de staking (formateado):",
//       stakingBalanceFormatted
//     );

//     return stakingBalanceFormatted;
//   } catch (err) {
//     console.error("Error al obtener el balance del contrato de staking:", err);
//     setError("No se pudo obtener el balance del contrato de staking.");
//     return 0;
//   }
// };

export const logout = (
  setAccount: Function,
  setProvider: Function,
  setSigner: Function,
  setIsConnected: Function,
  setBalance: Function,
  setStakedAmount: Function,
  setStakingStart: Function,
  setStakingRewards: Function,
  setCurrentChainId: Function,
  setError: Function,
  setTxHash: Function
) => {
  setAccount(null);
  setProvider(null);
  setSigner(null);
  setIsConnected(false);
  setBalance(0);
  setStakedAmount(0);
  setStakingStart(null);
  setStakingRewards(0);
  setCurrentChainId(null);
  setError(null);
  setTxHash(null);
};
