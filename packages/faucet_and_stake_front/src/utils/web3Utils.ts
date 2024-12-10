/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
//utils/web3Utils.ts

import { ethers } from "ethers";
// import Web3Modal from "web3modal";
import Web3Modal, {
  IProviderOptions,
  IProviderDisplay,
  Connector,
} from "web3modal";
import tokenAbi from "../../../abis/MyToken.json";
import faucetAbi from "../../../abis//Faucet.json";
import stakingAbi from "../../../abis/Staking.json";

// const stakingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const faucetAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

export const ERC20_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const STAKING_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
export const FAUCET_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

function createProviderOptions(): IProviderOptions {
  return {
    injected: {
      package: null,
      display: {
        name: "MetaMask",
        description: "Connect with MetaMask",
      } as IProviderDisplay,
      connector: async () => {
        // Ensure MetaMask is available
        if (window.ethereum && window.ethereum.isMetaMask) {
          return window.ethereum;
        }
        throw new Error("MetaMask not found");
      },
    },
  };
}

async function connectWithTimeout(
  web3Modal: Web3Modal,
  timeout: number = 10000
): Promise<any> {
  return new Promise(async (resolve, reject) => {
    // Set up timeout
    const timer = setTimeout(() => {
      reject(new Error("Connection timeout"));
    }, timeout);

    try {
      // Try Web3Modal connection
      const instance = await web3Modal.connect();
      clearTimeout(timer);
      resolve(instance);
    } catch (error) {
      clearTimeout(timer);

      // Fallback connection methods
      try {
        // Direct MetaMask connection
        if (window.ethereum && window.ethereum.isMetaMask) {
          await window.ethereum.request({ method: "eth_requestAccounts" });
          resolve(window.ethereum);
          return;
        }
      } catch (fallbackError) {
        reject(fallbackError);
      }

      reject(error);
    }
  });
}

export const connectWallet = async (
  setProvider: (provider: ethers.BrowserProvider | null) => void,
  setSigner: (signer: ethers.JsonRpcSigner | null) => void,
  setAccount: (account: string | null) => void,
  setIsConnected: (isConnected: boolean) => void,
  setError: (error: string | null) => void,
  setCurrentChainId: (chain: bigint | null) => void,
  setStakedAmount: (amount: number) => void,
  setBalance: (balance: number) => void,
  desiredChainId: bigint
) => {
  try {
    const web3Modal = new Web3Modal({
      cacheProvider: true,
      providerOptions: createProviderOptions(),
      disableInjectedProvider: false,
    });

    // Connect to the wallet with enhanced connection method
    // const instance = await connectWithTimeout(web3Modal);
    const instance = await web3Modal.connect();

    // Create ethers provider
    const provider = new ethers.BrowserProvider(instance);

    // Get the signer
    const signer = await provider.getSigner();

    // Get wallet address
    const address = await signer.getAddress();

    // Get network information
    const network = await provider.getNetwork();

    // Si se especifica un chainId deseado y es diferente al actual, intentar cambiar de red
    if (desiredChainId && network.chainId !== desiredChainId) {
      try {
        const chainId = `0x${desiredChainId.toString(16)}`;
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId }],
        });
        setCurrentChainId(BigInt(chainId));
      } catch (switchError: any) {
        console.error("Error al cambiar de red:", switchError);
        setError("No se pudo cambiar a la red deseada.");
        return;
      }
    }
    setCurrentChainId(BigInt(desiredChainId));
    setProvider(provider);
    setSigner(signer);
    setAccount(address);
    setIsConnected(true);
    setError(null);
    await fetchTokenBalance(signer, address, setBalance, setError);
    const stakedAmount = await fetchStakedAmount(address, signer, setError);
    setStakedAmount(stakedAmount);
    // await fetchStakedAmount()
  } catch (error: any) {
    console.log(error.message);
    setError("No se pudo conectar a la wallet.");
  }
};

// Función para obtener el balance del token
export const fetchTokenBalance = async (
  signer: ethers.JsonRpcSigner,
  address: string,
  setBalance: Function,
  setError: Function
) => {
  try {
    console.log("fetchTokenBalance");

    const tokenContract = new ethers.Contract(
      ERC20_ADDRESS,
      tokenAbi.abi,
      signer
    );
    const balance = await tokenContract.balanceOf(address);
    console.log("balance: ", balance);
    setBalance(parseFloat(ethers.formatUnits(balance, 6)));
  } catch (err) {
    console.error("Error al obtener el balance del token:", err);
    setError("No se pudo obtener el balance del token.");
  }
};

