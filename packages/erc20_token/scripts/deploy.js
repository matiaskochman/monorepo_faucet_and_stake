// scripts/deploy.js

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  let deployer;

  // Detectar la red actual
  const network = hre.network.name;
  console.log(`Red seleccionada: ${network}`);

  if (network === "localhost") {
    // Obtener la primera cuenta disponible en localhost (Cuenta #0)
    [deployer] = await hre.ethers.getSigners();
    console.log("Usando la cuenta por defecto de localhost:", deployer.address);
  } else {
    // Dirección específica para otras redes
    const specificAddress = "0x432Bcf17BC6F3c298a624fEcfdb608c3cacd121d";

    // Intentar obtener el signer desde la dirección específica
    try {
      deployer = await hre.ethers.getSigner(specificAddress);
      console.log("Usando la cuenta específica:", deployer.address);
    } catch (error) {
      console.error(
        `No se pudo obtener el signer para la dirección específica: ${specificAddress}. Asegúrate de que la cuenta esté disponible en la red ${network}.`,
        error
      );
      return;
    }
  }
  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // Desplegar PesosArgToken
  const PesosArgToken = await hre.ethers.getContractFactory("PesosArgToken");
  console.log("Desplegando PesosArgToken...");
  const pesosArgToken = await PesosArgToken.deploy();
  await pesosArgToken.waitForDeployment(); // En ethers v6 se usa waitForDeployment()
  const pesosArgTokenAddress = await pesosArgToken.getAddress();
  console.log("PesosArgToken desplegado en:", pesosArgTokenAddress);

  // Verificar la existencia del contrato PesosArgToken en la blockchain
  const pesosArgTokenCode = await hre.ethers.provider.getCode(
    pesosArgTokenAddress
  );
  if (pesosArgTokenCode === "0x") {
    console.error(
      "Error: No existe un contrato PesosArgToken en la dirección:",
      pesosArgTokenAddress
    );
    return;
  } else {
    console.log("Contrato PesosArgToken verificado en la blockchain.");
  }

  // Desplegar Faucet pasando la dirección de PesosArgToken
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  console.log("Desplegando Faucet...");
  const faucet = await Faucet.deploy(pesosArgTokenAddress);
  await faucet.waitForDeployment();
  const faucetAddress = await faucet.getAddress();
  console.log("Faucet desplegado en:", faucetAddress);

  // Verificar la existencia del contrato Faucet en la blockchain
  const faucetCode = await hre.ethers.provider.getCode(faucetAddress);
  if (faucetCode === "0x") {
    console.error(
      "Error: No existe un contrato Faucet en la dirección:",
      faucetAddress
    );
    return;
  } else {
    console.log("Contrato Faucet verificado en la blockchain.");
  }

  // Desplegar Staking pasando la dirección de PesosArgToken
  const Staking = await hre.ethers.getContractFactory("Staking");
  console.log("Desplegando Staking...");
  const staking = await Staking.deploy(pesosArgTokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("Staking desplegado en:", stakingAddress);

  // Verificar la existencia del contrato Staking en la blockchain
  const stakingCode = await hre.ethers.provider.getCode(stakingAddress);
  if (stakingCode === "0x") {
    console.error(
      "Error: No existe un contrato Staking en la dirección:",
      stakingAddress
    );
    return;
  } else {
    console.log("Contrato Staking verificado en la blockchain.");
  }

  // Definir el hash del rol MINTER_ROLE
  const MINTER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("MINTER_ROLE")
  );

  // Otorgar el rol de MINTER_ROLE al contrato de Staking
  console.log("Otorgando MINTER_ROLE al contrato de Staking...");
  const grantRoleStakingTx = await pesosArgToken.grantRole(
    MINTER_ROLE,
    stakingAddress
  );
  await grantRoleStakingTx.wait();
  console.log("MINTER_ROLE otorgado al contrato Staking.");

  // Otorgar el rol de MINTER_ROLE al contrato Faucet
  console.log("Otorgando MINTER_ROLE al contrato Faucet...");
  const grantRoleFaucetTx = await pesosArgToken.grantRole(
    MINTER_ROLE,
    faucetAddress
  );
  await grantRoleFaucetTx.wait();
  console.log("MINTER_ROLE otorgado al contrato Faucet.");

  // Definir el hash del rol SETTER_ROLE
  const SETTER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("SETTER_ROLE")
  );

  // Otorgar el rol de SETTER_ROLE al deployer
  console.log("Otorgando SETTER_ROLE al deployer...");
  const grantSetterRoleTx = await faucet.grantRole(
    SETTER_ROLE,
    deployer.address
  );
  await grantSetterRoleTx.wait();
  console.log("SETTER_ROLE otorgado al deployer.");

  // Copiar los archivos específicos al directorio abis
  const artifactsPath = path.join(__dirname, "../artifacts");
  const destinationPath = path.join(__dirname, "../../abis");
  const filesToCopy = ["Faucet.json", "PesosArgToken.json", "Staking.json"];

  console.log("Copiando archivos específicos desde artifacts a abis...");
  copySpecificJsonFiles(artifactsPath, destinationPath, filesToCopy);
  console.log("Archivos copiados exitosamente.");
}

// Función para copiar archivos específicos
function copySpecificJsonFiles(sourceDir, destDir, filesToCopy) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);
  files.forEach((file) => {
    const fullPath = path.join(sourceDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursión en subdirectorios
      copySpecificJsonFiles(fullPath, destDir, filesToCopy);
    } else if (stat.isFile() && filesToCopy.includes(file)) {
      // Copiar archivo específico
      const destFile = path.join(destDir, file);
      fs.copyFileSync(fullPath, destFile);
      console.log(`Archivo copiado: ${file}`);
    }
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en el despliegue:", error);
    process.exit(1);
  });
