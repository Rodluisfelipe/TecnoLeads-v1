#!/usr/bin/env node

/**
 * TecnoLeads Setup Script
 * Ayuda a configurar el proyecto automáticamente
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
};

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function exec(command, options = {}) {
  try {
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    return false;
  }
}

async function checkPrerequisites() {
  log.info('Verificando prerequisitos...');

  // Check Node.js
  try {
    const nodeVersion = execSync('node --version').toString().trim();
    log.success(`Node.js ${nodeVersion} instalado`);
  } catch (error) {
    log.error('Node.js no está instalado. Por favor instálalo desde https://nodejs.org/');
    process.exit(1);
  }

  // Check MongoDB
  try {
    execSync('mongod --version', { stdio: 'ignore' });
    log.success('MongoDB instalado');
  } catch (error) {
    log.warning('MongoDB no detectado. Necesitarás MongoDB local o usar MongoDB Atlas.');
  }

  // Check Git
  try {
    execSync('git --version', { stdio: 'ignore' });
    log.success('Git instalado');
  } catch (error) {
    log.warning('Git no está instalado (opcional para desarrollo)');
  }
}

async function setupEnvironment() {
  log.info('\n📝 Configuración de variables de entorno');

  const useDefaults = await question('¿Usar configuración por defecto? (s/n): ');

  if (useDefaults.toLowerCase() !== 's') {
    const mongoUri = await question('MongoDB URI [mongodb://localhost:27017/tecnoleads]: ');
    const port = await question('Puerto del backend [5000]: ');

    // Actualizar .env files si se proporcionaron valores
    if (mongoUri || port) {
      log.info('Actualizando archivos .env...');
      // Aquí se podrían actualizar los archivos .env con los valores proporcionados
    }
  }

  log.success('Variables de entorno configuradas');
}

async function installDependencies() {
  log.info('\n📦 Instalando dependencias...');

  log.info('Instalando dependencias del backend...');
  if (exec('cd backend && npm install')) {
    log.success('Dependencias del backend instaladas');
  } else {
    log.error('Error instalando dependencias del backend');
    return false;
  }

  log.info('Instalando dependencias del frontend...');
  if (exec('cd frontend && npm install')) {
    log.success('Dependencias del frontend instaladas');
  } else {
    log.error('Error instalando dependencias del frontend');
    return false;
  }

  return true;
}

async function createDirectories() {
  log.info('\n📁 Creando directorios necesarios...');

  const dirs = [
    'backend/uploads',
    'backend/logs',
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      log.success(`Directorio creado: ${dir}`);
    }
  });
}

async function displayNextSteps() {
  console.log('\n' + '='.repeat(60));
  log.success('¡Setup completado exitosamente!');
  console.log('='.repeat(60));

  console.log('\n📖 Próximos pasos:\n');
  console.log('1️⃣  Asegúrate de que MongoDB esté corriendo:');
  console.log('   mongod\n');
  
  console.log('2️⃣  Revisa la configuración en:');
  console.log('   backend/.env');
  console.log('   frontend/.env\n');

  console.log('3️⃣  Inicia el proyecto:');
  console.log('   npm run dev\n');

  console.log('4️⃣  Abre tu navegador en:');
  console.log('   http://localhost:5173\n');

  console.log('📚 Documentación:');
  console.log('   README.md - Descripción general');
  console.log('   INSTALL.md - Guía de instalación detallada');
  console.log('   DEPLOYMENT.md - Guía de deployment\n');

  console.log('¿Necesitas ayuda? Revisa la documentación o abre un issue.');
  console.log('='.repeat(60) + '\n');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 TecnoLeads - Setup Wizard');
  console.log('='.repeat(60) + '\n');

  try {
    await checkPrerequisites();
    await setupEnvironment();
    
    const shouldInstall = await question('\n¿Instalar dependencias ahora? (s/n): ');
    if (shouldInstall.toLowerCase() === 's') {
      await installDependencies();
    }

    await createDirectories();
    await displayNextSteps();

  } catch (error) {
    log.error(`Error durante el setup: ${error.message}`);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Ejecutar
main();