export const fetchStakedAmount = async (
  address: string,
  signer: ethers.JsonRpcSigner,
  setError: (message: string) => void
): Promise<number> => {
  try {
    console.log("fetchStakedAmount");
    if (!ethers.isAddress(address)) {
      throw new Error("Dirección inválida.");
    }

    const stakingContract = new ethers.Contract(
      STAKING_ADDRESS,
      stakingAbi.abi,
      signer
    );

    const stakedAmount = await stakingContract.getStakedAmount(address);

    // Convertir el monto a un número flotante con 6 decimales
    const staked = parseFloat(ethers.formatUnits(stakedAmount, 6));
    return staked;
  } catch (err) {
    console.error("Error al obtener el monto staked:", err);
    setError("No se pudo obtener el monto staked.");
    return 0; // Devuelve 0 como valor seguro en caso de error
  }
};

// Función para reclamar tokens
export const claimTokens = async (
  signer: ethers.JsonRpcSigner | null,
  provider: ethers.BrowserProvider | null,
  setLoading: Function,
  setError: Function,
  setTxHash: Function
  // fetchTokenBalance: Function,
  // account: string | null,
  // setBalance: Function
) => {
  console.log("claimTokens");
  if (!signer || !provider) {
    setError("No estás conectado a ninguna wallet.");
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const faucetContract = new ethers.Contract(
      FAUCET_ADDRESS,
      faucetAbi.abi,
      signer
    );
    const tx = await faucetContract.claimTokens();
    const receipt = await tx.wait();

    console.log("Transacción enviada:", tx);
    console.log("Receipt:", receipt);

    setTxHash(tx.hash);
    // await fetchTokenBalance(signer, account, setBalance, setError);
  } catch (err: any) {
    console.error("Error en claimTokens:", err);
    setError(err.message || "Ocurrió un error al reclamar los tokens.");
  } finally {
    setLoading(false);
  }
};

// Función para aprobar tokens
export const approveTokens = async (
  amount: number,
  ERC20_ADDRESS: string,
  spenderAddress: string,
  signer: ethers.JsonRpcSigner
) => {
  console.log("approveTokens");
  const tokenContract = new ethers.Contract(
    ERC20_ADDRESS,
    tokenAbi.abi,
    signer
  );
  const tx = await tokenContract.approve(
    spenderAddress,
    ethers.parseUnits(amount.toString(), 6)
  );
  await tx.wait();
  console.log("Tokens aprobados:", tx);
};

// Función para hacer stake de tokens
export const stakeTokens = async (
  signer: ethers.JsonRpcSigner | null,
  provider: ethers.BrowserProvider | null,
  amount: number,
  setLoading: Function,
  setError: Function,
  setTxHash: Function,
  setStakedAmount: Function,
  setStakingStart: Function
) => {
  console.log("stakeTokens");
  if (!signer || !provider) {
    setError("No estás conectado a ninguna wallet.");
    return;
  }

  const stakingContract = new ethers.Contract(
    STAKING_ADDRESS,
    stakingAbi.abi,
    signer
  );
  const amountInTokens = ethers.parseUnits(amount.toString(), 6);

  try {
    setLoading(true);
    setError(null);

    await approveTokens(
      amount,
      "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      STAKING_ADDRESS,
      signer
    );
    const tx = await stakingContract.stake(amountInTokens);
    const receipt = await tx.wait();

    console.log("Transacción enviada:", tx);
    console.log("Receipt:", receipt);

    setTxHash(tx.hash);
    setStakedAmount((prev: number) => prev + amount);
    setStakingStart(new Date());
  } catch (err: any) {
    console.error("Error en stakeTokens:", err);
    setError(err.message || "Ocurrió un error al hacer stake de los tokens.");
  } finally {
    setLoading(false);
  }
};

// Función para hacer unstake de tokens

