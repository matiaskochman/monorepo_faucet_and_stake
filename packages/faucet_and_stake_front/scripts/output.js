// Path: ./output.js
import {
  readdirSync,
  statSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath } from "url";

// Obtener __dirname a partir de import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directorios y configuraciones
const srcDir = join(process.cwd(), "src");
const outputFile = join(__dirname, "output.txt"); // Se crea output.txt junto a output.js
const excludeDirs = ["fonts", "abis", "styles"];
const excludeFiles = [
  "favicon.ico",
  "globals.css",
  "layout.tsx",
  "readFiles.js",
  "web3Utils.ts",
];
const rootFiles = [
  // ".env",
  // "tsconfig.json",
  // "package.json",
  // "next.config.mjs",
  // "tailwind.config.ts",
];

// Crear el archivo de salida si no existe
if (!existsSync(outputFile)) {
  writeFileSync(outputFile, ""); // Crear archivo vacío
}

/**
 * Función para filtrar líneas comentadas de un contenido.
 * Elimina las líneas que empiezan con '//' o que forman parte de un bloque de comentario.
 */
function filterCommentedLines(content) {
  const lines = content.split("\n");
  const filtered = [];
  let inBlockComment = false;

  for (let line of lines) {
    const trimmed = line.trim();
    // Si ya estamos dentro de un bloque de comentario, buscar el final y saltar la línea
    if (inBlockComment) {
      if (trimmed.endsWith("*/")) {
        inBlockComment = false;
      }
      continue;
    }
    // Saltar líneas que empiezan con comentario de línea
    if (trimmed.startsWith("//")) {
      continue;
    }
    // Si la línea inicia un bloque de comentario, saltarla y cambiar el estado
    if (trimmed.startsWith("/*")) {
      if (!trimmed.endsWith("*/")) {
        inBlockComment = true;
      }
      continue;
    }
    filtered.push(line);
  }
  return filtered.join("\n");
}

/**
 * Función para copiar archivos y agregar contenido (sin líneas comentadas)
 * al archivo de salida.
 */
const copyToOutputFile = (dir) => {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        copyToOutputFile(filePath); // Recursivamente procesar subdirectorios
      }
    } else if (!excludeFiles.includes(file)) {
      const relativePath = relative(process.cwd(), filePath);
      const fileContent = readFileSync(filePath, "utf-8");
      const filteredContent = filterCommentedLines(fileContent);

      // Agregar el path del archivo y el contenido filtrado al archivo de salida
      writeFileSync(
        outputFile,
        `// Path: ${relativePath}\n\n${filteredContent}\n\n`,
        { flag: "a" }
      );
    }
  });
};

// Procesar archivos de la raíz (si se descomentan los elementos en rootFiles)
rootFiles.forEach((file) => {
  const filePath = join(process.cwd(), file);

  if (existsSync(filePath)) {
    const relativePath = relative(process.cwd(), filePath);
    const fileContent = readFileSync(filePath, "utf-8");
    const filteredContent = filterCommentedLines(fileContent);

    // Agregar el path del archivo y el contenido filtrado al archivo de salida
    writeFileSync(
      outputFile,
      `// Path: ${relativePath}\n\n${filteredContent}\n\n`,
      { flag: "a" }
    );
  }
});

// Procesar los archivos en el directorio `src`
copyToOutputFile(srcDir);

console.log(`Todos los archivos han sido copiados a ${outputFile}`);
