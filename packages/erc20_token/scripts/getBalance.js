const hre = require("hardhat");

async function main() {
  // Obtener los signers disponibles (cuentas)
  console.log("Obteniendo signers...");
  const [owner] = await hre.ethers.getSigners();
  console.log(`Signer (owner): ${owner.address}`);

  // Verificar si la dirección del contrato es correcta
  const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Reemplaza con la dirección de tu contrato PesosArgToken
  console.log(`Dirección del contrato PesosArgToken: ${tokenAddress}`);

  const tokenABI = [
    "function balanceOf(address account) view returns (uint256)",
  ];

  // Crear una instancia del contrato con ethers
  console.log("Creando la instancia del contrato PesosArgToken...");
  const tokenContract = new hre.ethers.Contract(tokenAddress, tokenABI, owner);

  // Intentar obtener el balance
  console.log(`Obteniendo balance del owner: ${owner.address}`);
  try {
    const balance = await tokenContract.balanceOf(owner.address);
    console.log(`Balance obtenido: ${balance.toString()}`);
    console.log(
      `Balance de PesosArgToken: ${hre.ethers.utils.formatUnits(
        balance,
        18
      )} tokens`
    );
  } catch (error) {
    console.error("Error al obtener el balance:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error en la ejecución del script:", error);
    process.exit(1);
  });