export const unstakeTokens = async (
  signer: ethers.JsonRpcSigner | null,
  provider: ethers.BrowserProvider | null,
  amount: number,
  setLoading: Function,
  setError: Function,
  setTxHash: Function,
  setStakedAmount: Function,
  setStakingStart: Function,
  setStakingRewards: Function
) => {
  console.log("Iniciando proceso de unstakeTokens...");
  if (!signer || !provider) {
    setError("No estás conectado a ninguna wallet.");
    return;
  }

  const stakingContract = new ethers.Contract(
    STAKING_ADDRESS,
    stakingAbi.abi,
    signer
  );

  try {
    setLoading(true);
    setError(null);

    // Obtener la dirección del usuario
    const userAddress = await signer.getAddress();
    console.log("Dirección del usuario:", userAddress);

    // Consultar el stakedAmount desde el contrato
    const stakedAmountBigNumber: bigint = await stakingContract.getStakedAmount(
      userAddress
    );
    console.log(
      "Monto staked actual (en wei):",
      stakedAmountBigNumber.toString()
    );

    const stakedAmount = parseFloat(
      ethers.formatUnits(stakedAmountBigNumber, 6)
    );
    console.log("Monto staked actual (formateado):", stakedAmount);

    console.log(`Intentando hacer unstake de ${amount} tokens.`);

    // Verificar el balance del contrato de staking
    const stakingContractBalance = await checkStakingContractBalance(
      signer,
      setError
    );
    console.log(
      "Balance del contrato de staking disponible:",
      stakingContractBalance
    );

    // Validar que el usuario tiene suficiente stakedAmount para hacer unstake
    if (amount > stakedAmount) {
      setError(
        "No tienes suficientes tokens apostados para realizar esta operación."
      );
      setLoading(false);
      return;
    }

    const valueToUnstake = ethers.parseUnits(amount.toString(), 6);
    console.log("Cantidad a desapostar (en wei):", valueToUnstake.toString());

    // Realizar la transacción de unstake
    const tx = await stakingContract.unstake(valueToUnstake);
    const receipt = await tx.wait();

    console.log("Transacción enviada:", tx);
    console.log("Receipt:", receipt);

    setTxHash(tx.hash);
    setStakedAmount((prev: number) => prev - amount);

    // Si el usuario ha desapostado todo, restablecer los estados relacionados
    if (amount >= stakedAmount) {
      setStakingStart(null);
      setStakingRewards(0);
    }
  } catch (err: any) {
    console.error("Error en unstakeTokens:", err);
    setError(err.message || "Ocurrió un error al hacer unstake de los tokens.");
  } finally {
    setLoading(false);
  }
};
export const checkStakingContractBalance = async (
  signer: ethers.JsonRpcSigner,
  setError: Function
) => {
  try {
    const tokenContract = new ethers.Contract(
      ERC20_ADDRESS,
      tokenAbi.abi,
      signer
    );
    const stakingBalance = await tokenContract.balanceOf(STAKING_ADDRESS);
    console.log(
      "Balance del contrato de staking (en wei):",
      stakingBalance.toString()
    );

    const stakingBalanceFormatted = parseFloat(
      ethers.formatUnits(stakingBalance, 6)
    );
    console.log(
      "Balance del contrato de staking (formateado):",
      stakingBalanceFormatted
    );

    return stakingBalanceFormatted;
  } catch (err) {
    console.error("Error al obtener el balance del contrato de staking:", err);
    setError("No se pudo obtener el balance del contrato de staking.");
    return 0;
  }
};

// Función para desconectar la wallet
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

// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unsafe-function-type */
// import { ethers } from "ethers";
// import Web3Modal from "web3modal";
// import tokenAbi from "../../../abis/MyToken.json";
// import faucetAbi from "../../../abis/Faucet.json";
// import stakingAbi from "../../../abis/Staking.json";

// const stakingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
// const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
// const faucetAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

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
//   try {
//     console.log("Conectando a MetaMask...");
//     const web3Modal = new Web3Modal({
//       cacheProvider: true, // Recuerda el proveedor seleccionado
//       providerOptions: {
//         injected: {
//           display: {
//             name: "MetaMask",
//             description: "Conectar con MetaMask",
//           },
//           package: null,
//         },
//       },
//     });

//     const instance = await web3Modal.connect();

//     // Verificar que la wallet seleccionada sea MetaMask
//     if (!instance.isMetaMask) {
//       setError("Por favor, selecciona MetaMask como proveedor.");
//       return;
//     }

//     const provider = new ethers.BrowserProvider(instance);
//     const signer = await provider.getSigner();
//     const address = await signer.getAddress();
//     const network = await provider.getNetwork();

//     // Si el chainId actual es diferente al deseado, intentar cambiar
//     if (desiredChainId && network.chainId !== desiredChainId) {
//       try {
//         const chainId = `0x${desiredChainId.toString(16)}`;
//         await window.ethereum.request({
//           method: "wallet_switchEthereumChain",
//           params: [{ chainId }],
//         });
//         setCurrentChainId(BigInt(chainId));
//       } catch (switchError: any) {
//         console.error("Error al cambiar de red:", switchError);
//         setError("No se pudo cambiar a la red deseada.");
//         return;
//       }
//     }

