#!/usr/bin/env node

/**
 * Script de verificación de versión de React
 * Verifica la versión de React instalada en el proyecto
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const frontendPackageJsonPath = join(__dirname, 'frontend/package.json');

try {
  // Leer el archivo package.json del frontend
  const frontendPkg = JSON.parse(readFileSync(frontendPackageJsonPath, 'utf8'));

  // Verificar si existe el objeto dependencies
  if (!frontendPkg.dependencies) {
    console.error('❌ Error: No se encontró el objeto dependencies en frontend/package.json');
    process.exit(1);
  }

  // Verificar si React está en las dependencias
  if (!frontendPkg.dependencies.react) {
    console.error('❌ Error: React no está listado en las dependencias del frontend');
    process.exit(1);
  }

  // Todo OK - mostrar la versión de React
  console.log(`✅ React ${frontendPkg.dependencies.react} instalado`);
  
  // Información adicional sobre React DOM
  if (frontendPkg.dependencies['react-dom']) {
    console.log(`✅ React DOM ${frontendPkg.dependencies['react-dom']} instalado`);
  }

  process.exit(0);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error('❌ Error: No se encontró el archivo frontend/package.json');
  } else if (error instanceof SyntaxError) {
    console.error('❌ Error: El archivo frontend/package.json tiene errores de sintaxis JSON');
  } else {
    console.error('❌ Error: No se pudo verificar la versión de React');
    console.error(error.message);
  }
  process.exit(1);
}
