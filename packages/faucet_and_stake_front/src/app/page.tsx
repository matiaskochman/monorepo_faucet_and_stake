"use client";

import { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
} from "@mui/material";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import TokenBalance from "@/components/ui/TokenBalance";
import ClaimTokens from "@/components/ui/ClaimTokens";
import { useContractAddresses } from "@/hooks/useContractAddresses";

import { StakingComponent } from "@/components/ui/Staking";

export default function Web3TokenDashboard() {
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

          {account.isConnected && contractAddresses && <StakingComponent />}
        </CardContent>
      </Card>
    </Box>
  );
}
