/**
 * Copia para src/assets os arquivos estáticos necessários para o
 * @capacitor-community/sqlite funcionar no navegador (ng serve / build web):
 *
 * 1) sql-wasm.wasm (do pacote sql.js) - motor SQLite compilado para WASM.
 * 2) A pasta dist/jeep-sqlite (do pacote jeep-sqlite) - o web component
 *    "jeep-sqlite", carregado via <script type="module"> no index.html
 *    (ver src/index.html). Carregar dessa forma - em vez de importar via
 *    TypeScript/bundler - evita problemas de bundling (esbuild) e de
 *    timing de inicialização do Stencil dentro do Angular.
 *
 * É executado automaticamente após "npm install" (script "postinstall" no
 * package.json), mas também pode ser rodado manualmente com:
 *   node scripts/copy-web-assets.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const assetsDir = path.join(root, 'src', 'assets');

function copyFile(source, dest) {
  if (!fs.existsSync(source)) {
    console.warn(`[copy-web-assets] Aviso: não encontrado: ${source}`);
    return false;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(source, dest);
  return true;
}

function copyDir(source, dest) {
  if (!fs.existsSync(source)) {
    console.warn(`[copy-web-assets] Aviso: pasta não encontrada: ${source}`);
    return false;
  }
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const s = path.join(source, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
  return true;
}

try {
  const wasmOk = copyFile(
    path.join(root, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm'),
    path.join(assetsDir, 'sql-wasm.wasm')
  );
  if (wasmOk) {
    console.log('[copy-web-assets] sql-wasm.wasm copiado para src/assets/.');
  }

  const jeepOk = copyDir(
    path.join(root, 'node_modules', 'jeep-sqlite', 'dist', 'jeep-sqlite'),
    path.join(assetsDir, 'jeep-sqlite')
  );
  if (jeepOk) {
    console.log('[copy-web-assets] jeep-sqlite copiado para src/assets/jeep-sqlite/.');
  }
} catch (err) {
  console.error('[copy-web-assets] Erro ao copiar arquivos:', err);
  process.exit(0); // não falha o npm install por causa disso
}
