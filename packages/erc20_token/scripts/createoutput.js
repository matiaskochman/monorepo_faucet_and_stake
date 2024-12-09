const fs = require("fs");
const path = require("path");

// Definir las rutas de las carpetas y archivos
const contractsDir = path.join(__dirname, "..", "contracts"); // Subir una carpeta
const testDir = path.join(__dirname, "..", "test"); // Subir una carpeta
const scriptsDir = path.join(__dirname); // La carpeta actual es scripts
const hardhatConfig = path.join(__dirname, "..", "hardhat.config.js"); // Subir una carpeta
const packageJson = path.join(__dirname, "..", "package.json"); // Subir una carpeta
const outputFile = path.join(__dirname, "..", "output.txt"); // Guardar en el directorio raíz

// Función para obtener los nombres de los archivos en un directorio
const getFilesInDirectory = (dir) => {
  return fs
    .readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile());
};

// Función para leer el contenido de un archivo
const getFileContent = (filePath) => {
  return fs.readFileSync(filePath, "utf-8");
};

// Obtener los archivos de las carpetas
const contractsFiles = getFilesInDirectory(contractsDir).map((file) =>
  path.join("contracts", file)
);
const testFiles = getFilesInDirectory(testDir).map((file) =>
  path.join("test", file)
);

const scriptsFiles = getFilesInDirectory(scriptsDir)
  .filter((file) => file !== "createoutput.js")
  .map((file) => path.join("scripts", file));

// Combinar todos los archivos a escribir en el output
let allFiles = [
  ...contractsFiles,
  ...testFiles,
  ...scriptsFiles,
  "hardhat.config.js",
  "package.json",
];

// Crear un arreglo que contendrá las líneas del archivo de salida
let outputContent = [];

// Iterar sobre cada archivo, añadir el nombre del archivo y su contenido
allFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file); // Ruta completa del archivo
  const fileContent = getFileContent(filePath); // Contenido del archivo

  // Añadir la ruta del archivo como encabezado comentado
  outputContent.push(`// ${file}`);
  outputContent.push(""); // Línea en blanco
  outputContent.push(fileContent); // Añadir el contenido del archivo
  outputContent.push(""); // Línea en blanco entre contenido y separador
  outputContent.push("----------------------"); // Línea divisoria
  outputContent.push(""); // Línea en blanco entre archivos
});

// Escribir el contenido en output.txt
fs.writeFileSync(outputFile, outputContent.join("\n"), "utf-8");

console.log("Archivo output.txt generado con éxito.");
