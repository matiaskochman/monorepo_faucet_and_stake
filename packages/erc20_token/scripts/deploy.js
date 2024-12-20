// scripts/deploy.js

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // const [deployer] = await hre.ethers.getSigners();
  // Obtener la dirección específica
  const specificAddress = "0x432Bcf17BC6F3c298a624fEcfdb608c3cacd121d";
  // Obtener el signer desde esa dirección (asumiendo que está en las accounts de la red)
  const deployer = await hre.ethers.getSigner(specificAddress);

  console.log("Desplegando contratos con la cuenta:", deployer.address);

  // Desplegar MyToken
  const MyToken = await hre.ethers.getContractFactory("MyToken");
  console.log("Desplegando MyToken...");
  const myToken = await MyToken.deploy();
  await myToken.waitForDeployment(); // En ethers v6 se usa waitForDeployment()
  const myTokenAddress = await myToken.getAddress();
  console.log("MyToken desplegado en:", myTokenAddress);

  // Verificar la existencia del contrato MyToken en la blockchain
  const myTokenCode = await hre.ethers.provider.getCode(myTokenAddress);
  if (myTokenCode === "0x") {
    console.error(
      "Error: No existe un contrato MyToken en la dirección:",
      myTokenAddress
    );
    return;
  } else {
    console.log("Contrato MyToken verificado en la blockchain.");
  }

  // Desplegar Faucet pasando la dirección de MyToken
  const Faucet = await hre.ethers.getContractFactory("Faucet");
  console.log("Desplegando Faucet...");
  const faucet = await Faucet.deploy(myTokenAddress);
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

  // Desplegar Staking pasando la dirección de MyToken
  const Staking = await hre.ethers.getContractFactory("Staking");
  console.log("Desplegando Staking...");
  const staking = await Staking.deploy(myTokenAddress);
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

  // Transferir la propiedad de MyToken al Faucet
  console.log("Transfiriendo propiedad de MyToken al Faucet...");
  const transferOwnershipTx = await myToken.transferOwnership(faucetAddress);
  await transferOwnershipTx.wait();
  console.log("Propiedad de MyToken transferida al Faucet.");

  // Definir el hash del rol MINTER_ROLE
  const MINTER_ROLE = hre.ethers.keccak256(
    hre.ethers.toUtf8Bytes("MINTER_ROLE")
  );

  // Otorgar el rol de MINTER_ROLE al contrato de Staking
  console.log("Otorgando MINTER_ROLE al contrato de Staking...");
  const grantRoleStakingTx = await myToken.grantRole(
    MINTER_ROLE,
    stakingAddress
  );
  await grantRoleStakingTx.wait();
  console.log("MINTER_ROLE otorgado al contrato Staking.");

  // Otorgar el rol de MINTER_ROLE al contrato Faucet
  console.log("Otorgando MINTER_ROLE al contrato Faucet...");
  const grantRoleFaucetTx = await myToken.grantRole(MINTER_ROLE, faucetAddress);
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
  const filesToCopy = ["Faucet.json", "MyToken.json", "Staking.json"];

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
