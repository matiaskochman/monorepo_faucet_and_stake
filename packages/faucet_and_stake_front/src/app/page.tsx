// "use client";

// import { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Card,
//   CardContent,
//   CardHeader,
//   TextField,
//   Divider,
//   CircularProgress,
// } from "@mui/material";
// import { useAccount, useConnect, useDisconnect } from "wagmi";
// // import { ERC20_ADDRESS, STAKING_ADDRESS, FAUCET_ADDRESS } from "../config";
// import { IContractAddresses, useContractAddresses } from "@/hooks/useContractAddresses";
// import TokenBalance from "@/components/ui/TokenBalance";
// import ClaimTokens from "@/components/ui/ClaimTokens";

// export default function Web3TokenDashboard() {
//   const [stakeAmount, setStakeAmount] = useState<number>(0);
//   const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
//   const [loading, setLoading] = useState(false);

//   const { connectors, connect } = useConnect();
//   const { disconnect } = useDisconnect();
//   const account = useAccount();

//   const contractAddresses:IContractAddresses | null = useContractAddresses();
//   // Manejar la conexión y desconexión
//   const handleConnect = (connectorId: string) => {
//     const connector = connectors.find((c) => c.id === connectorId);
//     if (connector) {
//       connect({ connector });
//     }
//   };

//   const handleDisconnect = () => {
//     disconnect();
//   };

//   if (!contractAddresses && account.isConnected) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           minHeight: "100vh",
//           bgcolor: "background.default",
//           p: 2,
//         }}
//       >
//         <Card sx={{ maxWidth: 600, width: "100%" }}>
//           <CardHeader
//             title="Web3 Token Dashboard"
//             sx={{ textAlign: "center", bgcolor: "primary.main", color: "#fff" }}
//           />
//           <CardContent>
//             {/* Información de los contratos */}
//             <Box>
//               <Typography variant="h6">Información de Contratos</Typography>
//               <Divider sx={{ my: 2 }} />
//               {contractAddresses && (
//                 <Box sx={{ mb: 2 }}>
//                   <Typography variant="body1">
//                     <strong>Contrato ERC20:</strong>{" "}
//                     {contractAddresses.ERC20_ADDRESS}
//                   </Typography>
//                   <Typography variant="body1">
//                     <strong>Contrato Staking:</strong>{" "}
//                     {contractAddresses.STAKING_ADDRESS}
//                   </Typography>
//                   <Typography variant="body1">
//                     <strong>Contrato Faucet:</strong>{" "}
//                     {contractAddresses.FAUCET_ADDRESS}
//                   </Typography>
//                 </Box>
//               ) : (
//                 <Typography variant="body1">
//                   No hay contratos definidos para la red actual.
//                 </Typography>
//               )}
//             </Box>

//             {/* Estado de la cuenta */}
//             <Box>
//               <Typography variant="h6">Estado de la Cuenta</Typography>
//               <Divider sx={{ my: 2 }} />
//               {account.status === "connected" ? (
//                 <>
//                   <Typography variant="body1">
//                     <strong>Status:</strong> Conectado
//                   </Typography>
//                   <Typography variant="body1">
//                     <strong>Dirección:</strong> {account.address || "N/A"}
//                   </Typography>
//                   <Typography variant="body1">
//                     <strong>Chain ID:</strong> {account.chainId || "N/A"}
//                   </Typography>
//                   <Button
//                     variant="contained"
//                     color="error"
//                     onClick={handleDisconnect}
//                     sx={{ mt: 2 }}
//                   >
//                     Disconnect
//                   </Button>
//                 </>
//               ) : (
//                 <>
//                   <Typography variant="body1">
//                     Conecta tu wallet para continuar.
//                   </Typography>
//                   <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
//                     {connectors.map((connector) => (
//                       <Button
//                         key={connector.id}
//                         variant="contained"
//                         onClick={() => handleConnect(connector.id)}
//                       >
//                         {connector.name}
//                       </Button>
//                     ))}
//                   </Box>
//                 </>
//               )}
//             </Box>

//             {/* Componente ClaimTokens */}
//             {account.isConnected && contractAddresses && (
//               <Box sx={{ mt: 2 }}>
//                 <ClaimTokens
//                   contractAddress={contractAddresses.FAUCET_ADDRESS}
//                 />
//               </Box>
//             )}

//             {/* Componente TokenBalance */}
//             {account.isConnected && contractAddresses && (
//               <Box sx={{ mt: 2 }}>
//                 <TokenBalance
//                   address={account.address}
//                   contractAddress={contractAddresses.ERC20_ADDRESS}
//                 />
//               </Box>
//             )}