//     setProvider(provider);
//     setSigner(signer);
//     setAccount(address);
//     setIsConnected(true);
//     setError(null);
//     await fetchTokenBalance(signer, address, setBalance, setError);
//     const stakedAmount = await fetchStakedAmount(address, signer, setError);
//     setStakedAmount(stakedAmount);

//     console.log("Conexión a MetaMask exitosa.");
//   } catch (error: any) {
//     console.error("Error al conectar la wallet:", error.message);
//     setError("No se pudo conectar a la wallet.");
//   }
// };

// // Función para obtener el balance del token
// export const fetchTokenBalance = async (
//   signer: ethers.JsonRpcSigner,
//   address: string,
//   setBalance: Function,
//   setError: Function
// ) => {
//   try {
//     console.log("Obteniendo balance del token...");

//     const tokenContract = new ethers.Contract(
//       tokenAddress,
//       tokenAbi.abi,
//       signer
//     );
//     const balance = await tokenContract.balanceOf(address);
//     console.log("Balance:", balance.toString());
//     setBalance(parseFloat(ethers.formatUnits(balance, 6)));
//   } catch (err) {
//     console.error("Error al obtener el balance del token:", err);
//     setError("No se pudo obtener el balance del token.");
//   }
// };

// // Función para obtener la cantidad staked
// export const fetchStakedAmount = async (
//   address: string,
//   signer: ethers.JsonRpcSigner,
//   setError: (message: string) => void
// ): Promise<number> => {
//   try {
//     console.log("Obteniendo monto staked...");
//     if (!ethers.isAddress(address)) {
//       throw new Error("Dirección inválida.");
//     }

//     const stakingContract = new ethers.Contract(
//       stakingAddress,
//       stakingAbi.abi,
//       signer
//     );

//     const stakedAmount = await stakingContract.getStakedAmount(address);
//     return parseFloat(ethers.formatUnits(stakedAmount, 6));
//   } catch (err) {
//     console.error("Error al obtener el monto staked:", err);
//     setError("No se pudo obtener el monto staked.");
//     return 0;
//   }
// };

// // Función para reclamar tokens
// export const claimTokens = async (
//   signer: ethers.JsonRpcSigner | null,
//   provider: ethers.BrowserProvider | null,
//   setLoading: Function,
//   setError: Function,
//   setTxHash: Function
// ) => {
//   console.log("Reclamando tokens...");
//   if (!signer || !provider) {
//     setError("No estás conectado a ninguna wallet.");
//     return;
//   }

//   try {
//     setLoading(true);
//     setError(null);

//     const faucetContract = new ethers.Contract(
//       faucetAddress,
//       faucetAbi.abi,
//       signer
//     );
//     const tx = await faucetContract.claimTokens();
//     const receipt = await tx.wait();

//     console.log("Transacción enviada:", tx);
//     console.log("Receipt:", receipt);

//     setTxHash(tx.hash);
//   } catch (err: any) {
//     console.error("Error en claimTokens:", err);
//     setError(err.message || "Ocurrió un error al reclamar los tokens.");
//   } finally {
//     setLoading(false);
//   }
// };

// // Función para hacer stake de tokens
// export const stakeTokens = async (
//   signer: ethers.JsonRpcSigner | null,
//   provider: ethers.BrowserProvider | null,
//   amount: number,
//   setLoading: Function,
//   setError: Function,
//   setTxHash: Function,
//   setStakedAmount: Function,
//   setStakingStart: Function
// ) => {
//   console.log("Haciendo stake de tokens...");
//   if (!signer || !provider) {
//     setError("No estás conectado a ninguna wallet.");
//     return;
//   }

//   const stakingContract = new ethers.Contract(
//     stakingAddress,
//     stakingAbi.abi,
//     signer
//   );
//   const amountInTokens = ethers.parseUnits(amount.toString(), 6);

//   try {
//     setLoading(true);
//     setError(null);

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

// // Función para desconectar la wallet
// export const logout = (
//   setAccount: Function,
//   setProvider: Function,
//   setSigner: Function,
//   setIsConnected: Function,
//   setBalance: Function,
//   setStakedAmount: Function,
//   setStakingStart: Function,
//   setStakingRewards: Function,
//   setCurrentChainId: Function,
//   setError: Function,
//   setTxHash: Function
// ) => {
//   console.log("Desconectando la wallet...");
//   setAccount(null);
//   setProvider(null);
//   setSigner(null);
//   setIsConnected(false);
//   setBalance(0);
//   setStakedAmount(0);
//   setStakingStart(null);
//   setCurrentChainId(null);
//   setError(null);
//   setTxHash(null);
// };
