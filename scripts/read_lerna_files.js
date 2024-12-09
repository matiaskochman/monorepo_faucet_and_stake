const fs = require("fs");
const path = require("path");

const filesToCopy = [
  {
    filePath: "./package.json",
    description: "Root package.json",
  },
  {
    filePath: "./packages/erc20_token/package.json",
    description: "ERC20 Token package.json",
  },
  {
    filePath: "./packages/faucet_and_stake_front/package.json",
    description: "Faucet and Stake Front package.json",
  },
  {
    filePath: "./packages/erc20_token/.env",
    description: "ERC20 Token .env",
  },
  {
    filePath: "./packages/faucet_and_stake_front/.env",
    description: "Faucet and Stake Front .env",
  },
  {
    filePath: "./packages/erc20_token/.gitignore",
    description: "ERC20 Token .gitignore",
  },
  {
    filePath: "./packages/faucet_and_stake_front/.gitignore",
    description: "Faucet and Stake Front .gitignore",
  },
  {
    filePath: "./lerna.json",
    description: "Lerna configuration",
  },
];

const outputFilePath = path.join(__dirname, "lerna_conf.txt");

// Crear o limpiar el archivo de salida
fs.writeFileSync(outputFilePath, "", "utf8");

// Leer y copiar cada archivo al archivo de salida
filesToCopy.forEach(({ filePath, description }) => {
  const absolutePath = path.resolve(filePath);

  if (fs.existsSync(absolutePath)) {
    const fileContent = fs.readFileSync(absolutePath, "utf8");
    const output = `
### ${description}
Path: ${absolutePath}

${fileContent}

`;

    fs.appendFileSync(outputFilePath, output, "utf8");
    console.log(`Archivo copiado: ${absolutePath}`);
  } else {
    console.warn(`Archivo no encontrado: ${absolutePath}`);
  }
});

console.log(`Archivos copiados exitosamente a ${outputFilePath}`);