//             {/* Acciones de staking */}
//             {account.status === "connected" && (
//               <Box sx={{ mt: 4 }}>
//                 <Typography variant="h6">Acciones de Staking</Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <TextField
//                   label="Cantidad para Stake"
//                   type="number"
//                   value={stakeAmount}
//                   onChange={(e) => setStakeAmount(Number(e.target.value))}
//                   fullWidth
//                   sx={{ mb: 2 }}
//                 />
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={() => {
//                     setLoading(true);
//                     setTimeout(() => setLoading(false), 2000); // Simula una operación
//                   }}
//                   disabled={loading}
//                   fullWidth
//                 >
//                   {loading ? <CircularProgress size={24} /> : `Stake Tokens`}
//                 </Button>

//                 <TextField
//                   label="Cantidad para Unstake"
//                   type="number"
//                   value={unstakeAmount}
//                   onChange={(e) => setUnstakeAmount(Number(e.target.value))}
//                   fullWidth
//                   sx={{ mt: 2 }}
//                 />
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={() => {
//                     setLoading(true);
//                     setTimeout(() => setLoading(false), 2000); // Simula una operación
//                   }}
//                   disabled={loading}
//                   fullWidth
//                   sx={{ mt: 2 }}
//                 >
//                   {loading ? <CircularProgress size={24} /> : `Unstake Tokens`}
//                 </Button>
//               </Box>
//             )}
//           </CardContent>
//         </Card>
//       </Box>
//     );
//   }
// }
// Path: src/app/page.tsx

"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import TokenBalance from "@/components/ui/TokenBalance";
import ClaimTokens from "@/components/ui/ClaimTokens";
import { useContractAddresses } from "@/hooks/useContractAddresses";

export default function Web3TokenDashboard() {
  const [stakeAmount, setStakeAmount] = useState<number>(0);
  const [unstakeAmount, setUnstakeAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Agregado para manejar errores

  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();
  const account = useAccount();

  const contractAddresses = useContractAddresses();

  // Manejar la conexión y desconexión
  const handleConnect = (connectorId: string) => {
    const connector = connectors.find((c) => c.id === connectorId);
    if (connector) {
      connect({ connector });
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!contractAddresses && account.isConnected) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "background.default",
          p: 2,
        }}
      >
        <Typography color="error">
          La red a la que estás conectado no es soportada por esta aplicación.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 600, width: "100%" }}>
        <CardHeader
          title="Web3 Token Dashboard"
          sx={{ textAlign: "center", bgcolor: "primary.main", color: "#fff" }}
        />
        <CardContent>
          {/* Información de los contratos */}
          <Box>
            <Typography variant="h6">Información de Contratos</Typography>
            <Divider sx={{ my: 2 }} />
            {contractAddresses ? (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Contrato ERC20:</strong>{" "}
                  {contractAddresses.ERC20_ADDRESS}
                </Typography>
                <Typography variant="body1">
                  <strong>Contrato Staking:</strong>{" "}
                  {contractAddresses.STAKING_ADDRESS}
                </Typography>
                <Typography variant="body1">
                  <strong>Contrato Faucet:</strong>{" "}
                  {contractAddresses.FAUCET_ADDRESS}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1">
                No hay contratos definidos para la red actual.
              </Typography>
            )}
          </Box>

          {/* Estado de la cuenta */}
          <Box>
            <Typography variant="h6">Estado de la Cuenta</Typography>
            <Divider sx={{ my: 2 }} />
            {account.isConnected ? (
              <>
                <Typography variant="body1">
                  <strong>Status:</strong> Conectado
                </Typography>
                <Typography variant="body1">
                  <strong>Dirección:</strong> {account.address || "N/A"}
                </Typography>
                <Typography variant="body1">
                  <strong>Chain ID:</strong> {account.chain?.id || "N/A"}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDisconnect}
                  sx={{ mt: 2 }}
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <>
                <Typography variant="body1">
                  Conecta tu wallet para continuar.
                </Typography>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  {connectors.map((connector) => (
                    <Button
                      key={connector.id}
                      variant="contained"
                      onClick={() => handleConnect(connector.id)}
                    >
                      {connector.name}
                    </Button>
                  ))}
                </Box>
              </>
            )}
          </Box>

          {/* Componente ClaimTokens */}
          {account.isConnected && contractAddresses && (
            <Box sx={{ mt: 2 }}>
              <ClaimTokens contractAddress={contractAddresses.FAUCET_ADDRESS} />
            </Box>
          )}

          {/* Componente TokenBalance */}
          {account.isConnected && contractAddresses && (
            <Box sx={{ mt: 2 }}>
              <TokenBalance
                address={account.address}
                contractAddress={contractAddresses.ERC20_ADDRESS}
              />
            </Box>
          )}

          {/* Acciones de staking */}
          {account.isConnected && contractAddresses && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Acciones de Staking</Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                label="Cantidad para Stake"
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(Number(e.target.value))}
                fullWidth
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={async () => {
                  setLoading(true);
                  // Aquí deberías llamar a tu función para hacer stake de tokens
                  // Por ejemplo: await handleStake()
                  // Asegúrate de implementar la lógica de staking correctamente
                  try {
                    // Implementa la lógica real de staking aquí
                    // Por ejemplo:
                    // await stakeTokens(...)
                  } catch (err) {
                    setError("Error al hacer stake de tokens.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} /> : `Stake Tokens`}
              </Button>

              <TextField
                label="Cantidad para Unstake"
                type="number"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(Number(e.target.value))}
                fullWidth
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={async () => {
                  setLoading(true);
                  // Aquí deberías llamar a tu función para hacer unstake de tokens
                  // Por ejemplo: await handleUnstake()
                  // Asegúrate de implementar la lógica de unstaking correctamente
                  try {
                    // Implementa la lógica real de unstaking aquí
                    // Por ejemplo:
                    // await unstakeTokens(...)
                  } catch (err) {
                    setError("Error al hacer unstake de tokens.");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                fullWidth
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : `Unstake Tokens`}
              </Button>

              {/* Mostrar errores si existen */}
              {error && (
                <Typography color="error" sx={{ mt: 2 }}>
                  {error}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
